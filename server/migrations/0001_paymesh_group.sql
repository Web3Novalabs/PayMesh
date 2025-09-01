--paymesh_group
-- What: Core group information
-- When inserted: When someone creates a new payment group
-- Example: User creates "Team Dev Fund" → insert group record
CREATE TABLE paymesh_group (
    group_address VARCHAR(66) PRIMARY KEY 
        CHECK (group_address ~ '^0x[a-fA-F0-9]{64}$'),
    group_name VARCHAR(100) NOT NULL,
    creator_address VARCHAR(66) NOT NULL 
        CHECK (creator_address ~ '^0x[a-fA-F0-9]{64}$'),
    usage_remaining NUMERIC(20,0) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paymesh_group_creator ON paymesh_group (creator_address);
CREATE INDEX idx_paymesh_group_created_at ON paymesh_group (created_at);

-- group_token_amounts
-- What: The actual token amounts for each payment
-- When inserted: Immediately after inserting into group_payments
-- Example: Alice's payment contained 1.5 ETH + 1000 USDC → insert 2 rows here
CREATE TABLE group_token_amounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_address VARCHAR(66) NOT NULL,
    token_symbol VARCHAR(10) NOT NULL, 
    token_address VARCHAR(66), 
    amount NUMERIC(36,18) NOT NULL DEFAULT 0, 
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_group_balance 
        FOREIGN KEY (group_address) 
        REFERENCES paymesh_group (group_address) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_group_token UNIQUE (group_address, token_symbol)
);

CREATE INDEX idx_group_token_amounts_group ON group_token_amounts (group_address);

-- group_payments
-- What: Records of incoming payments (without amounts)
-- When inserted: When someone sends money to a group
-- Example: Alice sends payment to group → insert payment record with tx hash
-- main payments table when a group is created and money is sent to the group
CREATE TABLE group_payments (
    transaction_hash VARCHAR(66) PRIMARY KEY,
    group_address VARCHAR(66) NOT NULL,
    sender_address VARCHAR(66) NOT NULL 
        CHECK (sender_address ~ '^0x[a-fA-F0-9]{64}$'),
    token_address VARCHAR(66) NOT NULL,
    amount NUMERIC(36,18) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_group_payment 
        FOREIGN KEY (group_address) 
        REFERENCES paymesh_group (group_address) 
        ON DELETE CASCADE
);

CREATE INDEX idx_group_payments_group ON group_payments (group_address);
CREATE INDEX idx_group_payments_sender ON group_payments (sender_address);

CREATE INDEX idx_group_payments_paid_at ON group_payments (paid_at);


-- group_payment_members
-- What: Who's in each group and their split percentages
-- When inserted: When adding members to a group
-- Example: Add Bob (30%), Carol (70%) to "Team Dev Fund"
CREATE TABLE group_payment_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_address VARCHAR(66) NOT NULL,
    member_address VARCHAR(66) NOT NULL 
        CHECK (member_address ~ '^0x[a-fA-F0-9]{64}$'),
    member_percentage NUMERIC(5,2) NOT NULL 
        CHECK (member_percentage > 0 AND member_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_group_member 
        FOREIGN KEY (group_address) 
        REFERENCES paymesh_group (group_address) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_group_member UNIQUE (group_address, member_address)
);

CREATE INDEX idx_group_members_group ON group_payment_members (group_address);
CREATE INDEX idx_group_members_member ON group_payment_members (member_address);

-- payment_distributions
-- What: Individual payouts to each member
-- When inserted: When you distribute a payment
-- Example: Alice's payment gets split → Bob gets 0.45 ETH, Carol gets 1.05 ETH
CREATE TABLE payment_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_hash VARCHAR(66),
    member_address VARCHAR(66) NOT NULL,
    group_address VARCHAR(66) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    token_amount NUMERIC(36,18) NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_payment_distribution 
        FOREIGN KEY (transaction_hash) 
        REFERENCES group_payments (transaction_hash) 
        ON DELETE CASCADE
);

CREATE INDEX idx_payment_distributions_payment ON payment_distributions (payment_id);
CREATE INDEX idx_payment_distributions_member ON payment_distributions (member_address);
CREATE INDEX idx_payment_distributions_group ON payment_distributions (group_address);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paymesh_group_updated_at 
    BEFORE UPDATE ON paymesh_group 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();



CREATE OR REPLACE FUNCTION initialize_group_tokens()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_token_amounts (
        group_address, 
        token_symbol, 
        token_address, 
        amount
    ) VALUES 
    (NEW.group_address, 'USDT', '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', 0),
    
    (NEW.group_address, 'ETH', '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 0),
    
    (NEW.group_address, 'STRK', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_group_token_records
    AFTER INSERT ON paymesh_group
    FOR EACH ROW
    EXECUTE FUNCTION initialize_group_tokens();


-- groups - inserted when a group is created
CREATE TABLE groups (
    group_address VARCHAR(66) PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_by VARCHAR(66) NOT NULL,
    usage_remaining NUMERIC(20,0) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_created_by ON groups (created_by);
CREATE INDEX idx_groupsx_created_at ON groups (created_at);

-- group_tx_hashes - inserted when a payment is made
CREATE TABLE group_tx_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_address VARCHAR(66) NOT NULL,
    from_address VARCHAR(66) NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    token_amount NUMERIC(70,0) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_group_tx_hash
        FOREIGN KEY (group_address)
        REFERENCES groups (group_address)
        ON DELETE CASCADE
);

CREATE INDEX idx_group_tx_hashes_group ON group_tx_hashes (group_address);
CREATE INDEX idx_group_tx_hashes_tx ON group_tx_hashes (tx_hash);

-- payments - inserted when a payment is made
CREATE TABLE payments (
    tx_hash VARCHAR(66) PRIMARY KEY,
    group_address VARCHAR(66) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    amount NUMERIC(70,0) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_group_payment
        FOREIGN KEY (group_address)
        REFERENCES groups (group_address)
        ON DELETE CASCADE
);

CREATE INDEX idx_group_payments_group ON payments (group_address);

CREATE INDEX idx_group_payments_paid_at ON payments (paid_at);

-- group_token_history - inserted when a payment made to keep track of how much was paid and in which token
CREATE TABLE group_token_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_address VARCHAR(66) NOT NULL,
    token_symbol VARCHAR(10) NOT NULL, 
    token_address VARCHAR(66), 
    amount NUMERIC(70,0) NOT NULL DEFAULT 0, 
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_group_balance 
        FOREIGN KEY (group_address) 
        REFERENCES groups (group_address) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_group_token UNIQUE (group_address, token_address, token_symbol)
);

CREATE INDEX idx_group_token_history_group ON group_token_history (group_address);



-- group_members - inserted when adding members to a group
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_address VARCHAR(66) NOT NULL,
    member_address VARCHAR(66) NOT NULL,
    member_percentage NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_group_member 
        FOREIGN KEY (group_address) 
        REFERENCES groups (group_address) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_group_member UNIQUE (group_address, member_address)
);

CREATE INDEX idx_group_members_group ON group_members (group_address);
CREATE INDEX idx_group_members_member ON group_members (member_address);

-- distributions_history - inserted when a payment is distributed to members
CREATE TABLE distributions_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_address VARCHAR(66) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL, 
    member_address VARCHAR(66) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    token_amount NUMERIC(70,0) NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payment_distribution
        FOREIGN KEY (tx_hash)
        REFERENCES payments (tx_hash)
        ON DELETE SET NULL,

    CONSTRAINT fk_group_distribution
        FOREIGN KEY (group_address)
        REFERENCES groups (group_address)
        ON DELETE SET NULL

    
);

CREATE INDEX idx_distributions_history_payment ON distributions_history (tx_hash);
CREATE INDEX idx_distributions_history_member ON distributions_history (member_address);
CREATE INDEX idx_distributions_history_group ON distributions_history (group_address);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_group_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_token_history_updated_at 
    BEFORE UPDATE ON group_token_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();



CREATE OR REPLACE FUNCTION initialize_group_tokens_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_token_history (
        group_address, 
        token_symbol, 
        token_address, 
        amount
    ) VALUES 
    (NEW.group_address, 'USDT', '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', 0),
    
    (NEW.group_address, 'USDC', '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', 0),

    (NEW.group_address, 'ETH', '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 0),
    
    (NEW.group_address, 'STRK', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_group_token_records
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION initialize_group_tokens_history();


CREATE TABLE crowd_funding (
    id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pool_address VARCHAR(66) NOT NULL UNIQUE,
    creator_address VARCHAR(66) NOT NULL,
    target_amount NUMERIC(70,0) NOT NULL,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crowd_funding_pool_address ON crowd_funding(pool_address);
CREATE INDEX idx_crowd_funding_creator_address ON crowd_funding(creator_address);
CREATE INDEX idx_crowd_funding_target_amount ON crowd_funding(target_amount);
CREATE INDEX idx_crowd_funding_is_complete ON crowd_funding(is_complete);

CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    crowd_funding_id INTEGER NOT NULL REFERENCES crowd_funding(id),
    donor_address VARCHAR(66) NOT NULL,
    amount NUMERIC(70,0) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_crowd_funding 
        FOREIGN KEY (crowd_funding_id) 
        REFERENCES crowd_funding(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_donations_crowd_funding_id ON donations(crowd_funding_id);
CREATE INDEX idx_donations_donor_address ON donations(donor_address);
CREATE INDEX idx_donations_token_address ON donations(token_address);

CREATE TABLE crowd_funding_token_balances (
    id SERIAL PRIMARY KEY,
    crowd_funding_id INTEGER NOT NULL REFERENCES crowd_funding(id),
    token_address VARCHAR(66) NOT NULL,
    total_amount NUMERIC(70,0) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_crowd_funding_balance 
        FOREIGN KEY (crowd_funding_id) 
        REFERENCES crowd_funding(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_crowd_funding_token 
        UNIQUE (crowd_funding_id, token_address)
);

CREATE INDEX idx_token_balances_crowd_funding_id ON crowd_funding_token_balances(crowd_funding_id);

CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    crowd_funding_id INTEGER NOT NULL REFERENCES crowd_funding(id),
    withdrawn_by VARCHAR(66) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    amount NUMERIC(70,0) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_crowd_funding_withdrawal 
        FOREIGN KEY (crowd_funding_id) 
        REFERENCES crowd_funding(id) 
        ON DELETE CASCADE
);

CREATE TABLE supported_crowd_funding_tokens (
    token_address VARCHAR(66) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_withdrawals_crowd_funding_id ON withdrawals(crowd_funding_id);
CREATE INDEX idx_withdrawals_withdrawn_by ON withdrawals(withdrawn_by);

CREATE OR REPLACE FUNCTION update_crowd_funding_token_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_crowd_funding_token_balances_updated_at
BEFORE UPDATE ON crowd_funding_token_balances
FOR EACH ROW
EXECUTE FUNCTION update_crowd_funding_token_balances_updated_at();

CREATE OR REPLACE FUNCTION update_crowd_funding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_crowd_funding_updated_at
BEFORE UPDATE ON crowd_funding
FOR EACH ROW
EXECUTE FUNCTION update_crowd_funding_updated_at();


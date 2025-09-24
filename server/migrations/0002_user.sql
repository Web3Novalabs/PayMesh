CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    password VARCHAR(100) NOT NULL,
    verified VARCHAR(50) NOT NULL DEFAULT 'false',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_wallet_address_idx ON users (wallet_address);

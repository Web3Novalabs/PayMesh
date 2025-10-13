CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) REFERENCES users(email),
    api_key_hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    num_of_usages INT NOT NULL DEFAULT 0,
    last_used TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX api_keys_user_email_idx ON api_keys (user_email);
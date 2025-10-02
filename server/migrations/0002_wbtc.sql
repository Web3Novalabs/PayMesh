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
    
    (NEW.group_address, 'STRK', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 0),

    (NEW.group_address, 'WBTC', '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac', 0);

    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

INSERT INTO group_token_history (group_address, token_symbol, token_address, amount)
SELECT DISTINCT group_address,
       'WBTC',
       '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
       0
FROM group_token_history
WHERE group_address NOT IN (
    SELECT group_address FROM group_token_history WHERE token_symbol = 'WBTC'
);

ALTER TABLE group_members
    ALTER COLUMN member_percentage TYPE FLOAT USING member_percentage::FLOAT;

CREATE TABLE paymesh_group (
    group_address varchar(255) primary key,
        usage_remaining numeric not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz
);

create unique index idx_group_address on paymesh_group (group_address);
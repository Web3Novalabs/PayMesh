export const POOL_ABI = [
  {
    name: "crowdfund",
    type: "impl",
    interface_name: "contract::interfaces::icrowdfund::ICrowdFund",
  },
  {
    name: "core::byte_array::ByteArray",
    type: "struct",
    members: [
      {
        name: "data",
        type: "core::array::Array::<core::bytes_31::bytes31>",
      },
      {
        name: "pending_word",
        type: "core::felt252",
      },
      {
        name: "pending_word_len",
        type: "core::integer::u32",
      },
    ],
  },
  {
    name: "core::integer::u256",
    type: "struct",
    members: [
      {
        name: "low",
        type: "core::integer::u128",
      },
      {
        name: "high",
        type: "core::integer::u128",
      },
    ],
  },
  {
    name: "core::bool",
    type: "enum",
    variants: [
      {
        name: "False",
        type: "()",
      },
      {
        name: "True",
        type: "()",
      },
    ],
  },
  {
    name: "contract::base::crowd_fund_type::Pool",
    type: "struct",
    members: [
      {
        name: "id",
        type: "core::integer::u256",
      },
      {
        name: "name",
        type: "core::byte_array::ByteArray",
      },
      {
        name: "target",
        type: "core::integer::u256",
      },
      {
        name: "creator",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "create_at",
        type: "core::integer::u64",
      },
      {
        name: "balance",
        type: "core::integer::u256",
      },
      {
        name: "beneficiary",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "donors",
        type: "core::integer::u256",
      },
      {
        name: "pool_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "is_complete",
        type: "core::bool",
      },
    ],
  },
  {
    name: "contract::base::crowd_fund_type::Token",
    type: "struct",
    members: [
      {
        name: "pool_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "usdc",
        type: "core::integer::u256",
      },
      {
        name: "usdt",
        type: "core::integer::u256",
      },
      {
        name: "strk",
        type: "core::integer::u256",
      },
      {
        name: "eth",
        type: "core::integer::u256",
      },
    ],
  },
  {
    name: "contract::interfaces::icrowdfund::ICrowdFund",
    type: "interface",
    items: [
      {
        name: "create_pool",
        type: "function",
        inputs: [
          {
            name: "name",
            type: "core::byte_array::ByteArray",
          },
          {
            name: "target_amount",
            type: "core::integer::u256",
          },
          {
            name: "beneficiary",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "upgrade",
        type: "function",
        inputs: [
          {
            name: "new_class_hash",
            type: "core::starknet::class_hash::ClassHash",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "paymesh",
        type: "function",
        inputs: [
          {
            name: "pool_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "get_all_pools",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::array::Array::<contract::base::crowd_fund_type::Pool>",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "get_pool",
        type: "function",
        inputs: [
          {
            name: "pool_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "contract::base::crowd_fund_type::Pool",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "paymesh_donate",
        type: "function",
        inputs: [
          {
            name: "pool_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "get_donor_count",
        type: "function",
        inputs: [
          {
            name: "pool_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "get_pool_balance",
        type: "function",
        inputs: [
          {
            name: "pool_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "get_pool_token_balance",
        type: "function",
        inputs: [
          {
            name: "pool_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "contract::base::crowd_fund_type::Token",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "get_pool_target",
        type: "function",
        inputs: [
          {
            name: "pool_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "is_pool_completed",
        type: "function",
        inputs: [
          {
            name: "pool_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "set_platform_percentage",
        type: "function",
        inputs: [
          {
            name: "value",
            type: "core::integer::u256",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "get_platform_percentage",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "set_supported_token",
        type: "function",
        inputs: [
          {
            name: "new_token_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "get_supported_token",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::array::Array::<core::starknet::contract_address::ContractAddress>",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "upgrade_child",
        type: "function",
        inputs: [
          {
            name: "new_class_hash",
            type: "core::starknet::class_hash::ClassHash",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    name: "OwnableMixinImpl",
    type: "impl",
    interface_name: "openzeppelin_access::ownable::interface::OwnableABI",
  },
  {
    name: "openzeppelin_access::ownable::interface::OwnableABI",
    type: "interface",
    items: [
      {
        name: "owner",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "transfer_ownership",
        type: "function",
        inputs: [
          {
            name: "new_owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "renounce_ownership",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "transferOwnership",
        type: "function",
        inputs: [
          {
            name: "newOwner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "renounceOwnership",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    name: "AccessControlImpl",
    type: "impl",
    interface_name:
      "openzeppelin_access::accesscontrol::interface::IAccessControl",
  },
  {
    name: "openzeppelin_access::accesscontrol::interface::IAccessControl",
    type: "interface",
    items: [
      {
        name: "has_role",
        type: "function",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "get_role_admin",
        type: "function",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "grant_role",
        type: "function",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "revoke_role",
        type: "function",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "renounce_role",
        type: "function",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    name: "SRC5Impl",
    type: "impl",
    interface_name: "openzeppelin_introspection::interface::ISRC5",
  },
  {
    name: "openzeppelin_introspection::interface::ISRC5",
    type: "interface",
    items: [
      {
        name: "supports_interface",
        type: "function",
        inputs: [
          {
            name: "interface_id",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    name: "constructor",
    type: "constructor",
    inputs: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "token_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "emergency_withdraw_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "child_contract_class_hash",
        type: "core::starknet::class_hash::ClassHash",
      },
    ],
  },
  {
    kind: "struct",
    name: "contract::base::events::PoolCreated",
    type: "event",
    members: [
      {
        kind: "key",
        name: "pool_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "pool_id",
        type: "core::integer::u256",
      },
      {
        kind: "data",
        name: "creator",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "pool_name",
        type: "core::byte_array::ByteArray",
      },
      {
        kind: "data",
        name: "target_amount",
        type: "core::integer::u256",
      },
    ],
  },
  {
    kind: "struct",
    name: "contract::base::events::PoolPaid",
    type: "event",
    members: [
      {
        kind: "key",
        name: "pool_id",
        type: "core::integer::u256",
      },
      {
        kind: "data",
        name: "amount",
        type: "core::integer::u256",
      },
      {
        kind: "data",
        name: "paid_by",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "paid_at",
        type: "core::integer::u64",
      },
      {
        kind: "data",
        name: "token_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
    type: "event",
    members: [
      {
        kind: "data",
        name: "class_hash",
        type: "core::starknet::class_hash::ClassHash",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Upgraded",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    type: "event",
    members: [
      {
        kind: "key",
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    type: "event",
    members: [
      {
        kind: "key",
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "OwnershipTransferred",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
      },
      {
        kind: "nested",
        name: "OwnershipTransferStarted",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
    type: "event",
    members: [
      {
        kind: "data",
        name: "role",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
    type: "event",
    members: [
      {
        kind: "data",
        name: "role",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
    type: "event",
    members: [
      {
        kind: "data",
        name: "role",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "previous_admin_role",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "new_admin_role",
        type: "core::felt252",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "RoleGranted",
        type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
      },
      {
        kind: "nested",
        name: "RoleRevoked",
        type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
      },
      {
        kind: "nested",
        name: "RoleAdminChanged",
        type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_introspection::src5::SRC5Component::Event",
    type: "event",
    variants: [],
  },
  {
    kind: "enum",
    name: "contract::crowd_fund::CrowdFund::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "PoolCreated",
        type: "contract::base::events::PoolCreated",
      },
      {
        kind: "nested",
        name: "PoolPaid",
        type: "contract::base::events::PoolPaid",
      },
      {
        kind: "flat",
        name: "UpgradeableEvent",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
      },
      {
        kind: "flat",
        name: "OwnableEvent",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
      },
      {
        kind: "flat",
        name: "AccessControlEvent",
        type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
      },
      {
        kind: "flat",
        name: "SRC5Event",
        type: "openzeppelin_introspection::src5::SRC5Component::Event",
      },
    ],
  },
];

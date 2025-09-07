import type { Abi } from "@apibara/starknet";

export const myAbi =[
  {
    "type": "impl",
    "name": "autoshare",
    "interface_name": "contract::interfaces::iautoshare::IAutoShare"
  },
  {
    "type": "struct",
    "name": "core::byte_array::ByteArray",
    "members": [
      {
        "name": "data",
        "type": "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        "name": "pending_word",
        "type": "core::felt252"
      },
      {
        "name": "pending_word_len",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "type": "struct",
    "name": "contract::base::types::GroupMember",
    "members": [
      {
        "name": "addr",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "percentage",
        "type": "core::integer::u8"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "contract::base::types::Group",
    "members": [
      {
        "name": "id",
        "type": "core::integer::u256"
      },
      {
        "name": "name",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "usage_limit_reached",
        "type": "core::bool"
      },
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "group_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "date",
        "type": "core::integer::u64"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "type": "interface",
    "name": "contract::interfaces::iautoshare::IAutoShare",
    "items": [
      {
        "type": "function",
        "name": "create_group",
        "inputs": [
          {
            "name": "name",
            "type": "core::byte_array::ByteArray"
          },
          {
            "name": "members",
            "type": "core::array::Array::<contract::base::types::GroupMember>"
          },
          {
            "name": "usage_count",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_group",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "contract::base::types::Group"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_group_address",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_all_groups",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Array::<contract::base::types::Group>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_groups_by_usage_limit_reached",
        "inputs": [
          {
            "name": "usage_limit_reached",
            "type": "core::bool"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<contract::base::types::Group>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_groups_created_by_address",
        "inputs": [
          {
            "name": "address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<contract::base::types::Group>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_group_member",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<contract::base::types::GroupMember>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "top_subscription",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          },
          {
            "name": "new_planned_usage_count",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_group_usage_fee",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_group_usage_fee",
        "inputs": [
          {
            "name": "group_usage_fee",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_group_update_fee",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_group_update_fee",
        "inputs": [
          {
            "name": "group_update_fee",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_group_usage_paid_history",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::integer::u256>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_group_usage_paid",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_group_usage_count",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "group_address_has_shares_in",
        "inputs": [
          {
            "name": "address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<contract::base::types::Group>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_supported_token",
        "inputs": [
          {
            "name": "new_token_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_supported_token",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Array::<core::starknet::contract_address::ContractAddress>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "upgrade",
        "inputs": [
          {
            "name": "new_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "paymesh",
        "inputs": [
          {
            "name": "group_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_group_balance",
        "inputs": [
          {
            "name": "group_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "request_group_update",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          },
          {
            "name": "new_name",
            "type": "core::byte_array::ByteArray"
          },
          {
            "name": "new_members",
            "type": "core::array::Array::<contract::base::types::GroupMember>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "withdraw",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "OwnableMixinImpl",
    "interface_name": "openzeppelin_access::ownable::interface::OwnableABI"
  },
  {
    "type": "interface",
    "name": "openzeppelin_access::ownable::interface::OwnableABI",
    "items": [
      {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "transfer_ownership",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "renounce_ownership",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
          {
            "name": "newOwner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "AccessControlImpl",
    "interface_name": "openzeppelin_access::accesscontrol::interface::IAccessControl"
  },
  {
    "type": "interface",
    "name": "openzeppelin_access::accesscontrol::interface::IAccessControl",
    "items": [
      {
        "type": "function",
        "name": "has_role",
        "inputs": [
          {
            "name": "role",
            "type": "core::felt252"
          },
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_role_admin",
        "inputs": [
          {
            "name": "role",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "grant_role",
        "inputs": [
          {
            "name": "role",
            "type": "core::felt252"
          },
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "revoke_role",
        "inputs": [
          {
            "name": "role",
            "type": "core::felt252"
          },
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "renounce_role",
        "inputs": [
          {
            "name": "role",
            "type": "core::felt252"
          },
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "SRC5Impl",
    "interface_name": "openzeppelin_introspection::interface::ISRC5"
  },
  {
    "type": "interface",
    "name": "openzeppelin_introspection::interface::ISRC5",
    "items": [
      {
        "type": "function",
        "name": "supports_interface",
        "inputs": [
          {
            "name": "interface_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "token_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "emergency_withdraw_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "child_contract_class_hash",
        "type": "core::starknet::class_hash::ClassHash"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::base::events::GroupCreated",
    "kind": "struct",
    "members": [
      {
        "name": "group_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "group_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "name",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "usage_count",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "members",
        "type": "core::array::Array::<contract::base::types::GroupMember>",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::base::events::GroupUpdateRequested",
    "kind": "struct",
    "members": [
      {
        "name": "group_id",
        "type": "core::integer::u256",
        "kind": "key"
      },
      {
        "name": "requester",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "new_name",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::base::events::GroupUpdateApproved",
    "kind": "struct",
    "members": [
      {
        "name": "group_id",
        "type": "core::integer::u256",
        "kind": "key"
      },
      {
        "name": "approver",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "approval_count",
        "type": "core::integer::u8",
        "kind": "data"
      },
      {
        "name": "total_members",
        "type": "core::integer::u8",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::base::events::GroupUpdated",
    "kind": "struct",
    "members": [
      {
        "name": "group_id",
        "type": "core::integer::u256",
        "kind": "key"
      },
      {
        "name": "old_name",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "new_name",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
    "kind": "struct",
    "members": [
      {
        "name": "class_hash",
        "type": "core::starknet::class_hash::ClassHash",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "Upgraded",
        "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    "kind": "struct",
    "members": [
      {
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    "kind": "struct",
    "members": [
      {
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "OwnershipTransferred",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
        "kind": "nested"
      },
      {
        "name": "OwnershipTransferStarted",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
    "kind": "struct",
    "members": [
      {
        "name": "role",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "sender",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
    "kind": "struct",
    "members": [
      {
        "name": "role",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "sender",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
    "kind": "struct",
    "members": [
      {
        "name": "role",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "previous_admin_role",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "new_admin_role",
        "type": "core::felt252",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "RoleGranted",
        "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
        "kind": "nested"
      },
      {
        "name": "RoleRevoked",
        "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
        "kind": "nested"
      },
      {
        "name": "RoleAdminChanged",
        "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_introspection::src5::SRC5Component::Event",
    "kind": "enum",
    "variants": []
  },
  {
    "type": "struct",
    "name": "contract::base::events::MemberShare",
    "members": [
      {
        "name": "addr",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "share",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::base::events::GroupPaid",
    "kind": "struct",
    "members": [
      {
        "name": "group_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "paid_by",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "paid_at",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "members",
        "type": "core::array::Array::<contract::base::events::MemberShare>",
        "kind": "data"
      },
      {
        "name": "usage_count",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::base::events::SubscriptionTopped",
    "kind": "struct",
    "members": [
      {
        "name": "group_id",
        "type": "core::integer::u256",
        "kind": "key"
      },
      {
        "name": "usage_count",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::autoshare::AutoShare::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "GroupCreated",
        "type": "contract::base::events::GroupCreated",
        "kind": "nested"
      },
      {
        "name": "GroupUpdateRequested",
        "type": "contract::base::events::GroupUpdateRequested",
        "kind": "nested"
      },
      {
        "name": "GroupUpdateApproved",
        "type": "contract::base::events::GroupUpdateApproved",
        "kind": "nested"
      },
      {
        "name": "GroupUpdated",
        "type": "contract::base::events::GroupUpdated",
        "kind": "nested"
      },
      {
        "name": "UpgradeableEvent",
        "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
        "kind": "flat"
      },
      {
        "name": "OwnableEvent",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
        "kind": "flat"
      },
      {
        "name": "AccessControlEvent",
        "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
        "kind": "flat"
      },
      {
        "name": "SRC5Event",
        "type": "openzeppelin_introspection::src5::SRC5Component::Event",
        "kind": "flat"
      },
      {
        "name": "GroupPaid",
        "type": "contract::base::events::GroupPaid",
        "kind": "nested"
      },
      {
        "name": "SubscriptionTopped",
        "type": "contract::base::events::SubscriptionTopped",
        "kind": "nested"
      }
    ]
  }
] as const satisfies Abi;
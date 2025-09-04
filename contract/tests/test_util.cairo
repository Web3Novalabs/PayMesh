use contract::autoshare_child::{IAutoshareChildDispatcher, IAutoshareChildDispatcherTrait};
use contract::base::types::GroupMember;
use contract::interfaces::iautoshare::{IAutoShareDispatcher, IAutoShareDispatcherTrait};
use contract::interfaces::icrowdfund::{ICrowdFundDispatcher, ICrowdFundDispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{ContractClassTrait, DeclareResultTrait, declare};
use starknet::{ClassHash, ContractAddress};
const ADMIN_CONST: felt252 = 123;
const SECOND_ADMIN_CONST: felt252 = 123;
const CREATOR_CONST: felt252 = 456;
const USER1_CONST: felt252 = 101112;
const USER2_CONST: felt252 = 131415;
const USER3_CONST: felt252 = 1314164;
const TOKEN_CONST: felt252 = 13141324;
const USER4_CONST: felt252 = 10111234;
const USER5_CONST: felt252 = 13141513;
const USER6_CONST: felt252 = 1314162454;
const USER7_CONST: felt252 = 1314132354;
const EMERGENCY_WITHDRAW_CONST: felt252 = 13141325;

pub fn ADMIN_ADDR() -> ContractAddress {
    ADMIN_CONST.try_into().unwrap()
}

pub fn SECOND_ADMIN_ADDR() -> ContractAddress {
    SECOND_ADMIN_CONST.try_into().unwrap()
}

pub fn CREATOR_ADDR() -> ContractAddress {
    CREATOR_CONST.try_into().unwrap()
}

pub fn USER1_ADDR() -> ContractAddress {
    USER1_CONST.try_into().unwrap()
}

pub fn USER2_ADDR() -> ContractAddress {
    USER2_CONST.try_into().unwrap()
}

pub fn USER3_ADDR() -> ContractAddress {
    USER3_CONST.try_into().unwrap()
}

pub fn TOKEN_ADDR() -> ContractAddress {
    TOKEN_CONST.try_into().unwrap()
}

pub fn USER4_ADDR() -> ContractAddress {
    USER4_CONST.try_into().unwrap()
}

pub fn USER5_ADDR() -> ContractAddress {
    USER5_CONST.try_into().unwrap()
}

pub fn USER6_ADDR() -> ContractAddress {
    USER6_CONST.try_into().unwrap()
}

pub fn USER7_ADDR() -> ContractAddress {
    USER7_CONST.try_into().unwrap()
}

pub fn EMERGENCY_WITHDRAW_ADDR() -> ContractAddress {
    EMERGENCY_WITHDRAW_CONST.try_into().unwrap()
}

pub const ONE_STRK: u256 = 1_000_000_000_000_000_000;

// pub fn deploy_autoshare_contract() -> (IAutoShareDispatcher, IERC20Dispatcher) {
//     let erc20_class = declare("STARKTOKEN").unwrap().contract_class();
//     let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
//     let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
//     let erc20_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

//     let child_contract: ClassHash =
//     *declare("AutoshareChild").unwrap().contract_class().class_hash;
//     let contract = declare("AutoShare").unwrap().contract_class();
//     let constructor_calldata = array![
//         ADMIN_ADDR().into(),
//         erc20_address.into(),
//         EMERGENCY_WITHDRAW_ADDR().into(),
//         child_contract.into(),
//     ];
//     let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

//     let AutoShare = IAutoShareDispatcher { contract_address };
//     (AutoShare, erc20_dispatcher)
// }

// deploy the autoshare contract
pub fn deploy_autoshare_contract() -> (
    IAutoShareDispatcher, IERC20Dispatcher, IERC20Dispatcher, IERC20Dispatcher,
) {
    let erc20_class = declare("STARKTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let erc20_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    let child_contract: ClassHash = *declare("AutoshareChild").unwrap().contract_class().class_hash;
    let contract = declare("AutoShare").unwrap().contract_class();
    let constructor_calldata = array![
        ADMIN_ADDR().into(),
        erc20_address.into(),
        EMERGENCY_WITHDRAW_ADDR().into(),
        child_contract.into(),
    ];

    let erc20_class = declare("USDTTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let usdc_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    let erc20_class = declare("USDCTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let usdt_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    let AutoShare = IAutoShareDispatcher { contract_address };
    (AutoShare, erc20_dispatcher, usdc_dispatcher, usdt_dispatcher)
}

pub fn deploy_tokens() -> (IERC20Dispatcher, IERC20Dispatcher, IERC20Dispatcher) {
    let erc20_class = declare("STARKTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let strk_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    let erc20_class = declare("USDTTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let usdc_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    let erc20_class = declare("USDCTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let usdt_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    (strk_dispatcher, usdc_dispatcher, usdt_dispatcher)
}

// deploy the autoshare contract
pub fn deploy_crowdfund_contract() -> (ICrowdFundDispatcher, IERC20Dispatcher) {
    let erc20_class = declare("STARKTOKEN").unwrap().contract_class();
    let mut calldata = array![CREATOR_ADDR().into(), CREATOR_ADDR().into(), 6];
    let (erc20_address, _) = erc20_class.deploy(@calldata).unwrap();
    let erc20_dispatcher = IERC20Dispatcher { contract_address: erc20_address };

    let child_contract: ClassHash = *declare("CrowdFundChild").unwrap().contract_class().class_hash;
    let contract = declare("CrowdFund").unwrap().contract_class();
    let constructor_calldata = array![
        ADMIN_ADDR().into(),
        erc20_address.into(),
        EMERGENCY_WITHDRAW_ADDR().into(),
        child_contract.into(),
    ];
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    let AutoShare = ICrowdFundDispatcher { contract_address };
    (AutoShare, erc20_dispatcher)
}

pub fn group_member_two() -> Array<GroupMember> {
    let mut members = ArrayTrait::new();
    members.append(GroupMember { addr: USER1_ADDR(), percentage: 60 });
    members.append(GroupMember { addr: USER2_ADDR(), percentage: 40 });

    members
}

pub fn group_member_five() -> Array<GroupMember> {
    let mut members = ArrayTrait::new();
    members.append(GroupMember { addr: USER1_ADDR(), percentage: 20 });
    members.append(GroupMember { addr: USER2_ADDR(), percentage: 20 });
    members.append(GroupMember { addr: CREATOR_ADDR(), percentage: 20 });
    members.append(GroupMember { addr: USER3_ADDR(), percentage: 20 });
    members.append(GroupMember { addr: EMERGENCY_WITHDRAW_ADDR(), percentage: 20 });

    members
}

pub fn group_member_ten() -> Array<GroupMember> {
    let mut members = ArrayTrait::new();
    members.append(GroupMember { addr: USER1_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: USER2_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: CREATOR_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: USER3_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: EMERGENCY_WITHDRAW_ADDR(), percentage: 10 });

    members.append(GroupMember { addr: ADMIN_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: USER4_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: USER5_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: USER6_ADDR(), percentage: 10 });
    members.append(GroupMember { addr: USER7_ADDR(), percentage: 10 });

    members
}

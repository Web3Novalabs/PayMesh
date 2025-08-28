use contract::autoshare_child::{IAutoshareChildDispatcher, IAutoshareChildDispatcherTrait};
use contract::interfaces::iautoshare::IAutoShareDispatcherTrait;
use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use snforge_std::{start_cheat_caller_address, stop_cheat_caller_address};
use crate::test_util::{
    ADMIN_ADDR, CREATOR_ADDR, EMERGENCY_WITHDRAW_ADDR, ONE_STRK, USER1_ADDR, USER2_ADDR,
    deploy_autoshare_contract, group_member_ten, group_member_two,
};


#[test]
fn test_all_contract_flow_success() {
    let (contract_address, erc20_dispatcher) = deploy_autoshare_contract();
    let token = erc20_dispatcher.contract_address;

    // ten group member
    let members = group_member_ten();
    // two group member
    let two_member = group_member_two();

    // check contract balnce
    let contract_balance_before = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_before == 0, 'balance not up to date');

    let contract_usage_fee = contract_address.get_group_usage_fee();
    assert(contract_usage_fee == ONE_STRK, 'balance not up to date');

    // creator address setting approval to contract to spend 1 stk and create group with 20
    // subscription usage fee 1 strk
    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 20);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);
    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());

    let group1_address = contract_address.create_group("TestGroup", members.clone(), 20);
    stop_cheat_caller_address(contract_address.contract_address);

    let contract_balance_after = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_after == ONE_STRK * 20, 'balance not upto 20 STK');

    // asset that the main contract has been set in the child contract
    let child_contract_instance = IAutoshareChildDispatcher { contract_address: group1_address };
    let main_contract_address = child_contract_instance.get_main_contract_address();
    assert(main_contract_address == contract_address.contract_address, 'main contract not set');

    // another group with a diffrent usage fee
    start_cheat_caller_address(contract_address.contract_address, ADMIN_ADDR());
    contract_address.set_group_usage_fee(5_000_000_000_000_000_000);
    stop_cheat_caller_address(contract_address.contract_address);

    // new usage fee 5 strk
    let contract_usage_fee = contract_address.get_group_usage_fee();
    assert(contract_usage_fee == ONE_STRK * 5, 'balance not up to date');

    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, (ONE_STRK * 5) * 20);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);
    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());

    let group2_address = contract_address.create_group("INDIGO", two_member.clone(), 20);
    stop_cheat_caller_address(contract_address.contract_address);

    // asset that the main contract has been set in the child contract
    let child_contract_instance = IAutoshareChildDispatcher { contract_address: group2_address };
    let main_contract_address = child_contract_instance.get_main_contract_address();
    assert(main_contract_address == contract_address.contract_address, 'main contract not set');

    let contract_balance_after1 = erc20_dispatcher.balance_of(contract_address.contract_address);
    println!("bef balance {}", contract_balance_after);
    println!("new balance {}", contract_balance_after1);
    assert(
        contract_balance_after1 == contract_balance_after + (ONE_STRK * 5) * 20,
        'balance not upto 50 STK',
    );

    // get usage count
    let usage1 = contract_address.get_group_usage_count(1);
    let usage2 = contract_address.get_group_usage_count(2);

    assert(usage1 == 20, 'usage count shoulb be 20');
    assert(usage2 == 20, 'usage count shoulb be 20');

    //get how many subcription plan group subscribe to
    let paid_usage1 = contract_address.get_group_usage_paid(1);
    let paid_usage2 = contract_address.get_group_usage_paid(2);
    assert(paid_usage1 == 20, 'paid usage count should be 20');
    assert(paid_usage2 == 20, 'paid usage count shoulb be 20');

    // get group details
    let group1 = contract_address.get_group(1);
    let group2 = contract_address.get_group(2);
    assert(group1.name == "TestGroup", 'Wrong group name');
    assert(group1.creator == CREATOR_ADDR(), 'not creator address');
    assert(group2.creator == CREATOR_ADDR(), 'not creator address');
    assert(!group1.usage_limit_reached, 'limit not reach yet');
    assert(!group2.usage_limit_reached, 'limit not reach yet');
    assert(group2.name == "INDIGO", 'Wrong group name');

    // group balance before transfer
    let group1_balance_before = erc20_dispatcher.balance_of(group1_address);
    assert(group1_balance_before == 0, 'balance not up to date');
    let group2_balance_before = erc20_dispatcher.balance_of(group2_address);
    assert(group2_balance_before == 0, 'balance not up to date');

    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    // transfer 2000 and 1000 strk to the child contract address created for the group
    erc20_dispatcher.transfer(group2_address, 2_000_000_000_000_000_000_000);
    erc20_dispatcher.transfer(group1_address, 1_000_000_000_000_000_000_000);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    // group balance after transfer
    let group1_balance_after = erc20_dispatcher.balance_of(group1_address);
    assert(group1_balance_after == 1_000_000_000_000_000_000_000, 'balance not up to date');
    let group2_balance_after = erc20_dispatcher.balance_of(group2_address);
    assert(group2_balance_after == 2_000_000_000_000_000_000_000, 'balance not up to date');

    //user2 and user1 balance before pay
    let user1_before = erc20_dispatcher.balance_of(USER1_ADDR());
    assert(user1_before == 0, 'balance not up to date');
    let user2_before = erc20_dispatcher.balance_of(USER2_ADDR());
    assert(user2_before == 0, 'balance not up to date');

    // pay the group a member , admin or creator can pay a group
    start_cheat_caller_address(contract_address.contract_address, ADMIN_ADDR());
    contract_address.paymesh(group2_address);
    stop_cheat_caller_address(contract_address.contract_address);

    //user2 and user1 balance after pay in group 2
    let user1_group2_amount = erc20_dispatcher.balance_of(USER1_ADDR());
    assert(user1_group2_amount == 1_200_000_000_000_000_000_000, 'balance not up to date');
    let user2_group2_amount = erc20_dispatcher.balance_of(USER2_ADDR());
    assert(user2_group2_amount == 800_000_000_000_000_000_000, 'balance not up to date');

    start_cheat_caller_address(contract_address.contract_address, ADMIN_ADDR());
    contract_address.paymesh(group1_address);
    stop_cheat_caller_address(contract_address.contract_address);
    // group balance after pay
    let group1_balance_after_pay = erc20_dispatcher.balance_of(group1_address);
    assert(group1_balance_after_pay == 0, 'balance not up to date');
    let group2_balance_after_pay = erc20_dispatcher.balance_of(group2_address);
    assert(group2_balance_after_pay == 0, 'balance not up to date');

    //user2 and user1 balance after pay in group 1
    let user1_group1_amount = erc20_dispatcher.balance_of(USER1_ADDR());
    assert(
        user1_group1_amount == user1_group2_amount + 100_000_000_000_000_000_000,
        'balance not up to date',
    );
    let user2_group1_amount = erc20_dispatcher.balance_of(USER2_ADDR());
    assert(
        user2_group1_amount == user2_group2_amount + 100_000_000_000_000_000_000,
        'balance not up to date',
    );

    // get usage count
    let usage1 = contract_address.get_group_usage_count(1);
    let usage2 = contract_address.get_group_usage_count(2);

    assert(usage1 == 19, 'usage count shoulb be 19');
    assert(usage2 == 19, 'usage count shoulb be 19');

    // update group 1 from 10 members to 2 members
    let group_member_before = contract_address.get_group_member(1);
    assert(group_member_before.len() == 10, 'should be 10 members');
    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 5);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);
    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());
    contract_address.request_group_update(1, "UpdatedGroup", two_member);
    stop_cheat_caller_address(contract_address.contract_address);

    let group = contract_address.get_group(1);
    assert(group.name == "UpdatedGroup", 'Name not updated');
    let group_member_after = contract_address.get_group_member(1);

    assert(group_member_after.len() == 2, 'should be 2 members');

    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    // transfer 2000 and 1000 strk to the child contract address created for the group
    erc20_dispatcher.transfer(group1_address, 2_000_000_000_000_000_000_000);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    // get group balance
    let group_balance = contract_address.get_group_balance(group1_address);
    assert(group_balance == 2_000_000_000_000_000_000_000, 'balance not upto date');
    let emergency_withdraw_address_balance_after = erc20_dispatcher
        .balance_of(EMERGENCY_WITHDRAW_ADDR());
    println!("usage233 7{}", emergency_withdraw_address_balance_after);
    // users balance before pay
    let user1 = erc20_dispatcher.balance_of(USER1_ADDR());
    let user2 = erc20_dispatcher.balance_of(USER2_ADDR());

    start_cheat_caller_address(contract_address.contract_address, USER1_ADDR());
    contract_address.paymesh(group1_address);
    stop_cheat_caller_address(contract_address.contract_address);

    // get group balance
    let group_balance = contract_address.get_group_balance(group1_address);
    assert(group_balance == 0, 'balance not upto date');

    //user2 and user1 balance after pay in group 1
    let user1_group1_amount = erc20_dispatcher.balance_of(USER1_ADDR());
    assert(user1_group1_amount == user1 + 1_200_000_000_000_000_000_000, 'balance not up to date');
    let user2_group1_amount = erc20_dispatcher.balance_of(USER2_ADDR());
    assert(user2_group1_amount == user2 + 800_000_000_000_000_000_000, 'balance not up to date');
    let usage1 = contract_address.get_group_usage_count(1);

    assert(usage1 == 18, 'usage count shoulb be 18');

    // top up group subscription plan
    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 10);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());
    contract_address.top_subscription(1, 10);
    stop_cheat_caller_address(contract_address.contract_address);

    let usage1 = contract_address.get_group_usage_count(1);
    assert(usage1 == 28, 'usage count shoulb be 28');
    let emergency_withdraw_address_balance_before = erc20_dispatcher
        .balance_of(EMERGENCY_WITHDRAW_ADDR());
    // widthdraw token from contract
    let contract_balance_before = erc20_dispatcher.balance_of(contract_address.contract_address);

    start_cheat_caller_address(contract_address.contract_address, EMERGENCY_WITHDRAW_ADDR());
    contract_address.withdraw();
    stop_cheat_caller_address(contract_address.contract_address);

    let contract_balance_after = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_after == 0, 'balance not up to date');

    let emergency_withdraw_address_balance_after = erc20_dispatcher
        .balance_of(EMERGENCY_WITHDRAW_ADDR());
    assert(
        emergency_withdraw_address_balance_after == emergency_withdraw_address_balance_before
            + contract_balance_before,
        'balance not up to date',
    );
}

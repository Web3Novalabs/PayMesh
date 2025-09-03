use contract::crowd_fund_child::{ICrowdFundChildDispatcher, ICrowdFundChildDispatcherTrait};
use contract::interfaces::icrowdfund::{ICrowdFundDispatcher, ICrowdFundDispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{start_cheat_caller_address, stop_cheat_caller_address};
use crate::test_util::{
    ADMIN_ADDR, CREATOR_ADDR, EMERGENCY_WITHDRAW_ADDR, ONE_STRK, USER1_ADDR, USER2_ADDR, USER3_ADDR,
    deploy_crowdfund_contract, group_member_ten, group_member_two,
};


#[test]
fn test_crowd_fund_flow() {
    let (contract_address, erc20_dispatcher) = deploy_crowdfund_contract();
    // let token = erc20_dispatcher.contract_address;

    // check contract balnce
    let contract_balance_before = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_before == 0, 'balance not up to date');

    // creator address setting approval to contract to spend 1 stk and create pool
    // subscription usage fee 1 strk
    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 10);
    erc20_dispatcher.transfer(USER2_ADDR(), ONE_STRK * 10);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());
    // create a pool with target amount of 5 STRK
    let pool1_address = contract_address
        .create_pool("john doe school fee", ONE_STRK * 5, USER1_ADDR());
    stop_cheat_caller_address(contract_address.contract_address);

    //contract balance after a pool creation
    let contract_balance_after_pool = erc20_dispatcher
        .balance_of(contract_address.contract_address);
    assert(contract_balance_after_pool == ONE_STRK, 'balance not up to 1 STRK');

    // assert that the main contract has been set in the child contract
    let child_contract_instance = ICrowdFundChildDispatcher { contract_address: pool1_address };
    let main_contract_address = child_contract_instance.get_main_contract_address();
    assert(main_contract_address == contract_address.contract_address, 'main contract not set');

    let get_all_pools = contract_address.get_all_pools();
    assert(get_all_pools.len() == 1, 'pool not upto date');

    // get created pool details
    let get_pool = contract_address.get_pool(1);
    assert(get_pool.name == "john doe school fee", 'wrong pool name');
    assert(get_pool.balance == 0, 'wrong pool balance');
    assert(get_pool.id == 1, 'wrong pool id');
    assert(get_pool.beneficiary == USER1_ADDR(), 'wrong pool beneficiary');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator');
    assert(get_pool.donors == 0, 'wrong pool donor');
    assert(get_pool.target == ONE_STRK * 5, 'wrong pool target');
    assert(get_pool.pool_address == pool1_address, 'wrong pool address');

    // donate
    start_cheat_caller_address(erc20_dispatcher.contract_address, USER2_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 10);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    let balance = erc20_dispatcher.balance_of(USER2_ADDR());
    println!("balance user 1 {}", balance);

    start_cheat_caller_address(contract_address.contract_address, USER2_ADDR());
    contract_address.paymesh_donate(pool1_address, ONE_STRK * 5);
    stop_cheat_caller_address(contract_address.contract_address);

    let balance = erc20_dispatcher.balance_of(USER2_ADDR());
    println!("balance user 2 {}", balance);

    // get pool balance
    let get_pool = contract_address.get_pool(1);
    assert(get_pool.donors == 1, 'wrong pool donor');
    assert(get_pool.balance == ONE_STRK * 5, 'wrong pool balance');
    let balance = contract_address.get_pool_balance(pool1_address);
    assert(balance == ONE_STRK * 5, 'balance not up to date');

    // check main contract balance after donation (should be 1 STRK subscription fee + 5 STRK
    // donation)
    let contract_balance_after_donation = erc20_dispatcher
        .balance_of(contract_address.contract_address);
    assert(contract_balance_after_donation >= ONE_STRK, 'balance should at least b 1 STK');

    start_cheat_caller_address(contract_address.contract_address, USER1_ADDR());
    contract_address.paymesh(pool1_address);
    stop_cheat_caller_address(contract_address.contract_address);

    let contract_balance_after_paymesh = erc20_dispatcher
        .balance_of(contract_address.contract_address);
    println!(
        "before paymesh: {}, after paymesh: {}",
        contract_balance_after_donation,
        contract_balance_after_paymesh,
    );

    let is_complete = contract_address.is_pool_completed(1);
    assert(is_complete, 'pool should be completed');
    let pool = contract_address.get_pool(1);
    println!("pool {:?}", pool);
}

#[test]
fn test_create_crowd_fund_pool() {
    let (contract_address, erc20_dispatcher) = deploy_crowdfund_contract();

    // check contract balance
    let contract_balance_before = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_before == 0, 'contract balance should be 0');

    // creator address setting approval to contract to spend 1 stk and create pool
    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 100);
    erc20_dispatcher.transfer(USER2_ADDR(), ONE_STRK * 100);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    // create a pool with target amount of 50 STRK
    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());
    let pool_address = contract_address.create_pool("Crowd Fund Pool", ONE_STRK * 50, USER1_ADDR());
    stop_cheat_caller_address(contract_address.contract_address);

    // check contract balance after a pool creation
    let contract_balance_after = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_after >= ONE_STRK, 'contract balance must be 50 stk');

    // check pool address
    let pool = contract_address.get_pool(1);
    assert(pool.pool_address == pool_address, 'wrong pool address');
}

#[test]
fn test_create_crowd_fund_pool_with_multiple_accounts() {
    let (contract_address, erc20_dispatcher) = deploy_crowdfund_contract();

    // check contract balance
    let contract_balance_before = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_before == 0, 'contract balance should be 0');

    start_cheat_caller_address(erc20_dispatcher.contract_address, CREATOR_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 200);
    erc20_dispatcher.transfer(USER2_ADDR(), ONE_STRK * 100);
    erc20_dispatcher.transfer(USER3_ADDR(), ONE_STRK * 100);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    // create a pool with target amount of 8 STRK
    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());
    let pool_address = contract_address.create_pool("Crowd Fund Pool2", ONE_STRK * 8, USER1_ADDR());
    stop_cheat_caller_address(contract_address.contract_address);

    // check contract balance after a pool creation
    let contract_balance_after = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_after >= ONE_STRK, 'balance must be >= 1 stk');

    // check pool address before donation
    let get_pool = contract_address.get_pool(1);
    assert(get_pool.pool_address == pool_address, 'wrong pool address before');
    assert(get_pool.target == ONE_STRK * 8, 'wrong pool target before');
    assert(get_pool.balance == 0, 'wrong pool balance before');
    assert(get_pool.donors == 0, 'wrong pool donors before');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator before');
    assert(get_pool.beneficiary == USER1_ADDR(), 'wrong pool beneficiary before');
    assert(get_pool.name == "Crowd Fund Pool2", 'wrong pool name before');
    assert(get_pool.id == 1, 'wrong pool id');
    assert(get_pool.pool_address == pool_address, 'wrong pool address before');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator before');

    // donate
    start_cheat_caller_address(erc20_dispatcher.contract_address, USER2_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 100);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    start_cheat_caller_address(erc20_dispatcher.contract_address, USER3_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 100);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    start_cheat_caller_address(contract_address.contract_address, USER2_ADDR());
    contract_address.paymesh_donate(pool_address, ONE_STRK * 4);
    stop_cheat_caller_address(contract_address.contract_address);

    start_cheat_caller_address(contract_address.contract_address, USER3_ADDR());
    contract_address.paymesh_donate(pool_address, ONE_STRK * 4);
    stop_cheat_caller_address(contract_address.contract_address);

    // check pool balance after donation
    let get_pool = contract_address.get_pool(1);
    assert(get_pool.balance == ONE_STRK * 8, 'wrong pool balance after');
    assert(get_pool.donors == 2, 'wrong pool donors after');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator after');
    assert(get_pool.beneficiary == USER1_ADDR(), 'wrong pool beneficiary after');
    assert(get_pool.name == "Crowd Fund Pool2", 'wrong pool name after');
    assert(get_pool.id == 1, 'wrong pool id after');
    assert(get_pool.pool_address == pool_address, 'wrong pool address after');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator');

    // Check beneficiary balance before and after
    let beneficiary_balance_before = erc20_dispatcher.balance_of(USER1_ADDR());
    println!("beneficiary balance before paymesh: {}", beneficiary_balance_before);

    start_cheat_caller_address(contract_address.contract_address, USER1_ADDR());
    contract_address.paymesh(pool_address);
    stop_cheat_caller_address(contract_address.contract_address);

    // check pool balance after paymesh
    let get_pool = contract_address.get_pool(1);
    println!("balance final xxxxxxxxxxxxxxxxxx {}", get_pool.balance);
    println!("pool details after paymesh: XXXXXXXXXX {:?}", get_pool);

    // Check if pool is completed
    let is_completed = contract_address.is_pool_completed(1);
    println!("is pool completed: {}", is_completed);

    let beneficiary_balance_after = erc20_dispatcher.balance_of(USER1_ADDR());
    println!("beneficiary balance after paymesh: {}", beneficiary_balance_after);

    // For now, let's check if the balance is at least reduced
    assert(get_pool.balance == 0, 'balance should b reduce paymesh');
    assert(get_pool.donors == 2, 'wrong pool donors final');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator final');
    assert(get_pool.beneficiary == USER1_ADDR(), 'wrong pool beneficiary final');
    assert(get_pool.name == "Crowd Fund Pool2", 'wrong pool name final');
    assert(get_pool.id == 1, 'wrong pool id final');
    assert(get_pool.pool_address == pool_address, 'wrong pool address final');
    assert(get_pool.creator == CREATOR_ADDR(), 'wrong pool creator final');
}

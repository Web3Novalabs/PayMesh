use contract::crowd_fund_child::{ICrowdFundChildDispatcher, ICrowdFundChildDispatcherTrait};
use contract::interfaces::icrowdfund::{ICrowdFundDispatcher, ICrowdFundDispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{start_cheat_caller_address, stop_cheat_caller_address};
use crate::test_util::{
    ADMIN_ADDR, CREATOR_ADDR, EMERGENCY_WITHDRAW_ADDR, ONE_STRK, USER1_ADDR, USER2_ADDR,
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
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 100);
    erc20_dispatcher.transfer(USER2_ADDR(), ONE_STRK * 100);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    start_cheat_caller_address(contract_address.contract_address, CREATOR_ADDR());
    // create a pool with target amount of 50 STRK
    let pool1_address = contract_address
        .create_pool("john doe school fee", ONE_STRK * 100, USER1_ADDR());
    stop_cheat_caller_address(contract_address.contract_address);

    //contract balancec after a pool creation
    let contract_balance_after = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_after == ONE_STRK, 'balance not upto 20 STK');

    // asset that the main contract has been set in the child contract
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
    assert(get_pool.target == ONE_STRK * 100, 'wrong pool target');
    assert(get_pool.pool_address == pool1_address, 'wrong pool address');

    // donate
    start_cheat_caller_address(erc20_dispatcher.contract_address, USER2_ADDR());
    erc20_dispatcher.approve(contract_address.contract_address, ONE_STRK * 100);
    stop_cheat_caller_address(erc20_dispatcher.contract_address);

    let balance = erc20_dispatcher.balance_of(USER2_ADDR());
    println!("balance user 1 {}", balance);
    start_cheat_caller_address(contract_address.contract_address, USER2_ADDR());
    contract_address.paymesh_donate(pool1_address, ONE_STRK * 100);
    stop_cheat_caller_address(contract_address.contract_address);
    let balance = erc20_dispatcher.balance_of(USER2_ADDR());
    println!("balance user 2 {}", balance);
    // get pool balance
    let get_pool = contract_address.get_pool(1);
    assert(get_pool.donors == 1, 'wrong pool donor');
    assert(get_pool.balance == ONE_STRK * 100, 'wrong pool balance');
    let balance = contract_address.get_pool_balance(pool1_address);
    assert(balance == ONE_STRK * 100, 'balance not up to date');

    let contract_balance_before = erc20_dispatcher.balance_of(contract_address.contract_address);
    assert(contract_balance_after == ONE_STRK, 'balance not upto 20 STK');

    start_cheat_caller_address(contract_address.contract_address, USER1_ADDR());
    contract_address.paymesh(pool1_address);
    stop_cheat_caller_address(contract_address.contract_address);

    let contract_balance_after = erc20_dispatcher.balance_of(contract_address.contract_address);
    println!("before  {}, after {}", contract_balance_before, contract_balance_after);
    let is_complete = contract_address.is_pool_completed(1);
    assert(is_complete, 'pool should be completed');
    let pool = contract_address.get_pool(1);
    println!("pool {:?}", pool);
}

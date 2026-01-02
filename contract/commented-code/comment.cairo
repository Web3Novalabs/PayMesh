// fn approve_group_update(ref self: ContractState, group_id: u256) {
//     let mut group: Group = self.get_group(group_id);
//     assert(group.id != 0, ERR_GROUP_NOT_FOUND);
//     let caller = get_caller_address();

//     let is_member = self.is_group_member(group_id, caller);
//     assert(is_member == true, 'caller is not a group member'); p[oihuy]

//     // Check if the group has a pending update
//     let already_approved = self.update_approvals.read((group_id, caller));
//     assert(already_approved == false, ERR_ALREADY_APPROVED);

//     let update_request: GroupUpdateRequest = self.update_requests.read(group_id);

//     // checks if the update fee has been paid

//     assert(update_request.fee_paid == true, ERR_UPDATE_FEE_NOT_PAID);

//     // check if the update request exists and is not completed
//     assert(update_request.is_completed == false, ERR_UPDATE_REQUEST_NOT_FOUND);

//     let approval_count = update_request.approval_count;
//     let total_members = self.get_group_member(group_id);
//     let total_members = total_members.len();
//     assert(approval_count < total_members.try_into().unwrap(),
//     ERR_INSUFFICIENT_APPROVALS);

//     // Mark caller as having approved the update
//     self.update_approvals.write((group_id, caller), true);

//     let approval_counts = approval_count + 1;
//     let mut updated_request = update_request.clone();
//     updated_request.approval_count = approval_counts;

//     // Clone for event BEFORE moving to storage
//     let updated_request_for_event = updated_request.clone();

//     self.update_requests.write(group_id, updated_request);
//     if approval_counts == total_members.try_into().unwrap() {
//         let mut final_request = updated_request_for_event.clone();
//         final_request.is_completed = true;
//         self.update_requests.write(group_id, final_request);
//         self.has_pending_update.write(group_id, false);

//         let new_members = self.get_update_request_new_members(group_id);
//         let mut member_count: u32 = new_members.len();

//         self
//             .emit(
//                 Event::GroupUpdated(
//                     GroupUpdated {
//                         group_id,
//                         old_name: group.name.clone(),
//                         new_name: updated_request_for_event.new_name.clone(),
//                     },
//                 ),
//             );
//     }

//     self
//         .emit(
//             Event::GroupUpdateApproved(
//                 GroupUpdateApproved {
//                     group_id,
//                     approver: caller,
//                     approval_count: approval_counts,
//                     total_members: total_members.try_into().unwrap(),
//                 },
//             ),
//         );
// }

fn request_group_update(
    ref self: ContractState, group_id: u256, new_name: ByteArray, new_members: Array<GroupMember>,
) {
    let mut group: Group = self.get_group(group_id);
    assert(group.id != 0, ERR_GROUP_NOT_FOUND);
    let caller = get_caller_address();
    assert(caller == group.creator, 'caller is not the group creator');

    let mut sum: u32 = 0;
    let mut i: usize = 0;

    // This code checks for duplicate addresses among group members
    let member_count = new_members.len();
    while i < member_count {
        let m = new_members.at(i).clone();
        sum += m.percentage.try_into().unwrap();
        let mut j: usize = i + 1;
        while j < member_count {
            let duplicate = m.addr == new_members.at(j).clone().addr;
            assert(!duplicate, 'list contain duplicate address');
            j += 1;
        }
        i += 1;
    }
    assert(sum == 100, 'total percentage must be 100');

    // Store the new members separately
    let mut i: usize = 0;
    let member_count = new_members.len();
    while i < member_count {
        let member = new_members.at(i);
        // self.update_request_new_members.entry(group_id).push(member);
        self.update_request_new_members.entry(group_id).append().write(*member);
        i += 1;
    }

    let update_request = GroupUpdateRequest {
        group_id, new_name: new_name.clone(), requester: caller, fee_paid: false,
        // approval_count: 0,
    // total_members: member_count.try_into().unwrap(),
    // is_completed: false,
    };

    // Collect the update fee
    self._collect_group_update_fee(caller);

    // set fee_paid to true after collecting the fee
    let mut update_request_paid = update_request.clone();
    update_request_paid.fee_paid = true;
    self.update_requests.write(group_id, update_request_paid);

    self.has_pending_update.write(group_id, true);

    self
        .emit(
            Event::GroupUpdateRequested(
                GroupUpdateRequested { group_id, requester: caller, new_name: new_name.clone() },
            ),
        );

    self._execute_group_update(group_id);
}


fn _execute_group_update(ref self: ContractState, group_id: u256) {
    let mut group: Group = self.get_group(group_id);
    assert(group.id != 0, ERR_GROUP_NOT_FOUND);
    let caller = get_caller_address();

    // Check if the group has a pending update
    // let has_pending_update = self.has_pending_update.read(group_id);
    // assert(has_pending_update == false, 'no pending updt for this group');

    // Retrieve the update request
    let update_request: GroupUpdateRequest = self.update_requests.read(group_id);

    // assert(update_request.is_completed == true, 'update request not completed');

    // Check if the caller is the group creator
    let is_creator = caller == group.creator;
    assert(is_creator, 'caller is not the group creator');

    // Store old and new values for the event BEFORE moving group
    let old_name = group.name.clone();
    let new_name = update_request.new_name.clone();

    // Update the group with new values
    group.name = new_name.clone();
    self.groups.write(group_id, group);

    // Clear the update request
    self
        .update_requests
        .write(
            group_id,
            GroupUpdateRequest {
                group_id: 0,
                new_name: "",
                requester: starknet::contract_address_const::<0>(),
                fee_paid: false,
                // approval_count: 0,
            // total_members: 0,
            // is_completed: false,
            },
        );

    // remove all previous members
    let new_members = self.get_update_request_new_members(group_id);

    // Clear the previous members for the update request
    let mut previous_member = self.group_members.entry(group_id);
    let mut len = previous_member.len();
    while len > 0 {
        previous_member.pop();
        len -= 1;
    }

    let mut i: u32 = 0;
    let member_count = self.update_request_new_members.entry(group_id);
    let mut len: u32 = member_count.len().try_into().unwrap();

    // push new member to the group member storage
    while i < len {
        let m: u64 = i.try_into().unwrap();
        let member = new_members.at(i).clone();
        self.group_members.entry(group_id).push(member);
        i += 1;
    }

    // Clear the new members for the update request
    let mut new_members_vec = self.update_request_new_members.entry(group_id);
    let mut len = new_members_vec.len();
    while len > 0 {
        new_members_vec.pop();
        len -= 1;
    }

    // Clear the update approvals for all current group members
    let group_members_vec = self.group_members.entry(group_id);
    let mut i: u64 = 0;
    let len: u64 = group_members_vec.len();
    while i < len {
        let member = group_members_vec.at(i).read();
        self.update_approvals.write((group_id, member.addr), false);
        i += 1;
    }

    // Clear the pending update status
    self.has_pending_update.write(group_id, false);

    // Emit the GroupUpdated event
    self.emit(Event::GroupUpdated(GroupUpdated { group_id, old_name, new_name }));
}

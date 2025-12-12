
// Group Functions
const create_group = (
  address: string,
  creatorAddress: string,
  groupName: string,
  usageCount: number,
  members: Array<{ addr: string; percentage: number }>
) => {
  const body = JSON.stringify({
    created_by: creatorAddress,
    group_address: address,
    group_name: groupName,
    members: members.map((member) => ({
      addr: member.addr,
      percentage: Number(member.percentage),
    })),
    usage_remaining: Number(usageCount),
  });

  fetch(`${process.env.API_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: body,
  }).catch((err) => {
    console.error(`Create group error ${address}:`, err);
  });
};

const pay = (
  group_address: string,
  from_address: string,
  tx_hash: string,
  token_amount: string,
  token_address: string
) => {
  const body = JSON.stringify({
    from_address,
    token_address,
    token_amount,
    tx_hash,
  });

  fetch(`${process.env.API_URL}/groups/${group_address}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: body,
  }).catch((err) => {
    console.error(`Payment error for ${group_address}:`, err);
  });
};

const store_distribution_history = (
  group_address: string,
  token_address: string,
  tx_hash: string,
  usage_remaining: number,
  token_amount: string,
  members: Array<{ addr: string; share: string }>
) => {
  const members_decoupled = members.map((member) => ({
    member_address: member.addr,
    member_amount: member.share,
  }));

  fetch(
    `${process.env.API_URL}/groups/${group_address}/payment-distributions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
      },
      body: JSON.stringify({
        members: members_decoupled,
        token_address: token_address,
        token_amount: token_amount,
        tx_hash: tx_hash,
        usage_remaining: Number(usage_remaining),
      }),
    }
  );
};

const subsciption_topped = (group_address: string, usage_count: number) => {
  const body = JSON.stringify({
    usage_count: usage_count,
  });
  fetch(`${process.env.API_URL}/groups/${group_address}/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: body,
  }).catch((err) => {
    console.error(`Subscription top up error for ${group_address}:`, err);
  });
};

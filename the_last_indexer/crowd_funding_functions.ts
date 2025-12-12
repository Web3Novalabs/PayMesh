
// Cache exports
export const crowdFundingContractAddresses = await fetch(
  `${process.env.API_URL}/crowdfunding/addresses`,
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }
)
  .then((response) => response.json())
  .then((data: any) => data);

export const group_address_cache = await fetch(
  `${process.env.API_URL}/groups/addresses`,
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }
)
  .then((response) => response.json())
  .then((data: any) => data);

// Crowdfunding Functions
const create_crowd_funding = (
  pool_address: string,
  creator_address: string,
  name: string,
  target_amount: string
) => {
  fetch(`${process.env.API_URL}/crowdfunding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: JSON.stringify({
      creator_address: creator_address,
      name: name,
      pool_address: pool_address,
      target_amount: target_amount,
    }),
  });
};

const donate_to_crowd_funding = (
  crowd_funding_address: string,
  amount: string,
  donor_address: string,
  token_address: string,
  transaction_hash: string
) => {
  fetch(`${process.env.API_URL}/crowdfunding/${crowd_funding_address}/donate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: JSON.stringify({
      amount: amount,
      donor_address: donor_address,
      token_address: token_address,
      transaction_hash: transaction_hash,
    }),
  });
};

const resolve_crowd_funding = (
  crowd_funding_address: string,
  amount: string,
  token_address: string,
  transaction_hash: string,
  withdrawn_by: string
) => {
  fetch(
    `${process.env.API_URL}/crowdfunding/${crowd_funding_address}/resolve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        token_address: token_address,
        transaction_hash: transaction_hash,
        withdrawn_by: withdrawn_by,
      }),
    }
  );
};

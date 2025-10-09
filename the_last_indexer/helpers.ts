export const startingBlock = await fetch(
    "https://starknet-mainnet.public.blastapi.io",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 0,
        method: "starknet_blockNumber",
      }),
    },
  )
    .then((response) => response.json())
    .then((data: any) => data.result);
export const startingBlock = await fetch(
  "https://starknet-mainnet.g.alchemy.com/v2/2kcD_qHq9FJV5ZI-BHY0q",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "starknet_blockNumber",
    }),
  }
)
  .then((response) => response.json())
  .then((data: any) => data.result);
  
export function hexToString(hex: string): string {
  if (!hex || !hex.match(/^0x[0-9a-fA-F]*$/)) {
    return hex;
  }

  // Remove '0x' prefix if present
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

  // Ensure the hex string has an even length
  if (cleanHex.length % 2 !== 0) {
    console.warn(`Invalid hex string: ${cleanHex}, returning original`);
    return hex;
  }

  try {
    // Convert hex to string
    let result = "";
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.slice(i, i + 2), 16);
      result += String.fromCharCode(byte);
    }
    // Remove null characters and trim
    const cleanResult = result.replace(/\0/g, "").trim();
    // console.log(`Decoded result: ${cleanResult}`);
    return cleanResult;
  } catch (error) {
    console.warn(`Failed to decode hex string: ${hex}, error: ${error}`);
    return hex;
  }
}

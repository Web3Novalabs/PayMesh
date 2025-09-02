"use client";

import {
  StarknetConfig,
  InjectedConnector,
  paymasterRpcProvider,
} from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { jsonRpcProvider } from "@starknet-react/core";

// const chains = [mainnet];
const chains = [sepolia];

const connectors = [
  new InjectedConnector({ options: { id: "braavos" } }),
  new InjectedConnector({ options: { id: "argentX" } }),
];

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      paymasterProvider={paymasterRpcProvider({
        rpc: () => {
          return {
            nodeUrl: "https://sepolia.paymaster.avnu.fi",
            headers: {
              "x-paymaster-api-key":
                process.env.NEXT_PUBLIC_PAYMASTER_API ?? "",
            },
          };
        },
      })}
      chains={chains}
      connectors={connectors}
      autoConnect={true}
      provider={jsonRpcProvider({
        rpc: () => ({ nodeUrl: process.env.NEXT_PUBLIC_RPC_URL }),
      })}
    >
      {children}
    </StarknetConfig>
  );
}

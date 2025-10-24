import { defineChain, http } from "viem"
import { createConfig, cookieStorage, createStorage } from "wagmi"
import { injected } from "wagmi/connectors"
import { HEDERA_TESTNET_ID, HEDERA_TESTNET_NAME, HEDERA_RPC_URL } from "./hedera-config"

// Define Hedera Testnet chain
export const hederaTestnet = defineChain({
  id: HEDERA_TESTNET_ID,
  name: HEDERA_TESTNET_NAME,
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: { http: [HEDERA_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "HashScan", url: "https://testnet.hashscan.io" },
  },
})

// Create wagmi config for Hedera Testnet
export const wagmiConfig = createConfig({
  chains: [hederaTestnet],
  connectors: [injected()],
  transports: {
    [hederaTestnet.id]: http(HEDERA_RPC_URL),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
})

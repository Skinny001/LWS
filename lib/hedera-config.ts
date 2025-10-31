// Hedera Testnet Configuration
// Hedera Testnet Configuration (allow overrides via NEXT_PUBLIC_ env vars)
export const HEDERA_TESTNET_ID = Number(process.env.NEXT_PUBLIC_HEDERA_CHAIN_ID ?? 296)
export const HEDERA_TESTNET_NAME = process.env.NEXT_PUBLIC_HEDERA_CHAIN_NAME ?? "Hedera Testnet"
export const HEDERA_RPC_URL = process.env.NEXT_PUBLIC_HEDERA_RPC_URL ?? "https://testnet.hashio.io/rpc"

export const LSW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LSW_CONTRACT_ADDRESS ?? "0xDBdB83000b490b239ddA8E9efcAB2f3b9c3c2BdC"
export const MINIMUM_STAKE = BigInt(process.env.NEXT_PUBLIC_MINIMUM_STAKE ?? "1000000") // 0.01 HBAR in wei

// feature toggle: if set to "true" client will fall back to mock service
export const USE_MOCK_SERVICE = (process.env.NEXT_PUBLIC_USE_MOCK_SERVICE ?? "false") === "true"

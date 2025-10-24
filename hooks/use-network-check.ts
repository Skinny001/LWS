import { useAccount } from "wagmi"
import { HEDERA_TESTNET_ID, HEDERA_TESTNET_NAME } from "@/lib/hedera-config"

export function useNetworkCheck() {
  const { chainId } = useAccount()
  const isOnHedera = chainId === HEDERA_TESTNET_ID

  return {
    isOnHedera,
    currentChainId: chainId,
    hederaName: HEDERA_TESTNET_NAME,
    hederaId: HEDERA_TESTNET_ID,
  }
}

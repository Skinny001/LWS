import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { createPublicClient, http } from "viem"
import { hederaTestnet } from "@/lib/wagmi-config"

export function useWalletBalance() {
  const { address, isConnected } = useAccount()
  const [balance, setBalance] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setBalance(BigInt(0))
      return
    }
    setLoading(true)
    const publicClient = createPublicClient({
      transport: http(hederaTestnet.rpcUrls.default.http[0]),
      chain: hederaTestnet,
    })
    publicClient.getBalance({ address: address as `0x${string}` })
      .then((bal) => setBalance(bal))
      .finally(() => setLoading(false))
  }, [address, isConnected])

  return { balance, loading }
}

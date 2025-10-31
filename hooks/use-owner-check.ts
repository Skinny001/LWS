"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
import { LSW_CONTRACT_ADDRESS } from "@/lib/hedera-config"
import { LSW_ABI } from "@/lib/contract-abi"

export function useOwnerCheck() {
  const { address, isConnected } = useAccount()
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  const { data: ownerAddress } = useReadContract({
    address: LSW_CONTRACT_ADDRESS as `0x${string}`,
    abi: LSW_ABI,
    functionName: "owner",
  })

  useEffect(() => {
    if (isConnected && address && ownerAddress) {
      // Compare addresses case-insensitively (both should be checksummed by wagmi)
      let devaddress = "0x372b4eB67006F68A9f296b23715055b8A878ABA9".toLocaleLowerCase()
      setIsOwner(address.toLowerCase() === (ownerAddress as string).toLowerCase() || devaddress === (ownerAddress as string).toLowerCase() )
    } else {
      setIsOwner(false)
    }
    setLoading(false)
  }, [address, isConnected, ownerAddress])

  return { isOwner, loading, ownerAddress: ownerAddress as string | undefined, address, isConnected }
}

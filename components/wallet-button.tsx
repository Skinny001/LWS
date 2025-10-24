"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { HEDERA_TESTNET_ID, HEDERA_TESTNET_NAME } from "@/lib/hedera-config"
import { Button } from "@/components/ui/button"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { formatEther } from "@/lib/format-utils"

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { balance, loading } = useWalletBalance()

  const isOnHedera = chainId === HEDERA_TESTNET_ID

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <span className="text-xs text-accent font-semibold bg-accent/10 px-2 py-1 rounded">
          {loading ? "..." : `${formatEther(balance)} HBAR`}
        </span>
        <Button onClick={() => disconnect()} variant="default" size="sm" className="bg-accent text-accent-foreground">
          Disconnect
        </Button>
        {!isOnHedera && (
          <div className="text-xs text-destructive font-semibold ml-2">
            Wrong network! Please switch to {HEDERA_TESTNET_NAME} (Chain ID: {HEDERA_TESTNET_ID}) in your wallet.
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      onClick={() => {
        const injectedConnector = connectors.find((c) => c.id === "injected")
        if (injectedConnector) {
          connect({ connector: injectedConnector })
        }
      }}
      size="sm"
  variant="default"
      className="bg-accent text-accent-foreground"
    >
      Connect Wallet
    </Button>
  )
}

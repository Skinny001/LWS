"use client"

import { useState, useEffect } from "react"
import { useContractWrite } from "@/hooks/use-contract-write"
import { Button } from "@/components/ui/button"
import { formatEther } from "@/lib/format-utils"
import { MINIMUM_STAKE } from "@/lib/hedera-config"

interface StakingInterfaceProps {
  isStakingAvailable: boolean
  isRoundExpired: boolean
  isActive: boolean
}

export function StakingInterface({ isStakingAvailable, isRoundExpired, isActive }: StakingInterfaceProps) {
  const { executeStake, executeStartNewRound, isLoading, error, hash, isConnected, address } = useContractWrite()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showWalletPrompt, setShowWalletPrompt] = useState(false)

  useEffect(() => {
    if (hash) {
      setSuccessMessage(`Transaction submitted: ${hash.slice(0, 10)}...`)
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [hash])

  useEffect(() => {
    if (error) {
      setLocalError(error)
      const timer = setTimeout(() => setLocalError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleStake = async () => {
    if (!isConnected) {
      setShowWalletPrompt(true)
      setLocalError("Please connect your wallet to stake")
      return
    }
    setLocalError(null)
    setSuccessMessage(null)
    await executeStake()
  }

  const handleStartNewRound = async () => {
    if (!isConnected) {
      setShowWalletPrompt(true)
      setLocalError("Please connect your wallet to start a new round")
      return
    }
    setLocalError(null)
    setSuccessMessage(null)
    await executeStartNewRound()
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Stake HBAR</h3>
        <p className="text-sm text-muted-foreground">Minimum stake: {formatEther(MINIMUM_STAKE)} HBAR</p>
        {isConnected && address && (
          <p className="text-xs text-accent">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </div>

      {isRoundExpired ? (
        <div className="space-y-3">
          <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
            <p className="text-sm text-destructive">Round has expired. Start a new round to continue playing.</p>
          </div>
          <Button
            onClick={handleStartNewRound}
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {isLoading ? "Starting Round..." : "Start New Round"}
          </Button>
        </div>
      ) : !isActive ? (
        <div className="space-y-3">
          <div className="bg-muted/20 border border-muted/30 rounded p-3">
            <p className="text-sm text-muted-foreground">Waiting for the round to start...</p>
          </div>
          <Button disabled className="w-full" size="lg">
            Staking Not Available
          </Button>
        </div>
      ) : !isStakingAvailable ? (
        <div className="space-y-3">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3">
            <p className="text-sm text-orange-400">Staking is temporarily unavailable. Please wait...</p>
          </div>
          <Button disabled className="w-full" size="lg">
            Staking Unavailable
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={handleStake}
            disabled={isLoading || !isConnected}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {!isConnected
              ? "Connect Wallet to Stake"
              : isLoading
                ? "Processing..."
                : `Stake ${formatEther(MINIMUM_STAKE)} HBAR`}
          </Button>
        </div>
      )}

      {localError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="text-sm text-destructive">{localError}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-accent/10 border border-accent/30 rounded p-3">
          <p className="text-sm text-accent">{successMessage}</p>
        </div>
      )}

      {/* Info section */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Each stake extends the deadline by 5 minutes</p>
          <p>• Last staker wins 70% of the prize pool</p>
          <p>• Random participants win 20%</p>
        </div>
      </div>
    </div>
  )
}

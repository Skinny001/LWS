"use client"

import { useState, useEffect } from "react"
import { useContractWrite } from "@/hooks/use-contract-write"
import { Button } from "@/components/ui/button"
import { formatEther } from "@/lib/format-utils"
import { MINIMUM_STAKE } from "@/lib/hedera-config"
import { parseEther } from "@/lib/format-utils"

interface StakingInterfaceProps {
  isStakingAvailable: boolean
  isRoundExpired: boolean
  isActive: boolean
  stakeAmountUpdated?: number;
}

export function StakingInterface({ isStakingAvailable, isRoundExpired, isActive, stakeAmountUpdated }: StakingInterfaceProps) {
  const { executeStake, executeStartNewRound, isLoading, error, hash, isConnected, address } = useContractWrite()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showWalletPrompt, setShowWalletPrompt] = useState(false)
  const [stakeInput, setStakeInput] = useState<string>("")
  const [isAmountValid, setIsAmountValid] = useState<boolean>(true)
  const [minimumStake, setMinimumStake] = useState<bigint>(MINIMUM_STAKE)
  // Fetch minimum stake from contract on mount and when round changes
  useEffect(() => {
    let mounted = true
    async function fetchStakeAmount() {
      try {
        const { getStakeAmount } = await import("@/lib/contract-service")
        const stakeAmt = await getStakeAmount()
        if (mounted) {
          setMinimumStake(stakeAmt)
          setStakeInput((prev) => prev === "" ? formatEther(stakeAmt) : prev)
        }
      } catch {}
    }
    fetchStakeAmount()
    return () => { mounted = false }
  }, [isActive, isRoundExpired, stakeAmountUpdated])

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
      console.log("Stake failed: wallet not connected")
      return
    }
    setLocalError(null)
    setSuccessMessage(null)
    // parse input and validate
    const parsed = parseEther(stakeInput)
    console.log("Parsed stake input:", stakeInput, "->", parsed)
    if (parsed === null) {
      setLocalError("Invalid amount format")
      console.log("Stake failed: invalid amount format", stakeInput)
      return
    }
    if (parsed < minimumStake) {
      setLocalError(`Minimum stake is ${formatEther(minimumStake)} HBAR`)
      console.log("Stake failed: below minimum", parsed, minimumStake)
      return
    }
    try {
      const result = await executeStake(parsed)
      console.log("Stake transaction result:", result)
    } catch (err) {
      console.log("Stake transaction error:", err)
    }
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
        <p className="text-sm text-muted-foreground">Minimum stake: {formatEther(minimumStake)} HBAR</p>
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
      ) : !isStakingAvailable ? (
        <div className="space-y-3">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3">
            <p className="text-sm text-orange-400">Staking is temporarily unavailable.<br />You must wait up to 10 minutes before staking is available again for the next round.</p>
          </div>
          <Button disabled className="w-full" size="lg">
            Staking Unavailable
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={stakeInput}
              onChange={(e) => {
                const v = e.target.value
                setStakeInput(v)
                const parsed = parseEther(v)
                setIsAmountValid(parsed !== null && parsed >= MINIMUM_STAKE)
              }}
              className="input input-bordered w-full"
              aria-label="Stake amount in HBAR"
            />
            <div className="text-xs text-muted-foreground">HBAR</div>
          </div>
          {!isAmountValid && (
            <div className="text-xs text-destructive">Amount must be a valid number and at least {formatEther(MINIMUM_STAKE)} HBAR</div>
          )}
          <Button
            onClick={handleStake}
            disabled={isLoading || !isConnected || !isAmountValid}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {!isConnected
              ? "Connect Wallet to Stake"
              : isLoading
                ? "Processing..."
                : `Stake ${stakeInput ?? formatEther(MINIMUM_STAKE)} HBAR`}
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

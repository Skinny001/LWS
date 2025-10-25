"use client"

import { useContractRead } from "@/hooks/use-contract-read"
import { useContractEvents, type StakeEvent, type RoundEndedEvent } from "@/hooks/use-contract-events"
import { useState, useCallback, useEffect } from "react"
import { TimerDisplay } from "@/components/timer-display"
import { PrizePoolCard } from "@/components/prize-pool-card"
import { StakingInterface } from "@/components/staking-interface"
import { ActivityFeed } from "@/components/activity-feed"
import { GameStatus } from "@/components/game-status"
import { RoundHistory } from "@/components/round-history"
import { WalletButton } from "@/components/wallet-button"
import { AdminPanel } from "@/components/admin-panel"

export default function Home() {
  const { roundInfo, timeRemaining, timeUntilStaking, isStakingAvailable, loading, error } = useContractRead()
  type ActivityType = "stake" | "round_end" | "round_start"
  type Activity = { id: string; type: ActivityType; data: any; timestamp: number }
  const [activities, setActivities] = useState<Activity[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStakeEvent = useCallback((event: StakeEvent) => {
    setActivities((prev) => {
      let baseId = `stake-${event.roundId}-${event.timestamp}`
      let id = baseId
      // Ensure uniqueness in the current list
      if (prev.some(a => a.id === id)) {
        id = `${baseId}-${Math.floor(Math.random() * 100000)}`
      }
      return [
        {
          id,
          type: "stake",
          data: event,
          timestamp: event.timestamp,
        },
        ...prev.slice(0, 9),
      ]
    })
  }, [])

  const handleRoundEndedEvent = useCallback((event: RoundEndedEvent) => {
    setActivities((prev) => {
      let baseId = `round-end-${event.roundId}-${event.timestamp}`
      let id = baseId
      // Ensure uniqueness in the current list
      if (prev.some(a => a.id === id)) {
        id = `${baseId}-${Math.floor(Math.random() * 100000)}`
      }
      return [
        {
          id,
          type: "round_end",
          data: event,
          timestamp: event.timestamp,
        },
        ...prev.slice(0, 9),
      ]
    })
  }, [])

  useContractEvents(handleStakeEvent, undefined, handleRoundEndedEvent)

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 fade-in">
          <div className="text-4xl font-bold text-accent float">Last Staker Wins</div>
          <div className="text-muted-foreground">Loading game data...</div>
        </div>
      </div>
    )
  }

  if (error || !roundInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 fade-in">
          <div className="text-4xl font-bold text-accent">Last Staker Wins</div>
          <div className="text-destructive">{error || "Failed to load game data"}</div>
          <div className="text-sm text-muted-foreground mt-4">Make sure you're connected to Hedera Testnet</div>
        </div>
      </div>
    )
  }

  const isRoundExpired = Number(timeRemaining) === 0

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              <span className="text-accent-foreground font-bold">LSW</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Last Staker Wins</h1>
              <p className="text-xs text-muted-foreground">Hedera Testnet</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Round #{roundInfo.roundId.toString()}</div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Game Status Banner */}
        <div className="slide-in-up">
          <GameStatus
            isActive={roundInfo.isActive}
            isStakingAvailable={isStakingAvailable}
            timeRemaining={timeRemaining}
            timeUntilStaking={timeUntilStaking}
          />
        </div>

        {/* Timer Section */}
        <div className="bg-card border border-border rounded-lg p-8 text-center slide-in-up">
          <TimerDisplay
            timeRemaining={timeRemaining}
            timeUntilStaking={timeUntilStaking}
            isStakingAvailable={isStakingAvailable}
            isActive={roundInfo.isActive}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Prize Pool */}
          <div className="lg:col-span-1 slide-in-up">
            <PrizePoolCard
              totalAmount={roundInfo.totalAmount}
              stakersCount={roundInfo.stakersCount}
              lastStaker={roundInfo.lastStaker}
            />
          </div>

          {/* Middle Column - Staking */}
          <div className="lg:col-span-1 slide-in-up">
            <StakingInterface
              isStakingAvailable={isStakingAvailable}
              isRoundExpired={isRoundExpired}
              isActive={roundInfo.isActive}
            />
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1 slide-in-up">
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Round History Section */}
        <div className="slide-in-up">
          <RoundHistory />
        </div>
        {/* Admin Panel (remove/comment for production) */}
        <AdminPanel />
      </div>
    </main>
  )
}

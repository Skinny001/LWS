"use client"

import { useState, useEffect } from "react"
import { formatEther } from "@/lib/format-utils"
import { fetchRecentRounds } from "@/lib/contract-service"

interface RoundRecord {
  roundId: bigint
  winner: string
  totalAmount: bigint
  stakersCount?: number
  timestamp: number
  rewards?: {
    winnerAmount: bigint
    participantAmount: bigint
    treasuryAmount: bigint
    randomWinners: string[]
  }
}

export function RoundHistory() {
  const [rounds, setRounds] = useState<RoundRecord[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const recent = await fetchRecentRounds(10)
      if (!mounted) return
      if (recent && recent.length > 0) {
        setRounds(
          recent.map((r: any) => {
            // Calculate reward breakdown (contract: 70/20/10)
            const total = BigInt(r.totalAmount ?? BigInt(0))
            const winnerAmount = (total * BigInt(70)) / BigInt(100)
            const participantAmount = (total * BigInt(20)) / BigInt(100)
            const treasuryAmount = (total * BigInt(10)) / BigInt(100)
            // Placeholder for random winners (should come from backend/event)
            const randomWinners = Array(10).fill("0x0000000000000000000000000000000000000000")
            return {
              roundId: BigInt(r.roundId ?? BigInt(0)),
              winner: String(r.winner ?? "0x0000000000000000000000000000000000000000"),
              totalAmount: total,
              stakersCount: Number(r.stakersCount ?? 0),
              timestamp: Number(r.timestamp ?? Date.now()),
              rewards: {
                winnerAmount,
                participantAmount,
                treasuryAmount,
                randomWinners,
              },
            }
          }),
        )
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const formatAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "None"
    return addr
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Round History</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {rounds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No completed rounds yet</p>
          </div>
        ) : (
          rounds.map((round) => (
            <div key={round.roundId.toString()} className="p-3 bg-background rounded border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">Round #{round.roundId.toString()}</span>
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                  {round.stakersCount} stakers
                </span>
                <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(round.timestamp)}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">Winner: {formatAddress(round.winner)}</div>
              <div className="text-xs text-accent font-semibold">Prize: {formatEther(round.totalAmount)} HBAR</div>
              {round.rewards && (
                <div className="mt-2 text-xs space-y-1">
                  <div>Winner Reward: <span className="text-green-600 font-bold">{formatEther(round.rewards.winnerAmount)} HBAR</span></div>
                  <div>Random Participants: <span className="text-blue-600 font-bold">{formatEther(round.rewards.participantAmount)} HBAR</span></div>
                  <div>Treasury: <span className="text-yellow-600 font-bold">{formatEther(round.rewards.treasuryAmount)} HBAR</span></div>
                  <div>Random Winners: <span className="text-muted-foreground">{round.rewards.randomWinners.map((addr, i) => (
                    <span key={i} className="inline-block mr-1">{formatAddress(addr)}</span>
                  ))}</span></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

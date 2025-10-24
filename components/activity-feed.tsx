"use client"

import { formatEther } from "@/lib/format-utils"

interface Activity {
  id: string
  type: "stake" | "round_start" | "round_end"
  data: any
  timestamp: number
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const formatAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "None"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "stake":
        return "📍"
      case "round_end":
        return "🏆"
      case "round_start":
        return "🎮"
      default:
        return "•"
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Live Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Waiting for activity...</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-background rounded border border-border/50 hover:border-border transition-colors"
            >
              <div className="text-lg mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                {activity.type === "stake" && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-accent">{formatAddress(activity.data.staker)}</span> staked
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.data.amount ? formatEther(activity.data.amount) : "0"} HBAR
                    </p>
                  </div>
                )}
                {activity.type === "round_end" && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-accent">{formatAddress(activity.data.winner)}</span> won the round
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prize: {formatEther(activity.data.totalAmount)} HBAR
                    </p>
                  </div>
                )}
                {activity.type === "round_start" && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Round started</p>
                    <p className="text-xs text-muted-foreground">Round #{activity.data.roundId?.toString()}</p>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(activity.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

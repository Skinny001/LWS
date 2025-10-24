"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useContractWrite } from "@/hooks/use-contract-write"

export function AdminPanel() {
  const { executeStartNewRound, executeEmergencyWithdraw, executeUpdateStakeAmount, executeUpdateBufferSettings, executeUpdateStakingWaitPeriod, isLoading, error, hash, isConnected } = useContractWrite()
  const [stakeAmount, setStakeAmount] = useState(0)
  const [stakeBuffer, setStakeBuffer] = useState(0)
  const [bufferDelay, setBufferDelay] = useState(0)
  const [stakingWaitPeriod, setStakingWaitPeriod] = useState(0)

  // Comment out the entire panel for production
  // return null

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Admin Controls (Owner Only)</h3>
      <div className="space-y-2">
        <Button onClick={executeStartNewRound} disabled={isLoading || !isConnected} className="w-full">
          Start New Round
        </Button>
        <Button onClick={executeEmergencyWithdraw} disabled={isLoading || !isConnected} className="w-full">
          Emergency Withdraw
        </Button>
      </div>
      <div className="space-y-2">
        <div>
          <label className="block text-sm">Stake Amount</label>
          <input type="number" value={stakeAmount} onChange={e => setStakeAmount(Number(e.target.value))} className="input input-bordered w-full" />
          <Button onClick={() => executeUpdateStakeAmount(stakeAmount)} disabled={isLoading || !isConnected} className="w-full mt-2">
            Update Stake Amount
          </Button>
        </div>
        <div>
          <label className="block text-sm">Stake Buffer</label>
          <input type="number" value={stakeBuffer} onChange={e => setStakeBuffer(Number(e.target.value))} className="input input-bordered w-full" />
          <label className="block text-sm mt-1">Buffer Delay</label>
          <input type="number" value={bufferDelay} onChange={e => setBufferDelay(Number(e.target.value))} className="input input-bordered w-full" />
          <Button onClick={() => executeUpdateBufferSettings(stakeBuffer, bufferDelay)} disabled={isLoading || !isConnected} className="w-full mt-2">
            Update Buffer Settings
          </Button>
        </div>
        <div>
          <label className="block text-sm">Staking Wait Period</label>
          <input type="number" value={stakingWaitPeriod} onChange={e => setStakingWaitPeriod(Number(e.target.value))} className="input input-bordered w-full" />
          <Button onClick={() => executeUpdateStakingWaitPeriod(stakingWaitPeriod)} disabled={isLoading || !isConnected} className="w-full mt-2">
            Update Staking Wait Period
          </Button>
        </div>
      </div>
      {error && <div className="text-destructive mt-2">{error}</div>}
      {hash && <div className="text-accent mt-2">Tx: {hash.slice(0, 10)}...</div>}
    </div>
  )
}

// To hide admin panel in production, uncomment below:
// export function AdminPanel() { return null }

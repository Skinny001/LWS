"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useContractWrite } from "@/hooks/use-contract-write"

interface AdminPanelProps {
  onStakeAmountUpdate?: () => void;
}

export function AdminPanel({ onStakeAmountUpdate }: AdminPanelProps) {
  const { executeStartNewRound, executeEmergencyWithdraw, executeUpdateStakeAmount, executeUpdateBufferSettings, executeUpdateStakingWaitPeriod, isLoading, error, hash, isConnected } = useContractWrite()
  const [stakeAmount, setStakeAmount] = useState<string>("")
  const [stakeBuffer, setStakeBuffer] = useState(0)
  const [bufferDelay, setBufferDelay] = useState(0)
  const [stakingWaitPeriod, setStakingWaitPeriod] = useState<string>("")
  const [inputError, setInputError] = useState<string | null>(null)

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
          <input
            type="number"
            step="0.00000001"
            min="0"
            value={stakeAmount}
            onChange={e => {
              const val = e.target.value;
              if (!/^\d*(\.\d{0,8})?$/.test(val)) {
                setInputError("Stake amount must be a non-negative number with up to 8 decimals.");
              } else {
                setInputError(null);
              }
              setStakeAmount(val);
            }}
            className="input input-bordered w-full"
          />
          <Button
            onClick={async () => {
              const num = Number(stakeAmount);
              if (isNaN(num) || num < 0) {
                setInputError("Stake amount must be a non-negative number.");
                return;
              }
              // Convert HBAR to tinybars (8 decimals)
              const [whole, fraction = ""] = stakeAmount.split(".");
              const tinybars = BigInt(whole) * BigInt(1e8) + BigInt(fraction.padEnd(8, "0"));
              setInputError(null);
              const result = await executeUpdateStakeAmount(tinybars);
              if (onStakeAmountUpdate && result) {
                onStakeAmountUpdate();
              }
            }}
            disabled={isLoading || !isConnected}
            className="w-full mt-2"
          >
            Update Stake Amount
          </Button>
        </div>
        <div>
          <label className="block text-sm">Stake Buffer</label>
          <input
            type="number"
            step="1"
            min="0"
            value={stakeBuffer}
            onChange={e => {
              const val = e.target.value;
              if (!/^\d+$/.test(val)) {
                setInputError("Stake buffer must be an integer.");
                setStakeBuffer(0);
              } else {
                setInputError(null);
                setStakeBuffer(Number(val));
              }
            }}
            className="input input-bordered w-full"
          />
          <label className="block text-sm mt-1">Buffer Delay</label>
          <input
            type="number"
            step="1"
            min="0"
            value={bufferDelay}
            onChange={e => {
              const val = e.target.value;
              if (!/^\d+$/.test(val)) {
                setInputError("Buffer delay must be an integer.");
                setBufferDelay(0);
              } else {
                setInputError(null);
                setBufferDelay(Number(val));
              }
            }}
            className="input input-bordered w-full"
          />
          <Button
            onClick={() => {
              if (!Number.isInteger(stakeBuffer) || stakeBuffer < 0 || !Number.isInteger(bufferDelay) || bufferDelay < 0) {
                setInputError("Stake buffer and buffer delay must be non-negative integers.");
                return;
              }
              setInputError(null);
              executeUpdateBufferSettings(stakeBuffer, bufferDelay);
            }}
            disabled={isLoading || !isConnected}
            className="w-full mt-2"
          >
            Update Buffer Settings
          </Button>
        </div>
        <div>
          <label className="block text-sm">Staking Wait Period</label>
          <input
            type="number"
            step="1"
            min="0"
            value={stakingWaitPeriod}
            onChange={e => {
              const val = e.target.value;
              if (!/^\d+$/.test(val)) {
                setInputError("Staking wait period must be a non-negative integer (minutes).");
              } else {
                setInputError(null);
              }
              setStakingWaitPeriod(val);
            }}
            className="input input-bordered w-full"
          />
          <Button
            onClick={() => {
              const num = Number(stakingWaitPeriod);
              if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
                setInputError("Staking wait period must be a non-negative integer (minutes).");
                return;
              }
              // Convert minutes to seconds for contract
              const seconds = BigInt(num * 60);
              setInputError(null);
              executeUpdateStakingWaitPeriod(seconds);
            }}
            disabled={isLoading || !isConnected}
            className="w-full mt-2"
          >
            Update Staking Wait Period
          </Button>
        </div>
      </div>
  {(inputError || error) && <div className="text-destructive mt-2">{inputError || error}</div>}
  {hash && <div className="text-accent mt-2">Tx: {hash.slice(0, 10)}...</div>}
    </div>
  )
}

// To hide admin panel in production, uncomment below:
// export function AdminPanel() { return null }

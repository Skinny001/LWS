// Utility functions to replace viem formatEther
export function formatEther(value: bigint): string {
  const decimals = 18
  let divisor = BigInt(1)
  for (let i = 0; i < decimals; i++) {
    divisor *= BigInt(10)
  }
  const whole = value / divisor
  const remainder = value % divisor

  if (remainder === BigInt(0)) {
    return whole.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, "0").replace(/0+$/, "")
  return `${whole}.${remainderStr}`
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

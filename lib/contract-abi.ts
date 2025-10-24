/* LSW ABI (full) and Rewarder ABI
   Replaced with the ABIs supplied by the user to ensure full decoding and function signatures
*/

export const LSW_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct LSW.ConstructorParams",
        "components": [
          { "name": "stakeBuffer", "type": "uint256", "internalType": "uint256" },
          { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" },
          { "name": "roundDuration", "type": "uint256", "internalType": "uint256" },
          { "name": "bufferDelay", "type": "uint256", "internalType": "uint256" },
          { "name": "stakingWaitPeriod", "type": "uint256", "internalType": "uint256" },
          { "name": "treasury", "type": "address", "internalType": "address" }
        ]
      }
    ],
    "stateMutability": "nonpayable"
  },
  { "type": "receive", "stateMutability": "payable" },
  { "type": "function", "name": "bufferDelay", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "closeRound", "inputs": [{ "name": "_roundId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "view" },
  { "type": "function", "name": "emergencyWithdraw", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "getCurrentRoundInfo", "inputs": [], "outputs": [
    { "name": "currentRoundId", "type": "uint256", "internalType": "uint256" },
    { "name": "lastStaker", "type": "address", "internalType": "address" },
    { "name": "totalAmount", "type": "uint256", "internalType": "uint256" },
    { "name": "deadline", "type": "uint256", "internalType": "uint256" },
    { "name": "isActive", "type": "bool", "internalType": "bool" },
    { "name": "stakersCount", "type": "uint256", "internalType": "uint256" },
    { "name": "stakingAvailableAt", "type": "uint256", "internalType": "uint256" }
  ], "stateMutability": "view" },
  { "type": "function", "name": "getRoundStakers", "inputs": [{ "name": "_roundId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address[]", "internalType": "address[]" }], "stateMutability": "view" },
  { "type": "function", "name": "getTimeRemaining", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getTimeUntilStakingAvailable", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "isStakingAvailable", "inputs": [], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" },
  { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "rewarderContract", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "roundDuration", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "roundId", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "roundStakers", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "setRewarderContract", "inputs": [{ "name": "_rewarderContract", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "setTreasury", "inputs": [{ "name": "_treasury", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "stake", "inputs": [], "outputs": [], "stateMutability": "payable" },
  { "type": "function", "name": "stakeAmount", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "stakeBuffer", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "stakes", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "outputs": [
    { "name": "winner", "type": "address", "internalType": "address" },
    { "name": "amount", "type": "uint256", "internalType": "uint256" },
    { "name": "deadline", "type": "uint256", "internalType": "uint256" },
    { "name": "roundId", "type": "uint256", "internalType": "uint256" },
    { "name": "lastStaker", "type": "address", "internalType": "address" },
    { "name": "isActive", "type": "bool", "internalType": "bool" },
    { "name": "claimed", "type": "bool", "internalType": "bool" }
  ], "stateMutability": "view" },
  { "type": "function", "name": "stakingStartTime", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "stakingWaitPeriod", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "startNewRound", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "treasury", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "updateBufferSettings", "inputs": [{ "name": "_stakeBuffer", "type": "uint256", "internalType": "uint256" }, { "name": "_bufferDelay", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "updateStakeAmount", "inputs": [{ "name": "_stakeAmount", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "updateStakingWaitPeriod", "inputs": [{ "name": "_stakingWaitPeriod", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "event", "name": "RewardsDistributed", "inputs": [
    { "name": "roundId", "type": "uint256", "indexed": true, "internalType": "uint256" },
    { "name": "winner", "type": "address", "indexed": true, "internalType": "address" },
    { "name": "winnerAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
    { "name": "participantAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
    { "name": "treasuryAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }
  ], "anonymous": false },
  { "type": "event", "name": "RoundEnded", "inputs": [
    { "name": "roundId", "type": "uint256", "indexed": true, "internalType": "uint256" },
    { "name": "winner", "type": "address", "indexed": true, "internalType": "address" },
    { "name": "totalAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }
  ], "anonymous": false },
  { "type": "event", "name": "RoundStarted", "inputs": [
    { "name": "roundId", "type": "uint256", "indexed": true, "internalType": "uint256" },
    { "name": "deadline", "type": "uint256", "indexed": true, "internalType": "uint256" },
    { "name": "_stakingStartTime", "type": "uint256", "indexed": true, "internalType": "uint256" }
  ], "anonymous": false },
  { "type": "event", "name": "StakeReceived", "inputs": [
    { "name": "roundId", "type": "uint256", "indexed": true, "internalType": "uint256" },
    { "name": "staker", "type": "address", "indexed": true, "internalType": "address" },
    { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" },
    { "name": "newDeadline", "type": "uint256", "indexed": false, "internalType": "uint256" }
  ], "anonymous": false },
  { "type": "error", "name": "InsufficientStakeAmount", "inputs": [] },
  { "type": "error", "name": "InvalidRoundId", "inputs": [] },
  { "type": "error", "name": "PermissionDenied", "inputs": [] },
  { "type": "error", "name": "RewarderNotSet", "inputs": [] },
  { "type": "error", "name": "RoundAlreadyClaimed", "inputs": [] },
  { "type": "error", "name": "RoundExpired", "inputs": [] },
  { "type": "error", "name": "RoundNotEnded", "inputs": [] },
  { "type": "error", "name": "StakingNotYetAvailable", "inputs": [] },
  { "type": "error", "name": "TransferFailed", "inputs": [] },
  { "type": "error", "name": "ZeroAddress", "inputs": [] }
] as const

export const REWARDER_ABI = [
  { "type": "constructor", "inputs": [ { "name": "_lswContract", "type": "address", "internalType": "address" }, { "name": "_hederaPrngAddress", "type": "address", "internalType": "address" } ], "stateMutability": "nonpayable" },
  { "type": "receive", "stateMutability": "payable" },
  { "type": "function", "name": "emergencyWithdraw", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "generateRandomNumber", "inputs": [ { "name": "lo", "type": "uint32", "internalType": "uint32" }, { "name": "hi", "type": "uint32", "internalType": "uint32" } ], "outputs": [ { "name": "", "type": "uint32", "internalType": "uint32" } ], "stateMutability": "nonpayable" },
  { "type": "function", "name": "hederaPrngAddress", "inputs": [], "outputs": [ { "name": "", "type": "address", "internalType": "address" } ], "stateMutability": "view" },
  { "type": "function", "name": "lswContract", "inputs": [], "outputs": [ { "name": "", "type": "address", "internalType": "address" } ], "stateMutability": "view" },
  { "type": "function", "name": "manualDistribution", "inputs": [ { "name": "roundId", "type": "uint256", "internalType": "uint256" }, { "name": "participantAmount", "type": "uint256", "internalType": "uint256" }, { "name": "treasuryAmount", "type": "uint256", "internalType": "uint256" } ], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "owner", "inputs": [], "outputs": [ { "name": "", "type": "address", "internalType": "address" } ], "stateMutability": "view" },
  { "type": "function", "name": "prngContract", "inputs": [], "outputs": [ { "name": "", "type": "contract IPrngSystemContract", "internalType": "contract IPrngSystemContract" } ], "stateMutability": "view" },
  { "type": "function", "name": "rewardRandomParticipants", "inputs": [ { "name": "roundId", "type": "uint256", "internalType": "uint256" }, { "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "randomParticipantsAmount", "type": "uint256", "internalType": "uint256" }, { "name": "platformTreasuryAmount", "type": "uint256", "internalType": "uint256" } ], "outputs": [], "stateMutability": "payable" },
  { "type": "function", "name": "testPRNG", "inputs": [], "outputs": [ { "name": "", "type": "bytes32", "internalType": "bytes32" } ], "stateMutability": "nonpayable" },
  { "type": "function", "name": "updateHederaPrngAddress", "inputs": [ { "name": "_hederaPrngAddress", "type": "address", "internalType": "address" } ], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "updateLSWContract", "inputs": [ { "name": "_lswContract", "type": "address", "internalType": "address" } ], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "event", "name": "HederaPrngAddressUpdated", "inputs": [ { "name": "oldAddress", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newAddress", "type": "address", "indexed": true, "internalType": "address" } ], "anonymous": false },
  { "type": "event", "name": "RandomSeedGenerated", "inputs": [ { "name": "roundId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "seed", "type": "bytes32", "indexed": false, "internalType": "bytes32" } ], "anonymous": false },
  { "type": "event", "name": "RewardsDistributed", "inputs": [ { "name": "roundId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "winners", "type": "address[]", "indexed": false, "internalType": "address[]" }, { "name": "rewardPerWinner", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "treasuryAmount", "type": "uint256", "indexed": false, "internalType": "uint256" } ], "anonymous": false },
  { "type": "error", "name": "InsufficientParticipants", "inputs": [] },
  { "type": "error", "name": "NotLSW", "inputs": [] },
  { "type": "error", "name": "NotOwner", "inputs": [] },
  { "type": "error", "name": "RandomGenerationFailed", "inputs": [] },
  { "type": "error", "name": "TransferFailed", "inputs": [] },
  { "type": "error", "name": "ZeroAddress", "inputs": [] }
] as const

# Last Staker Win (LSW) - Smart Contract

## Overview

Last Staker Win (LSW) is a blockchain-based game where participants stake ETH to become the "last staker" within a time window. The last person to stake before the deadline wins the majority of the pool, while other participants and the platform treasury receive smaller rewards.

## 🚀 Major Update: Migration to Hedera PRNG

**The codebase has been significantly updated to use Hedera's native PRNG system instead of Chainlink VRF.** This change provides:

- ✅ **Synchronous operation** - immediate reward distribution  
- ✅ **Lower gas costs** - no external oracle fees
- ✅ **Native integration** - built into Hedera network
- ✅ **Simplified architecture** - single transaction flow
- ✅ **Configurable PRNG address** - updatable system contract reference

### Breaking Changes:
- **Rewarder contract constructor** now requires `_hederaPrngAddress` parameter
- **New admin function**: `updateHederaPrngAddress()` for updating PRNG system contract
- **Removed Chainlink VRF dependencies** - no more LINK tokens or subscriptions needed
- **Updated events** - new `HederaPrngAddressUpdated` and `RandomSeedGenerated` events

## Contract Architecture

The system consists of two main contracts:

### 1. LSW Contract (`LSW.sol`)
The main game contract that handles:
- Round management and timing
- Stake collection and validation
- Winner determination
- Emergency functions

### 2. Rewarder Contract (`Rewarder.sol`)
**Updated for Hedera Hashgraph Network:**
- Random participant selection using Hedera PRNG (Pseudo Random Number Generator)
- Synchronous reward distribution
- Direct integration with Hedera's system contract at `0x000000000000000000000000000000000064d1E2`
- Configurable PRNG address for different environments

## How It Works

### Game Flow

1. **Round Initialization**: A new round starts with a fixed duration (default: 1 hour)

2. **Wait Period**: After a new round starts, there's a configurable wait period (default: 10 minutes) before staking becomes available

3. **Staking Phase**: 
   - Users can stake ETH after the wait period ends (minimum amount required)
   - Each stake extends the deadline if made within the buffer period
   - The last person to stake becomes the potential winner

4. **Round End**:
   - Round ends when the deadline passes
   - The last staker becomes the winner
   - Stakes are locked until reward distribution

5. **Reward Distribution**:
   - **70%** goes to the winner
   - **20%** is distributed among random participants (up to 10)
   - **10%** goes to the platform treasury

6. **New Round**: Winner or contract owner can start the next round (with a new wait period)

### Timing Mechanics

- **Round Duration**: Base time for each round (configurable)
- **Staking Wait Period**: Time after round starts before staking becomes available (default: 10 minutes)
- **Buffer Delay**: If a stake occurs within this time of the deadline, it may extend the round
- **Stake Buffer**: Amount of time added to deadline when staking in buffer period

Example: After a new round starts, users must wait 10 minutes before they can stake. Once staking is available, if someone stakes within 10 minutes of the deadline (buffer delay), the deadline extends by the stake buffer amount.

## Key Features

### Fair Random Distribution
- **Now uses Hedera PRNG** for native, synchronous random participant selection
- Automatically distributes among all participants if ≤10 people
- Selects 10 random participants if >10 people (duplicates allowed)
- Immediate reward distribution in the same transaction

### Security Features
- Owner-only administrative functions
- Emergency withdrawal capabilities
- Input validation and error handling
- Reentrancy protection through careful state management
- Staking wait period prevents immediate staking rushes after new rounds

### Anti-Gridlock Protection
- Stake function no longer attempts refunds for expired rounds (prevents contract halts)
- Clear error messages for different failure scenarios
- Round expiration handling moved to `startNewRound()` function

### Flexible Configuration
- Adjustable stake amounts
- Configurable timing parameters
- Updatable treasury and rewarder addresses

## Contract Deployment

### Prerequisites

1. **Foundry Installation**: Make sure you have Foundry installed
2. **Environment Setup**: Create a `.env` file with:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

### For Hedera Hashgraph Network

The contracts have been specifically designed and optimized for deployment on Hedera Hashgraph using the native PRNG system.

#### Deployment Steps

1. **Update Configuration**: Edit `script/LSW.s.sol` and update:
   - `TREASURY`: Your treasury address (currently set to deployer address)
   - `HEDERA_PRNG_ADDRESS`: Hedera PRNG system contract (default: `0x000000000000000000000000000000000064d1E2`)
   - Timing and stake parameters as needed

2. **Deploy to Hedera**:
   ```bash
   # For Hedera testnet
   forge script script/LSW.s.sol:LSWScript --rpc-url https://testnet.hashio.io/api --broadcast --legacy
   
   # For Hedera mainnet  
   forge script script/LSW.s.sol:LSWScript --rpc-url https://mainnet.hashio.io/api --broadcast --legacy
   
   # For local testing with mock PRNG
   forge script script/LSW.s.sol:LSWScript --rpc-url http://localhost:8545 --broadcast --sig "deployWithMockPRNG()"
   ```

3. **Post-Deployment**:
   - Test PRNG connectivity using the `testPRNG()` function on the rewarder contract
   - Verify contracts on HashScan (Hedera block explorer)
   - Test with small amounts first
   - Update PRNG address if needed using `updateHederaPrngAddress()` function

## Testing

The project includes comprehensive tests covering both Chainlink VRF and Hedera PRNG implementations:

### Unit Tests
- **LSW.t.sol**: Tests for the main LSW contract
- **HederaRewarder.t.sol**: Tests for the Hedera PRNG Rewarder contract  
- **HederaIntegration.t.sol**: End-to-end integration tests with Hedera PRNG
- **MockHederaRewarder.sol**: Mock implementation for local testing

### Test Coverage
- Round lifecycle management
- Staking mechanics and validation
- Timing and deadline extensions
- Reward distribution logic
- Random number generation (both VRF and PRNG)
- Access control and permissions
- Edge cases and error conditions

### Running Tests

```bash
# Run all tests
forge test

# Run specific test suites
forge test --match-path test/LSW.t.sol
forge test --match-path test/HederaRewarder.t.sol
forge test --match-path test/HederaIntegration.t.sol

# Run tests with verbose output
forge test -vvv

# Run with gas reporting
forge test --gas-report

# Generate coverage report
forge coverage
```

## Hedera PRNG Implementation

The contracts now use **Hedera's native Pseudo Random Number Generator (PRNG)** for fair and efficient random participant selection:

### Key Features:
- **Synchronous Operation**: Random numbers generated immediately in same transaction
- **Native Integration**: Uses Hedera's built-in PRNG system contract at `0x000000000000000000000000000000000064d1E2`
- **Lower Gas Costs**: Single transaction for randomness and reward distribution
- **Network-Level Security**: Leverages Hedera's consensus mechanism for randomness
- **Configurable**: PRNG address can be updated if needed via `updateHederaPrngAddress()`

### How It Works:
1. Contract calls Hedera PRNG system contract to get a 32-byte random seed
2. Multiple random indices are derived from this seed using keccak256 hashing
3. Participants are selected using modulo operation to ensure indices stay within bounds
4. Rewards are distributed immediately in the same transaction

### Advantages over Chainlink VRF:
- **Immediate execution**: No waiting for callback fulfillment
- **Lower costs**: No LINK token requirements or subscription fees  
- **Simpler architecture**: Single-step process vs two-step VRF workflow
- **Native to Hedera**: Built-in network feature vs external oracle dependency

# Run with gas reporting
forge test --gas-report

# Generate coverage report
forge coverage
```

## Network Configuration

### Hedera Hashgraph
- **PRNG System Contract**: `0x000000000000000000000000000000000064d1E2`
- **Testnet RPC**: `https://testnet.hashio.io/api`
- **Mainnet RPC**: `https://mainnet.hashio.io/api`
- **Chain ID**: 296 (mainnet), 297 (testnet)

## API Reference

### LSW Contract

#### Main Functions
- `stake()`: Participate in the current round (after wait period)
- `startNewRound()`: Start a new round (winner or owner only)
- `getCurrentRoundInfo()`: Get current round information including staking availability
- `getTimeRemaining()`: Get time remaining in current round
- `getTimeUntilStakingAvailable()`: Get time until staking becomes available
- `isStakingAvailable()`: Check if staking is currently allowed

#### Admin Functions
- `setRewarderContract(address)`: Set the rewarder contract
- `setTreasury(address)`: Update treasury address
- `updateStakeAmount(uint256)`: Update minimum stake amount
- `updateBufferSettings(uint256, uint256)`: Update timing parameters
- `updateStakingWaitPeriod(uint256)`: Update staking wait period
- `emergencyWithdraw()`: Emergency withdrawal (owner only)

### Rewarder Contract

#### Main Functions
- `rewardRandomParticipants()`: Distribute rewards using Hedera PRNG (LSW contract only)
- `manualDistribution(uint256)`: Manual reward distribution (owner only)
- `testPRNG()`: Test PRNG connectivity and get random seed

#### Admin Functions
- `updateLSWContract(address)`: Update LSW contract address
- `updateHederaPrngAddress(address)`: Update Hedera PRNG system contract address
- `emergencyWithdraw()`: Emergency withdrawal (owner only)

## Events

### LSW Contract Events
- `RoundStarted(uint256 roundId, uint256 deadline)`
- `StakeReceived(uint256 roundId, address staker, uint256 amount, uint256 newDeadline)`
- `RoundEnded(uint256 roundId, address winner, uint256 totalAmount)`
- `RewardsDistributed(uint256 roundId, address winner, uint256 winnerAmount, uint256 participantAmount, uint256 treasuryAmount)`

### Common Error Messages
- `StakingNotYetAvailable()`: Attempted to stake during wait period
- `RoundExpired()`: Attempted to stake after round deadline
- `InsufficientStakeAmount()`: Stake amount below minimum required
- `RoundNotEnded()`: Attempted to start new round before current ends

### Rewarder Contract Events
- `RandomSeedGenerated(uint256 roundId, bytes32 seed)`
- `RewardsDistributed(uint256 roundId, address[] winners, uint256 rewardPerWinner, uint256 treasuryAmount)`
- `HederaPrngAddressUpdated(address indexed oldAddress, address indexed newAddress)`

## Security Considerations

1. **Hedera PRNG Dependency**: The system relies on Hedera's native PRNG for fair randomness
2. **Manual Fallback**: Manual distribution is available if PRNG fails
3. **Access Control**: Strict permissions for critical functions
4. **Emergency Functions**: Owner can withdraw funds in emergencies
5. **Input Validation**: All inputs are validated before processing
6. **Configurable PRNG**: PRNG address can be updated if the system contract changes

## Gas Optimization

- Efficient storage layout with struct packing
- Minimal external calls during staking
- Batch operations where possible
- Event emissions for off-chain indexing

## Upgradeability

The contracts are not upgradeable by design for security and trust. However, configuration parameters can be adjusted by the owner:
- Stake amounts and timing parameters
- Treasury and rewarder addresses
- Hedera PRNG system contract address

## License

This project is licensed under the UNLICENSED license.

---

**⚠️ Important**: 
- Always test thoroughly on testnets before mainnet deployment
- Never deploy with real funds without proper testing and security audits  
- The Hedera testnet deployment above is for testing purposes only
- Verify all contract addresses and PRNG connectivity before interacting
- Start with small stake amounts for initial testing

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

## Deployment Addresses

### Hedera Testnet
- **LSW Contract**: `0xDBdB83000b490b239ddA8E9efcAB2f3b9c3c2BdC`
- **Hedera Rewarder Contract**: `0x070F11A76F6a271E4e5B8c01fc573ad592823193`
- **Treasury**: `0x12896191de42EF8388f2892Ab76b9a728189260A`
- **Hedera PRNG System Contract**: `0x000000000000000000000000000000000064d1E2`
- **Deployer**: `0x12896191de42EF8388f2892Ab76b9a728189260A`

#### Deployment Success Details:
- **Deployer Balance**: 299.46 HBAR
- **All contracts deployed and configured successfully**
- **Rewarder contract set in LSW contract**
- **PRNG connectivity verified**

#### How to Test:
```solidity
// Test PRNG connectivity
cast call 0x070F11A76F6a271E4e5B8c01fc573ad592823193 "testPRNG()" --rpc-url https://testnet.hashio.io/api

// Check current round info
cast call 0xDBdB83000b490b239ddA8E9efcAB2f3b9c3c2BdC "getCurrentRoundInfo()" --rpc-url https://testnet.hashio.io/api

// Verify PRNG address
cast call 0x070F11A76F6a271E4e5B8c01fc573ad592823193 "hederaPrngAddress()" --rpc-url https://testnet.hashio.io/api
```

### Base Sepolia (Legacy Chainlink VRF Deployment)
- **LSW Contract**: `0x9a849937149f69921375a95f67c9ffDF0ECf2732`
- **Rewarder Contract**: `0x1FE132d12771e5dD296144123C2bA5B87987a96B`

---
  
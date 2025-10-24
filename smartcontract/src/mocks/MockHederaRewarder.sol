// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

// Mock Hedera PRNG Contract for testing
contract MockHederaPRNG {
    uint256 private seedCounter = 1;
    
    function getPseudorandomSeed() external returns (bytes32) {
        // Generate a pseudo-random seed for testing
        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seedCounter));
        seedCounter++;
        return seed;
    }
}

interface ILSW {
    function closeRound(uint256 roundId) external;
    function getRoundStakers(uint256 roundId) external view returns (address[] memory);
    function treasury() external view returns (address);
}

contract MockHederaRewarder {
    address public owner;
    address public lswContract;
    
    // Mock PRNG
    MockHederaPRNG public prngContract;
    address public hederaPrngAddress;

    
    // Events
    event RewardsDistributed(uint256 indexed roundId, address[] winners, uint256 rewardPerWinner, uint256 treasuryAmount);
    event RandomSeedGenerated(uint256 indexed roundId, bytes32 seed);
    event HederaPrngAddressUpdated(address indexed oldAddress, address indexed newAddress);

    error NotOwner();
    error NotLSW();
    error ZeroAddress();
    error InsufficientParticipants();
    error TransferFailed();
    error RandomGenerationFailed();

    constructor(address _lswContract, address _hederaPrngAddress) {
        if (_lswContract == address(0)) revert ZeroAddress();
        
        owner = msg.sender;
        lswContract = _lswContract;
        hederaPrngAddress = _hederaPrngAddress;
        prngContract = new MockHederaPRNG();
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyLSW() {
        if (msg.sender != lswContract) revert NotLSW();
        _;
    }

    function updateLSWContract(address _lswContract) external onlyOwner {
        if (_lswContract == address(0)) revert ZeroAddress();
        lswContract = _lswContract;
    }

    function updateHederaPrngAddress(address _hederaPrngAddress) external onlyOwner {
        if (_hederaPrngAddress == address(0)) revert ZeroAddress();
        
        address oldAddress = hederaPrngAddress;
        hederaPrngAddress = _hederaPrngAddress;
        // Note: For mock, we keep using the internal MockHederaPRNG instance
        // In production, this would update the actual PRNG contract reference
        
        emit HederaPrngAddressUpdated(oldAddress, _hederaPrngAddress);
    }

    // Function to reward random participants from the round participants
    function rewardRandomParticipants(
        uint256 roundId,
        uint256 /* winnerAmount */,
        uint256 randomParticipantsAmount,
        uint256 platformTreasuryAmount
    ) external payable onlyLSW {
        // Get all stakers for this round
        address[] memory allStakers = ILSW(lswContract).getRoundStakers(roundId);
        
        if (allStakers.length == 0) {
            // No participants, send everything to treasury
            _sendToTreasury(msg.value);
            return;
        }
        
        if (allStakers.length <= 10) {
            // If 10 or fewer participants, distribute equally among all
            _distributeToAllParticipants(roundId, allStakers, randomParticipantsAmount, platformTreasuryAmount);
        } else {
            // If more than 10 participants, select 10 random participants using Mock PRNG
            _distributeToRandomParticipants(roundId, allStakers, randomParticipantsAmount, platformTreasuryAmount);
        }
    }

    function _distributeToAllParticipants(
        uint256 roundId,
        address[] memory participants,
        uint256 participantAmount,
        uint256 treasuryAmount
    ) private {
        uint256 rewardPerParticipant = participantAmount / participants.length;
        
        // Distribute to all participants
        for (uint i = 0; i < participants.length; i++) {
            (bool participantSuccess, ) = payable(participants[i]).call{value: rewardPerParticipant}("");
            if (!participantSuccess) revert TransferFailed();
        }
        
        // Send treasury amount
        _sendToTreasury(treasuryAmount);
        
        emit RewardsDistributed(roundId, participants, rewardPerParticipant, treasuryAmount);
    }

    function _distributeToRandomParticipants(
        uint256 roundId,
        address[] memory allStakers,
        uint256 participantAmount,
        uint256 treasuryAmount
    ) private {
        // Generate random seed using Mock PRNG for testing
        bytes32 randomSeed = prngContract.getPseudorandomSeed();
        emit RandomSeedGenerated(roundId, randomSeed);
        
        // Select 10 random participants (duplicates allowed)
        address[] memory selectedParticipants = _selectRandomParticipants(allStakers, randomSeed);
        
        uint256 rewardPerParticipant = participantAmount / 10;
        
        // Distribute rewards to selected participants
        for (uint i = 0; i < 10; i++) {
            (bool success, ) = payable(selectedParticipants[i]).call{value: rewardPerParticipant}("");
            if (!success) revert TransferFailed();
        }
        
        // Send treasury amount
        _sendToTreasury(treasuryAmount);
        
        emit RewardsDistributed(roundId, selectedParticipants, rewardPerParticipant, treasuryAmount);
    }

    function _selectRandomParticipants(
        address[] memory allStakers,
        bytes32 randomSeed
    ) private pure returns (address[] memory) {
        address[] memory selected = new address[](10);
        
        // Use the random seed to select participants
        for (uint256 i = 0; i < 10; i++) {
            bytes32 indexedSeed = keccak256(abi.encodePacked(randomSeed, i));
            uint256 randomIndex = uint256(indexedSeed) % allStakers.length;
            selected[i] = allStakers[randomIndex];
        }
        
        return selected;
    }

    function _sendToTreasury(uint256 amount) private {
        address treasury = ILSW(lswContract).treasury();
        (bool success, ) = payable(treasury).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // Manual distribution fallback
    function manualDistribution(
        uint256 roundId,
        uint256 participantAmount,
        uint256 treasuryAmount
    ) external onlyOwner {
        address[] memory allStakers = ILSW(lswContract).getRoundStakers(roundId);
        
        if (allStakers.length == 0) {
            _sendToTreasury(participantAmount + treasuryAmount);
        } else {
            _distributeToAllParticipants(roundId, allStakers, participantAmount, treasuryAmount);
        }
    }

    // Test function to verify PRNG connectivity
    function testPRNG() external returns (bytes32) {
        return prngContract.getPseudorandomSeed();
    }

    // Emergency withdrawal
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    // Allow contract to receive ETH
    receive() external payable {}
}

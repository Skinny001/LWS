// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {LSW} from "../src/LSW.sol";
import {Rewarder} from "../src/Rewarder.sol";
import {MockHederaRewarder} from "../src/mocks/MockHederaRewarder.sol";

contract RewarderTest is Test {
    LSW public lsw;
    MockHederaRewarder public rewarder;
    
    address public owner = address(this);
    address public treasury = address(0x1234);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public user4 = address(0x4);
    address public user5 = address(0x5);
    
    // Test configuration
    uint256 public constant STAKE_BUFFER = 300;
    uint256 public constant STAKE_AMOUNT = 0.1 ether;
    uint256 public constant ROUND_DURATION = 3600;
    uint256 public constant BUFFER_DELAY = 600;
    uint256 public constant STAKING_WAIT_PERIOD = 600;

    event RewardsDistributed(uint256 indexed roundId, address[] winners, uint256 rewardPerWinner, uint256 treasuryAmount);
    event RandomSeedGenerated(uint256 indexed roundId, bytes32 seed);

    function setUp() public {
        // Deploy LSW contract
        LSW.ConstructorParams memory params = LSW.ConstructorParams({
            stakeBuffer: STAKE_BUFFER,
            stakeAmount: STAKE_AMOUNT,
            roundDuration: ROUND_DURATION,
            bufferDelay: BUFFER_DELAY,
            stakingWaitPeriod: STAKING_WAIT_PERIOD,
            treasury: treasury
        });
        lsw = new LSW(params);
        
        // Deploy mock Hedera rewarder contract
        rewarder = new MockHederaRewarder(address(lsw), address(0x64d1E2));
        
        // Set rewarder in LSW contract
        lsw.setRewarderContract(address(rewarder));
        
        // Give test accounts some ETH
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
        vm.deal(user4, 10 ether);
        vm.deal(user5, 10 ether);
        
        // Give the test contract some ETH for calling rewarder functions
        vm.deal(address(this), 10 ether);
    }

    function testRewarderInitialState() public view {
        assertEq(rewarder.owner(), owner);
        assertEq(rewarder.lswContract(), address(lsw));
    }

    function testPRNGConnectivity() public {
        bytes32 seed = rewarder.testPRNG();
        assertTrue(seed != bytes32(0));
        
        // Test that consecutive calls return different seeds
        bytes32 seed2 = rewarder.testPRNG();
        assertTrue(seed != seed2);
    }

    function testRewardDistributionWithNoParticipants() public {
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Give LSW contract some ETH to send to rewarder
        vm.deal(address(lsw), 1 ether);
        
        // Mock calling rewardRandomParticipants with no participants (empty round)
        vm.prank(address(lsw));
        rewarder.rewardRandomParticipants{value: 0.5 ether}(0, 0.7 ether, 0.3 ether, 0.2 ether);
        
        assertEq(treasury.balance, treasuryBalanceBefore + 0.5 ether);
    }

    function testRewardDistributionWithFewParticipants() public {
        // Create a scenario with 3 participants
        address[] memory participants = new address[](3);
        participants[0] = user1;
        participants[1] = user2;
        participants[2] = user3;

        // Skip wait period and add some ETH to contract
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        _createRoundWithParticipants(participants);
        
        uint256 participantAmount = 0.6 ether;
        uint256 treasuryAmount = 0.2 ether;
        uint256 totalAmount = participantAmount + treasuryAmount;
        
        uint256[] memory participantBalancesBefore = new uint256[](3);
        for (uint i = 0; i < 3; i++) {
            participantBalancesBefore[i] = participants[i].balance;
        }
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Give LSW contract ETH to call rewarder
        vm.deal(address(lsw), totalAmount);
        
        // Test distribution
        vm.prank(address(lsw));
        rewarder.rewardRandomParticipants{value: totalAmount}(0, 0.7 ether, participantAmount, treasuryAmount);
        
        // Check that each participant received their share
        uint256 expectedRewardPerParticipant = participantAmount / 3;
        for (uint i = 0; i < 3; i++) {
            assertEq(participants[i].balance, participantBalancesBefore[i] + expectedRewardPerParticipant);
        }
        
        // Check treasury received its share
        assertEq(treasury.balance, treasuryBalanceBefore + treasuryAmount);
    }

    function testRewardDistributionWithManyParticipants() public {
        // Create a scenario with 15 participants
        address[] memory participants = new address[](15);
        for (uint i = 0; i < 15; i++) {
            participants[i] = address(uint160(0x1000 + i));
            vm.deal(participants[i], 10 ether);
        }

        // Skip wait period
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        // Record balances before staking
        uint256[] memory balancesBeforeStaking = new uint256[](15);
        for (uint i = 0; i < 15; i++) {
            balancesBeforeStaking[i] = participants[i].balance;
        }
        
        _createRoundWithParticipants(participants);
        
        // Record balances after staking
        uint256[] memory balancesAfterStaking = new uint256[](15);
        for (uint i = 0; i < 15; i++) {
            balancesAfterStaking[i] = participants[i].balance;
        }
        
        uint256 participantAmount = 1.0 ether;
        uint256 treasuryAmount = 0.2 ether;
        uint256 totalAmount = participantAmount + treasuryAmount;
        
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Give LSW contract ETH to call rewarder
        vm.deal(address(lsw), totalAmount);
        
        // Test distribution - should select 10 random participants
        vm.prank(address(lsw));
        rewarder.rewardRandomParticipants{value: totalAmount}(0, 0.7 ether, participantAmount, treasuryAmount);
        
        // Check treasury received its share
        assertEq(treasury.balance, treasuryBalanceBefore + treasuryAmount);
        
        // Verify that total participant rewards were distributed (1.0 ETH total)
        // Note: due to random selection with duplicates, some participants may receive multiple rewards
        uint256 totalParticipantRewards = 0;
        for (uint i = 0; i < 15; i++) {
            // Compare to balance after staking (which was reduced by STAKE_AMOUNT)
            if (participants[i].balance > balancesAfterStaking[i]) {
                uint256 participantReward = participants[i].balance - balancesAfterStaking[i];
                totalParticipantRewards += participantReward;
            }
        }
        // The total should equal the participant amount (1.0 ETH)
        assertEq(totalParticipantRewards, participantAmount);
    }

    function testManualDistribution() public {
        // Create participants
        address[] memory participants = new address[](3);
        participants[0] = user1;
        participants[1] = user2;
        participants[2] = user3;

        // Skip wait period
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        _createRoundWithParticipants(participants);
        
        uint256 participantAmount = 0.6 ether;
        uint256 treasuryAmount = 0.2 ether;
        
        uint256[] memory participantBalancesBefore = new uint256[](3);
        for (uint i = 0; i < 3; i++) {
            participantBalancesBefore[i] = participants[i].balance;
        }
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Fund the rewarder contract
        vm.deal(address(rewarder), participantAmount + treasuryAmount);
        
        // Test manual distribution
        rewarder.manualDistribution(0, participantAmount, treasuryAmount);
        
        // Check that each participant received their share
        uint256 expectedRewardPerParticipant = participantAmount / 3;
        for (uint i = 0; i < 3; i++) {
            assertEq(participants[i].balance, participantBalancesBefore[i] + expectedRewardPerParticipant);
        }
        
        // Check treasury received its share
        assertEq(treasury.balance, treasuryBalanceBefore + treasuryAmount);
    }

    function testRewarderOnlyFunctions() public {
        // Test that only LSW can call rewardRandomParticipants
        vm.prank(user1);
        vm.expectRevert(MockHederaRewarder.NotLSW.selector);
        rewarder.rewardRandomParticipants(0, 0, 0, 0);
        
        // Test that only owner can call owner functions
        vm.prank(user1);
        vm.expectRevert(MockHederaRewarder.NotOwner.selector);
        rewarder.updateLSWContract(address(0x123));
        
        vm.prank(user1);
        vm.expectRevert(MockHederaRewarder.NotOwner.selector);
        rewarder.manualDistribution(0, 0, 0);
        
        vm.prank(user1);
        vm.expectRevert(MockHederaRewarder.NotOwner.selector);
        rewarder.emergencyWithdraw();
    }

    function testUpdateFunctions() public {
        address newLSW = address(0x456);
        
        rewarder.updateLSWContract(newLSW);
        assertEq(rewarder.lswContract(), newLSW);
        
        // Test updating Hedera PRNG address
        address newPRNGAddress = address(0x789);
        address oldPRNGAddress = rewarder.hederaPrngAddress();
        
        vm.expectEmit(true, true, false, false);
        emit HederaPrngAddressUpdated(oldPRNGAddress, newPRNGAddress);
        
        rewarder.updateHederaPrngAddress(newPRNGAddress);
        assertEq(rewarder.hederaPrngAddress(), newPRNGAddress);
    }

    event HederaPrngAddressUpdated(address indexed oldAddress, address indexed newAddress);

    function testZeroAddressValidation() public {
        vm.expectRevert(MockHederaRewarder.ZeroAddress.selector);
        rewarder.updateLSWContract(address(0));
        
        vm.expectRevert(MockHederaRewarder.ZeroAddress.selector);
        rewarder.updateHederaPrngAddress(address(0));
        
        vm.expectRevert(MockHederaRewarder.ZeroAddress.selector);
        new MockHederaRewarder(address(0), address(0x64d1E2));
    }

    function testEmergencyWithdraw() public {
        uint256 amount = 1 ether;
        vm.deal(address(rewarder), amount);
        
        uint256 ownerBalanceBefore = owner.balance;
        rewarder.emergencyWithdraw();
        
        assertEq(owner.balance, ownerBalanceBefore + amount);
        assertEq(address(rewarder).balance, 0);
    }

    // Helper function to create a round with participants
    function _createRoundWithParticipants(address[] memory participants) internal {
        for (uint i = 0; i < participants.length; i++) {
            vm.prank(participants[i]);
            lsw.stake{value: STAKE_AMOUNT}();
        }
    }
    
    // Receive function to accept ETH transfers
    receive() external payable {}
}

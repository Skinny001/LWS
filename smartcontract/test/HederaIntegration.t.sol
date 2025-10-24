// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {LSW} from "../src/LSW.sol";
import {Rewarder} from "../src/Rewarder.sol";
import {MockHederaRewarder} from "../src/mocks/MockHederaRewarder.sol";

//HEDERA_PRNG_ADDRESS deployed address 0x000000000000000000000000000000000064d1E2

contract HederaIntegrationTest is Test {
    LSW public lsw;
    MockHederaRewarder public rewarder;
    
    address public owner = address(this);
    address public treasury = address(0x1234);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public user4 = address(0x4);
    
    // Test configuration
    uint256 public constant STAKE_BUFFER = 300;
    uint256 public constant STAKE_AMOUNT = 0.1 ether;
    uint256 public constant ROUND_DURATION = 3600;
    uint256 public constant BUFFER_DELAY = 600;
    uint256 public constant STAKING_WAIT_PERIOD = 600;

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
        
        // Deploy Hedera rewarder contract
        rewarder = new MockHederaRewarder(address(lsw), address(0x64d1E2));
        
        // Set rewarder in LSW contract
        lsw.setRewarderContract(address(rewarder));
        
        // Give test accounts some ETH
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
        vm.deal(user4, 10 ether);
    }

    function testFullRoundWithFewParticipants() public {
        // Skip wait period first
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        address[] memory participants = new address[](5);
        
        // Setup participants
        for (uint i = 0; i < 5; i++) {
            participants[i] = address(uint160(0x100 + i));
            vm.deal(participants[i], 10 ether);
        }
        
        // All participants stake
        for (uint i = 0; i < 5; i++) {
            vm.prank(participants[i]);
            lsw.stake{value: STAKE_AMOUNT}();
        }
        
        // Get round info
        (, address lastStaker, uint256 totalAmount, uint256 deadline, bool isActive, uint256 stakersCount,) = lsw.getCurrentRoundInfo();
        assertEq(stakersCount, 5);
        assertEq(totalAmount, STAKE_AMOUNT * 5);
        assertEq(lastStaker, participants[4]); // Last participant is the winner
        assertTrue(isActive);
        
        // Move past deadline to end round
        vm.warp(deadline + 1);
        
        // Anyone can trigger round end by attempting to stake (which will now revert)
        address triggerUser = address(0x9999);
        vm.deal(triggerUser, 1 ether);
        vm.prank(triggerUser);
        vm.expectRevert(LSW.RoundExpired.selector);
        lsw.stake{value: STAKE_AMOUNT}();
        
        uint256 winnerBalanceBefore = lastStaker.balance;
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Winner starts new round - this should distribute rewards automatically
        vm.prank(lastStaker);
        lsw.startNewRound();
        
        // Check that new round started
        assertEq(lsw.roundId(), 1);
        
        // Check reward distribution (70% to winner, 20% distributed among participants, 10% treasury)
        uint256 expectedWinnerReward = (totalAmount * 70) / 100;
        uint256 participantRewardPerPerson = (totalAmount * 20) / 100 / 5; // 20% split among 5 participants
        uint256 expectedWinnerTotal = expectedWinnerReward + participantRewardPerPerson; // Winner also gets participant reward
        assertEq(lastStaker.balance, winnerBalanceBefore + expectedWinnerTotal);
        
        // Check treasury reward
        uint256 expectedTreasuryReward = (totalAmount * 10) / 100;
        assertEq(treasury.balance, treasuryBalanceBefore + expectedTreasuryReward);
    }

    function testFullRoundWithManyParticipants() public {
        // Skip wait period first
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        address[] memory participants = new address[](15);
        
        // Setup participants
        for (uint i = 0; i < 15; i++) {
            participants[i] = address(uint160(0x100 + i));
            vm.deal(participants[i], 10 ether);
        }
        
        // All participants stake
        for (uint i = 0; i < 15; i++) {
            vm.prank(participants[i]);
            lsw.stake{value: STAKE_AMOUNT}();
        }
        
        // Get round info
        (, address lastStaker, uint256 totalAmount, uint256 deadline, bool isActive, uint256 stakersCount,) = lsw.getCurrentRoundInfo();
        assertEq(stakersCount, 15);
        assertEq(totalAmount, STAKE_AMOUNT * 15);
        assertEq(lastStaker, participants[14]);
        assertTrue(isActive);
        
        // Move past deadline to end round
        vm.warp(deadline + 1);
        
        uint256 winnerBalanceBefore = lastStaker.balance;
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Winner starts new round - this should distribute rewards automatically using Hedera PRNG
        vm.prank(lastStaker);
        lsw.startNewRound();
        
        // Check that new round started
        assertEq(lsw.roundId(), 1);
        
        // Check reward distribution
        uint256 expectedWinnerReward = (totalAmount * 70) / 100;
        uint256 expectedTreasuryReward = (totalAmount * 10) / 100;
        
        // Winner should have received their 70% reward
        assertGe(lastStaker.balance, winnerBalanceBefore + expectedWinnerReward);
        
        // Treasury should have received 10%
        assertEq(treasury.balance, treasuryBalanceBefore + expectedTreasuryReward);
        
        // Check that participant rewards were distributed
        // The winner might also receive participant rewards, so we just check total distributed
        uint256 totalDistributed = 0;
        for (uint i = 0; i < 15; i++) {
            // Account for the 0.1 ETH staking cost each participant paid
            uint256 expectedBaseBalance = 10 ether - STAKE_AMOUNT;
            if (participants[i].balance > expectedBaseBalance) {
                totalDistributed += participants[i].balance - expectedBaseBalance;
            }
        }
        // Total distributed should be 90% (70% winner + 20% participants)
        uint256 expectedTotalDistributed = (totalAmount * 90) / 100;
        assertEq(totalDistributed, expectedTotalDistributed);
    }

    function testMultipleRounds() public {
        // Skip wait period
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        // First round
        vm.prank(user1);
        lsw.stake{value: STAKE_AMOUNT}();
        
        vm.prank(user2);
        lsw.stake{value: STAKE_AMOUNT}();
        
        // Get deadline and end round
        (, , , uint256 deadline, ,, ) = lsw.getCurrentRoundInfo();
        vm.warp(deadline + 1);
        
        // Start new round
        vm.prank(user2);
        lsw.startNewRound();
        
        // Skip new wait period
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        
        // Second round
        vm.prank(user3);
        lsw.stake{value: STAKE_AMOUNT}();
        
        vm.prank(user4);
        lsw.stake{value: STAKE_AMOUNT}();
        
        // Verify we're in round 1
        assertEq(lsw.roundId(), 1);
        
        // Get new deadline and end second round
        (, , , uint256 newDeadline, ,, ) = lsw.getCurrentRoundInfo();
        vm.warp(newDeadline + 1);
        
        // Start third round
        vm.prank(user4);
        lsw.startNewRound();
        
        // Verify we're in round 2
        assertEq(lsw.roundId(), 2);
    }

    function testOnlyRewarderCanCloseRound() public {
        vm.expectRevert(LSW.PermissionDenied.selector);
        lsw.closeRound(0);
    }

    function testRoundAlreadyClaimed() public {
        // Skip wait period and create a round
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        vm.prank(user1);
        lsw.stake{value: STAKE_AMOUNT}();
        
        // End round
        (, , , uint256 deadline, ,, ) = lsw.getCurrentRoundInfo();
        vm.warp(deadline + 1);
        
        // Start new round (claims the previous one)
        vm.prank(user1);
        lsw.startNewRound();
        
        // Try to start new round again - should work since we're now in a new round
        // and need to end the current round first
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        vm.prank(user1);
        lsw.stake{value: STAKE_AMOUNT}();
        
        (, , , uint256 newDeadline, ,, ) = lsw.getCurrentRoundInfo();
        vm.warp(newDeadline + 1);
        
        // This should work fine
        vm.prank(user1);
        lsw.startNewRound();
    }

    function testStartNewRoundPermissions() public {
        // Skip wait period and create a round
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        vm.prank(user1);
        lsw.stake{value: STAKE_AMOUNT}();
        
        // End round
        (, , , uint256 deadline, ,, ) = lsw.getCurrentRoundInfo();
        vm.warp(deadline + 1);
        
        // Anyone should be able to start new round after the current one ends
        vm.prank(user2);
        lsw.startNewRound();
        
        assertEq(lsw.roundId(), 1);
    }

    function testStartNewRoundWithoutRewarder() public {
        // Create a new LSW without rewarder set
        LSW.ConstructorParams memory params = LSW.ConstructorParams({
            stakeBuffer: STAKE_BUFFER,
            stakeAmount: STAKE_AMOUNT,
            roundDuration: ROUND_DURATION,
            bufferDelay: BUFFER_DELAY,
            stakingWaitPeriod: STAKING_WAIT_PERIOD,
            treasury: treasury
        });
        LSW newLsw = new LSW(params);
        
        // Skip wait period and stake
        vm.warp(block.timestamp + STAKING_WAIT_PERIOD + 1);
        vm.deal(user1, 10 ether);
        vm.prank(user1);
        newLsw.stake{value: STAKE_AMOUNT}();
        
        // End round
        (, , , uint256 deadline, ,, ) = newLsw.getCurrentRoundInfo();
        vm.warp(deadline + 1);
        
        // Should revert when trying to start new round without rewarder
        vm.prank(user1);
        vm.expectRevert(LSW.RewarderNotSet.selector);
        newLsw.startNewRound();
    }
    
    // Receive function to accept ETH transfers
    receive() external payable {}
}

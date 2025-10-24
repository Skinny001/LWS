// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {LSW} from "../src/LSW.sol";
import {Rewarder} from "../src/Rewarder.sol";

contract LSWScript is Script {
    // Deployment configuration
    uint256 public constant STAKE_BUFFER = 300; // 5 minutes in seconds
    uint256 public constant STAKE_AMOUNT = 0.01 ether; // Minimum stake amount
    uint256 public constant ROUND_DURATION = 3600; // 1 hour in seconds
    uint256 public constant BUFFER_DELAY = 600; // 10 minutes in seconds
    uint256 public constant STAKING_WAIT_PERIOD = 600; // 10 minutes in seconds 
    
    // Treasury address 
    address public constant TREASURY = 0x12896191de42EF8388f2892Ab76b9a728189260A; 
    
    // Hedera PRNG address
    address public constant HEDERA_PRNG_ADDRESS = 0x000000000000000000000000000000000064d1E2; 

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy LSW contract
        LSW.ConstructorParams memory params = LSW.ConstructorParams({
            stakeBuffer: STAKE_BUFFER,
            stakeAmount: STAKE_AMOUNT,
            roundDuration: ROUND_DURATION,
            bufferDelay: BUFFER_DELAY,
            stakingWaitPeriod: STAKING_WAIT_PERIOD,
            treasury: TREASURY
        });
        
        // LSW lsw = new LSW(params);
        // console.log("LSW deployed at:", address(lsw));

        // // Deploy Hedera Rewarder contract
        // Rewarder rewarder = new Rewarder(address(lsw), HEDERA_PRNG_ADDRESS);
        // console.log("Hedera Rewarder deployed at:", address(rewarder));

        // Set rewarder in LSW contract
LSW lsw = LSW(payable(0xDBdB83000b490b239ddA8E9efcAB2f3b9c3c2BdC));
        lsw.setRewarderContract(address(0x070F11A76F6a271E4e5B8c01fc573ad592823193));
        console.log("Hedera Rewarder contract set in LSW");

        vm.stopBroadcast();

        // Log deployment information
        // console.log("\n=== HEDERA DEPLOYMENT SUMMARY ===");
        // console.log("LSW Contract:", address(lsw));
        // console.log("Hedera Rewarder Contract:", address(rewarder));
        // console.log("Treasury:", TREASURY);
        // console.log("Stake Amount:", STAKE_AMOUNT);
        // console.log("Round Duration:", ROUND_DURATION, "seconds");
        // console.log("Stake Buffer:", STAKE_BUFFER, "seconds");
        // console.log("Buffer Delay:", BUFFER_DELAY, "seconds");
        // console.log("Staking Wait Period:", STAKING_WAIT_PERIOD, "seconds");
        // console.log("Hedera PRNG Address:", 0x000000000000000000000000000000000064d1E2);
        // console.log("\n=== NEXT STEPS ===");
        // console.log("1. Test the PRNG connectivity using testPRNG() function");
        // console.log("2. Update the TREASURY address if needed");
        // console.log("3. Verify contracts on Hedera block explorer");
        // console.log("4. Test with small stake amounts first");
    }

    // Alternative deployment function for testnets with mock PRNG
    // function deployWithMockPRNG() public {
    //     uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    //     address deployer = vm.addr(deployerPrivateKey);
        
    //     console.log("Deploying contracts with Mock PRNG for testing...");
    //     console.log("Deployer:", deployer);

    //     vm.startBroadcast(deployerPrivateKey);

    //     // Deploy LSW contract
    //     LSW.ConstructorParams memory params = LSW.ConstructorParams({
    //         stakeBuffer: STAKE_BUFFER,
    //         stakeAmount: STAKE_AMOUNT,
    //         roundDuration: ROUND_DURATION,
    //         bufferDelay: BUFFER_DELAY,
    //         stakingWaitPeriod: STAKING_WAIT_PERIOD,
    //         treasury: TREASURY
    //     });
        
    //     LSW lsw = new LSW(params);
    //     console.log("LSW deployed at:", address(lsw));

    //     // Deploy Mock Hedera Rewarder
    //     MockHederaRewarder rewarder = new MockHederaRewarder(address(lsw), HEDERA_PRNG_ADDRESS);
    //     console.log("Mock Hedera Rewarder deployed at:", address(rewarder));

    //     // Set rewarder in LSW contract
    //     lsw.setRewarderContract(address(rewarder));
    //     console.log("Mock Hedera Rewarder contract set in LSW");

    //     vm.stopBroadcast();

    //     console.log("\n=== MOCK HEDERA DEPLOYMENT SUMMARY ===");
    //     console.log("LSW Contract:", address(lsw));
    //     console.log("Mock Hedera Rewarder Contract:", address(rewarder));
    //     console.log("Note: Using Mock PRNG for testing - not suitable for production");
    // }
}

// Import mock contracts for alternative deployment
import {MockHederaRewarder} from "../src/mocks/MockHederaRewarder.sol";

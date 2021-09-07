// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract StakingPool is Ownable {

    IERC20 public gcoin;
    IERC20 public cfc;
    uint256 public rewardDuration = 86400; // 24h
    uint256 public rewardRate = 20;
    uint256 public stakeLimit = 100000e18;

    struct StakeInfo {
        uint256 amount;
        uint256 stakeAt;
        uint256 claimAt;
    }

    mapping(address => StakeInfo) stakeInfo;

    constructor(IERC20 _gcoin) {
        gcoin = _gcoin;
    }

    function stake(uint256 amount) public {
        StakeInfo memory info = stakeInfo[msg.sender];
        require(info.stakeAt == 0 || info.stakeAt + rewardDuration <= block.timestamp, "Staking is only possible once every 24h.");
        require(amount >= stakeLimit, "Staking can be done with an amount of stakeLimit or higher.");

        uint256 gcoinBalance = gcoin.balanceOf(msg.sender);
        require(gcoinBalance >= amount, "Your gcoin balance is insufficient");

        gcoin.transferFrom(msg.sender, address(this), amount);
        if (info.amount == 0) {
            info.amount = amount;
        } else {
            info.amount += amount;
        }
        info.stakeAt = block.timestamp;

        stakeInfo[msg.sender] = info;
    }

    function claim() public {
        StakeInfo memory info = stakeInfo[msg.sender];
        require(info.amount > 0, "You must have a balance of zero or more to claim");
        require(info.claimAt == 0 || info.claimAt + rewardDuration <= block.timestamp, "Claim is only possible once every 24h.");

        uint256 rewardAmount = info.amount * rewardRate / 10;
        cfc.transfer(msg.sender, rewardAmount);

        info.claimAt = block.timestamp;
        stakeInfo[msg.sender] = info;
    }

    function withdraw() public {
        StakeInfo memory info = stakeInfo[msg.sender];
        require(info.amount > 0, "You must have a balance of zero or more to withdraw");

        gcoin.transfer(msg.sender, info.amount);

        info.amount = 0;
        stakeInfo[msg.sender] = info;
    }

    // owner function

    function setStakeLimit(uint256 _stakeLimit) public onlyOwner {
        stakeLimit = _stakeLimit;
    }

    function setRewardDuration(uint256 _rewardDuration) public onlyOwner {
        rewardDuration = _rewardDuration;
    }

    function setCFCAddress(IERC20 _cfc) public onlyOwner {
        cfc = _cfc;
    }

    function setRewardRate(uint256 _rewardRate) public onlyOwner {
        rewardRate = _rewardRate;
    }

    // view function
    function getStakeInfo(address alice) public view returns(StakeInfo memory) {
        return stakeInfo[alice];
    }

    function getPooledCFCBalance() public view returns(uint256) {
        return cfc.balanceOf(address(this));
    }
}

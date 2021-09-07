// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract CompletelyFakeCoin is ERC20, ERC20Burnable, Ownable, ERC20Permit {

    address public stakingPool;
    mapping(uint256 => bool) mintInfo;

    constructor(address _stakingPool) ERC20("CompletelyFakeCoin", "CFC") ERC20Permit("CFC") {
        stakingPool = _stakingPool;
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(stakingPool, amount);
    }
}

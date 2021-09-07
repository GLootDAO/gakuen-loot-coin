// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract GakuenLootCoin is ERC20, ERC20Burnable, Ownable, ERC20Permit {

    IERC721 public loot;
    mapping(uint256 => bool) mintInfo;

    constructor(IERC721 _erc721) ERC20("Gakuen Loot Coin", "GCoin") ERC20Permit("Gakuen Loot Coin") {
        loot = _erc721;
    }

    function mint(address to, uint256 tokenId) public {
        require(tokenId >= 0, "tokenId > 0");
        require(tokenId <= 300, "tokenId <= 300");
        address owner = loot.ownerOf(tokenId);

        require(owner == msg.sender, "Only gakuen loot owner can mint");
        require(!mintInfo[tokenId], "this tokenId already minted");

        _mint(to, 100000e18);
        mintInfo[tokenId] = true;
    }
}

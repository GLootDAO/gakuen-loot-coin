// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract GakuenLoot is ERC721 {

    constructor() ERC721("Gakuen Loot", "GLoot") {}

    function mint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}

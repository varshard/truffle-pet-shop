pragma solidity ^0.4.11;

contract Adoption {
  address[16] public adopters;
  function adopt(uint petID) public returns (uint) {
    if (petID < 0 || petID > 15) {
      throw;
    }

    adopters[petID] = msg.sender;
    return petID;
  }

  function getAdopters() public returns (address[16]) {
    return adopters;
  }
}

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
  Adoption adoption = Adoption(DeployedAddresses.Adoption());
  uint expectedPetID = 8;

  function testUserCanAdopt() {  
    uint returnedID = adoption.adopt(expectedPetID);
    Assert.equal(returnedID, expectedPetID, "Adopted ID should equal to expected ID");
  }

  function testGetAdopterAdressByPetID() {
    address expected = this;
    address adopter = adoption.adopters(expectedPetID);
    Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded");
  }

  function testGetAdopterAddesss() {
    address expected = this;
    // Memory means temporarily store the value in memory, rather than saving it to the contract's storage
    address[16] memory adopters = adoption.getAdopters();    
    Assert.equal(adopters[expectedPetID], expected, "Owner of pet ID 8 should be recorded");
  }
}

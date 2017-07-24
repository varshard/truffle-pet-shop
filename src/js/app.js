App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {   
     // Initialize web3 and set the provider to testRPC
     // Check if there's a web3 instance already active (Mist or MetaMask)
    if (typeof web3 != null) {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);    
    } else {
      // Create our own web3 instance based on TestRPC provider
      // set the provider from Web3.providers
      App.web3Provider = new web2.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      /*
        We first retrieve the artifact file for our smart contract. Artifacts are information about our contract such as its deployed address and ABI. 
        The ABI (Application Binary Interface) is a JavaScript object defining how to interact with the contract including its variables, functions and their parameters.
      */

      // Get the necessary contract artifact file and instantiate it with "truffle-contract" command.
      var AdoptionArtifact = data;
      // Create an instance of the contract we can intereact with
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets in case that any pet is already adopted from a previous visit
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  handleAdopt: function() {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(err, accounts) {
      if (err) {
        console.error('handleAdopt', err);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.adopt(petId, { from: account });
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.error('handleAdopt', err.message);
      })
    })
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    // Accessing a deployed contract
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      // Use "call()" so, data from blockchain can be read without having to send a full transaction (no gas cost)
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (var i = 0; i < adopters.length; i++) {
        // If a pet is adopted
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('$.panel-pet').eq(i).find('button').text('Pending...').attr('disabled', 'disabled');
        }
      }
    }).catch(function(err) {
      console.error('markAdopted', err.message);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

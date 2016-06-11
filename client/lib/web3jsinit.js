// Initialisation de web3js

if(typeof web3 !== 'undefined')
	// Connexion via Mist
 	web3 = new Web3(web3.currentProvider);
else
	// Connexion RPC
 	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  



# DocSign
This Dapp has been created for proof of concept purpose. Don't use it on production without review the code.




# Usage

Run **geth** with at least the following arguments :

		geth --unlock "Ethereum Public Address" --rpccordsdomain "http://localhost:3000"

You can use --rpcorsdomain "*" but you need to understand that any website can access to your wallet.

# Meteor

In the /DocSign, run 

		meteor

Or build the client with the following command 

		meteor-build-client ../build -p ""

and open **index.html** with your browser.  

# Mist Browser

Run meteor as usual.
Run Ethereum wall with mist argument

For Mac users

		open -a Ethereum-Wallet.app --args --mode mist
		
For Windows users 

		Ethereum-Wallet.exe --mode mist
		
And open http://localhost:3000

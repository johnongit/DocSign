

UI.registerHelper('CreateContract', function(_ContractName){
    //Fonction globale permettant de déployer un nouveau Smart Contract

    // Définition de l'ABI
  var docsignContract = web3.eth.contract(Session.get('ABI'));
  // Appelle du constructeur du smart contract
  //// Prend en argument l'adresse du créateur du contract, le ByteCode et le nombre de GAS à utiliser
  var docsign = docsignContract.new(
        {
        from: web3.eth.defaultAccount,
        data: Session.get('ByteCode'),
        gas : Session.get('ContractEstimaGas')
        }, function(e, contract){
            //Fonction CallBack retournant l'adresse du SmartContract miné ou une erreur
            console.log('test');
            /*
            var timeout = Meteor.setTimeout(function(){
            console.log("Contract has not been mined");
            Session.set('DisplayKOContract', "Contract has not been mined");
            Session.set('DisplayOKContract', 0);
            Session.set('progressContract', 0);
            delete docsign;
            console.log(docsign);
        },120000);
            */
            if(e){
                // Gestion du cas d'erreur. la transaction échoue
            console.log('error',e);
            Session.set('DisplayKOContract', e.message);
            Session.set('DisplayOKContract', 0);
            Session.set('progressContract', 0);
            Session.set('WaitingTransactionContract', 0);
            }
            else if (typeof contract.address != 'undefined') {
                // Le contract a été miné
                // On récupère le bloc ayant servi à enregistré le SmartContract et l'adresse de ce dernier
                var createdAtBlock = web3.eth.getBlock('latest').number;
                var address = contract.address;

                console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);

                // On créé un filtre permettant de vérifier les prochains blocs créés

                var filter = web3.eth.filter('latest');
            
				Session.set('DisplayKOContract', 0);

                filter.watch(function(e, blockHash){
                // On vérifier dans les 5 prochains blocs que le contract est toujours présent (gestion des blocs orphelin)
                             if(!e) {
                                 

                                 var block = web3.eth.getBlock(blockHash);
                                 console.log('Block :', block.number);
                                 Session.set('progressContract', ((block.number - createdAtBlock)/5)*100);
                                 Session.set('WaitingTransactionContract', 0);
                                 
                                 
                             if((block.number - createdAtBlock) < 5 &&
                                web3.eth.getCode(address).length <= 2) {
                                // La fonction getCode retour 0x quand le contrat n'existe plus dans la Blockchain
                                Session.set('DisplayKOContract', "Oups, le SmartContract a disparu de la BlockChain ... (Block Orphelin). Veuillez essayer à nouveau ");
                             } 
                             else if (block.number - createdAtBlock >= 5) {
                                // La contract existe dans toujours. On valide le déploiement à l'utilisateur et on arrete la fonction watch
                                 Session.set('DisplayOKContract', 1);
                                 Session.set('progressContract', 0);
                                 filter.stopWatching();
                                 ///////////////////////////
                                 if(DocSignCollection.find({Selected : 0}).fetch() == "" | DocSignCollection.find({Selected : 0}).fetch() == undefined){
                                     console.log("DB empty or no selected contract");
                                     DocSignCollection.insert({ Name: _ContractName, Addr: contract.address, Selected: 1 });
                                 }
                                 else
                                 {
                                     DocSignCollection.insert({ Name: _ContractName, Addr: contract.address, Selected: 0 });
                                 }
                                 
                                 //////////////////////////
                             }
                         }
                });
            }
        })



});


UI.registerHelper('SetContractDefinition', function(){
    // Permet de définir le contract actif pour les fonction d'ajout de recherche
	contracts = {};
	ctrAddresses = {};
	contracts["Docsign"] = {
                  interface: Session.get('ABI'),
	address: Session.get('SelectedSmartContractAddr')
	};
	contracts["Docsign"].contractClass = web3.eth.contract(contracts["Docsign"].interface);
	contracts["Docsign"].contract = contracts["Docsign"].contractClass.at(contracts["Docsign"].address);
	
	web3.eth.defaultAccount = web3.eth.accounts[0];
});




UI.registerHelper('timeConverter',function(timestamp){
    // Mise en forme de la date.
  var a = new Date(timestamp * 1000);
  var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  var time =  date + "/" + month + "/" + year + " " + hour + ':' + min + ':' + sec ;
  return time;
});





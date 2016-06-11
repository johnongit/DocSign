Template.Sign.created = function(){
    Session.set('version',"");
    Session.set('name', "");
    Session.set('hash',"");
};

Template.Sign.helpers({
        FileName: function(){
            return Session.get('FileName');
        },
        Hash: function(){
            return Session.get('Hash');
        },
        'ProgressBar': function(){
            return Session.get('progress');
        },
        DisplayOK: function(){
            return Session.get('DisplayOK');
        },
        DisplayKO: function(){
            console.log('error1',Session.get('DisplayKO'));
            return Session.get('DisplayKO');
        },
		DisplayPrice: function(){
			return Session.get('Price');
		},
        WaitingTransaction: function(){
            return Session.get('WaitingTransaction')
        },

})

Template.DisplaySignPrice.helpers({
    Price: function(){
        return Session.get('Price');
    },
    PriceEur: function(){
        return Session.get('PriceEur');
    },
});

Template.DisplayProgressBar.helpers({
        progress: function(){
            return Session.get('progress');
        },

});

Template.DisplayKOMessage.helpers({
    DisplayKO: function(){
        console.log('error1',Session.get('DisplayKO'));
        return Session.get('DisplayKO');
    },
});

Template.DisplayOKMessage.events({
    'click .close' (event) {
        console.log('test');
        Session.set('DisplayOK', 0);
        Session.set('progress', 0);
    },   
});
Template.DisplayKOMessage.events({
    'click .close' (event) {
        console.log('test');
        Session.get('DisplayKO',0);
        Session.set('progress', 0);
    },   
});



Template.Sign.events({

			'input .Add'(event) {
                // Event utilisé pour mettre à jour le coût de transaction
                var PriceEur; 
				console.log('value', event.target.form[0].value);
				
				const version = event.target.form[0].value;
				const name = event.target.form[1].value;
				
				const hash = event.target.form[2].value;

                Session.set('version',version);
                Session.set('name', name);
                
                Session.set('hash',hash);

                // On Estime le nombre de GAS utilisé par la transaction
				var estimateGas = contracts["Docsign"].contract.Add.estimateGas(version, name, hash);
				
                // On récupère le prix GAS
                var gasPrice = web3.eth.gasPrice.toNumber();

                // On calcule le coût de la transaction en finney
				var Price = estimateGas * gasPrice;
				console.log('Price1', web3.fromWei(Price,"finney"));
                Session.set('Price',web3.fromWei(Price,"finney"));
                // On calcule le coût en euro
                PriceEur = (web3.fromWei(Price,"ether")*Session.get('EthToolsPriceEur')).toFixed(2);
				Session.set('PriceEur',PriceEur);
				

			},

            'submit .Add'(event,template) {
            // Event utilisé lors de la validation du formulaire
            // Permet d'enregistrer une nouvelle entrée

            // On récupère les input du formulaire
            event.preventDefault();
            const version = event.target.Version.value;
            const name = event.target.Name.value;
            const hash = event.target.Hash.value;
            console.log("Add event");
            console.log(hash);
            // On estime le nombre de GAS utilisé par le formulaire. Cette information est utilisé lors de la transaction pour éviter l'erreur out of GAS'
            var estimateGas = contracts["Docsign"].contract.Add.estimateGas(version, name, hash)
            console.log('Estimate GAS :', estimateGas)


            // Création de la tranaction                         
            var res = contracts["Docsign"].contract.Add(version, name, hash, {gas: estimateGas},function(error,result) {
                // Fonction call back.. Retourne une erreur ou le numéro de la transaction
                if(error)
                {
                    // Affiche l'erreur (Echec de la transaction)
                    console.log('error',error);
                    Session.set('DisplayKO', error.message);
                    Session.set('DisplayOK', 0);
                    Session.set('progress', 0);

                }
                else 
                {
                    Session.set('WaitingTransaction',1);
                    Session.set('DisplayKO', 0);
                }
            });
            /*
            var timeout = Meteor.setTimeout(function(){
                    Session.set('DisplayKO', "Transaction has not been mined");
                    Session.set('DisplayOK', 0);
                    Session.set('progress', 0);
                    event1.stopWatching();
                    },
                    300000);
            */

            // On attache l'event "Added" du SmartContract afin de suivre le déploiement dans la BlockChain
            event1 = contracts.Docsign.contract.Added(function(error, result){

            if (!error) {
                // Le Contrat a été miné
                console.log('Result1 :', result.address);
                // On récupère l'adresse de l'enregistrement et le numéro block ayant enregistré la transaction
                var address = result.address;
                var createdAtBlock = result.blockNumber;
                
                //stopWatching();
                console.log('createdAtBlock ',createdAtBlock);
                // On détache l'envent "Added"
                event1.stopWatching();
                
                
                // On vérifie que l'enregistrement est toujours présent dans la blockchain en regardant les 4 prochains blocks
                var filter = web3.eth.filter('latest');
                filter.watch(function(e, blockHash){
                    if(!e) {

                        var block = web3.eth.getBlock(blockHash);
                        console.log('Block :', block.number);
                        Session.set('progress', ((block.number - createdAtBlock)/4)*100);
                        Session.set('WaitingTransaction',0);

                        
                        if((block.number - createdAtBlock) < 4 &&
                            web3.eth.getCode(address).length <= 2) {
                            // En cas de problème, la condition retourn "0x"
                            Session.set('DisplayKO', "Oups, l'enregistrement a disparu de la BlockChain ... (Block Orphelin). Veuillez essayer à nouveau");
                            filter.stopWatching();
                        } else if (block.number - createdAtBlock >= 4) {
                            // l'enregistrement existe toujours
                            console.log("Contract OK");

                            Session.set('DisplayOK', 1);
                            Session.set('progress',0);
                            // On supprime le filtre
                            filter.stopWatching();

                            // On réinitialise le formulaire
                            Session.set('FileName',"");
                            Session.set('Hash',"");
                            event.target.reset();
                            
                            
                        }
                    }
                });
            }

            });

        },
       });



        Template.dropzone.events({
		
        'dropped #dropzone': function(e) {
            // Event calculant localement le hash (SHA256) du fichier  
            FS.Utility.eachFile(e, function(file) {

                var File = new FS.File(file);
                var FileName = File.name();
                var reader =new FileReader();
                
          console.log('files droped');
          console.log(FileName);
          console.log(reader);
          Session.set('FileName',FileName);
             reader.onloadend = function(event) {
                // exécuté lors de l'exécution de la fonction asynchrone readAsArrayBuffer 
            console.log("load");
            if (event.target.readyState == FileReader.DONE) {
                var wordArray = CryptoJS.lib.WordArray.create(event.target.result);
                // On calcule le hash
                var hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
                console.log(hash);
                Session.set('Hash',hash);

                const version = Session.get('version');
                const name = Session.get('name');
                

                console.log('test', version, name, hash);
                // On met à jour le nombre GAS
                var estimateGas = contracts["Docsign"].contract.Add.estimateGas(version, name, hash);
                var gasPrice = web3.eth.gasPrice.toNumber();
                var Price = estimateGas * gasPrice;
                console.log('Price1', web3.fromWei(Price,"finney"));
                // On stock l'information pour la présenter à l'utilisateur
                Session.set('Price',web3.fromWei(Price,"finney"));
    
                }
            
            };
        // On lit le fichier déposé dans la dropzone
        reader.readAsArrayBuffer(File.data.blob);
            });
        }
                             
        });
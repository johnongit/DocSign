

Template.Settings.helpers({
	SmartContracts: function(){
		// Retourne les contrats enregistrés dans la DB local. permet au template "Settings" d'obtenir tous les id et de les envoyer au template SmartContract
		var SmartContracts = DocSignCollection.find({Name: {$exists: true}}, {sort: {Name: 1}}).fetch();
		return SmartContracts;
	},
	DisplayKOContract: function(){
		return Session.get('DisplayKOContract');
	},

    DisplayOKContract: function(){
    return Session.get('DisplayOKContract');
    },
	ProgressBarContract: function(){
		return Session.get('progressContract');
	},
	AddSmartContractAction: function() {
		return Session.get('DisplaySmartContradAddForm');
	},
	WaitingTransactionContract: function() {
		return Session.get('WaitingTransactionContract');
	},

});



Template.DisplayProgressBarContract.helpers({
    progress: function(){
    	// Fonction traitant la barre de changement
		return Session.get('progressContract');
    },

});

Template.DisplayKOMessageContract.helpers({
	DisplayKOContract: function(){
		// Fonction affichant les messages d'erreurs lors du deploiement d'un smartcontract
		return Session.get('DisplayKOContract');
	},
});


Template.SmartContract.helpers({
	'contract': function(){
		// Fonction retournant les smart contract enregistrés dans la DB
		var id = this.contract;
		var smartContract = DocSignCollection.findOne({_id: id});
		// retourne un objet JSON correspondant à une collection
		return smartContract;
	},
});



Template.SmartContractSelected.helpers({
	SmartContractSelected: function(){
		// Fonction retournant le SmartContract sélectionné
		return DocSignCollection.findOne({Selected: 1});
	},
});

Template.Settings.helpers({
	ContractAddress: function(){
		return Session.get('ContractAddress');
	},
});

Template.CreateNewSmartContract.helpers({
	GetContractDeplymentPriceEth: function() {
		// Fonction retournant le coût de la transaction
		var Price = Session.get('ContractEstimaGas')*web3.eth.gasPrice.toNumber();
		return web3.fromWei(Price,"finney");
	},
	GetContractDeplymentPriceEur: function() {
		var Price = Session.get('ContractEstimaGas')*web3.eth.gasPrice.toNumber();
		var PriceEur = (web3.fromWei(Price,"ether")*Session.get('EthToolsPriceEur')).toFixed(2);
		return PriceEur;
	},
});

Template.DisplayKOMessageContract.events({
	'click .close' (event) {
		console.log("closebox");
		Session.set('DisplayKOContract', null);
	},
});

Template.DisplayOKMessageContract.events({
	'click .close' (event) {
		console.log("closebox");
		Session.set('DisplayOKContract', 0);
	},
});


Template.DisplaySmartContradAddForm.events({
	'submit .AddSmartContract' (event) {
		// Formulaire permettant d'ajouter un SmartContract pré déployé
		event.preventDefault();
		console.log("test :", event);
		var ContractName = event.target.SmartName.value;
		var Address = event.target.SmartAddr.value;
		console.log("test Add Contract");
		
		DocSignCollection.insert({ Name: ContractName, Addr: Address, Selected: 0 });
	},
	
});


Template.CreateNewSmartContract.events({
	'submit .CreateSmartContract' (event) {
		// Formulaire permettant de déployer un nouveau SmartContract
		event.preventDefault();
		console.log("test event");
		const ContractName =  event.target.SmartName.value;
		Session.set('WaitingTransactionContract', 1);
		UI._globalHelpers.CreateContract(ContractName);
		
	},
});


Template.SmartContract.events({
	'click .SelectContract': function(){
		// Event permttant de changé de SmartContract
		console.log('event :', this)
		console.log("New Selection : ",this._id);

		DocSignCollection.update({Selected : 1},{$set: {Selected:0}});
		DocSignCollection.update({_id : this._id},{$set: {Selected:1}});
		Session.set('SelectedSmartContractAddr', this.Addr);
		UI._globalHelpers.SetContractDefinition();
	},
	'click #removeContract': function(){
		// Event permetant de supprimé un SmartContrat de la base
		console.log("RemoveContract :", this._id);

		if(DocSignCollection.findOne({Selected : 1})._id == this._id) {
			DocSignCollection.update({_id : DocSignCollection.findOne()._id} , {$set: {Selected:1}});
		}
		

		DocSignCollection.remove({_id: this._id});

		
		console.log("First Contract1:", DocSignCollection.find({Addr : '0x50c5712624b58905c19aee87deca593a2690e3f4'}).fetch())
	},
});



Template.Settings.events({
	'click #AddSmartContract': function(){
		// Event utilisé pour afficher le fomulaire d'ajout de SmartContract prédéployé
		if(Session.get('DisplaySmartContradAddForm') == 1)
		{
			Session.set('DisplaySmartContradAddForm',0);
		}
		else
		{
			Session.set('DisplaySmartContradAddForm',1);
		}
	},

});

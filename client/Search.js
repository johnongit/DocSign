Template.Search.helpers({
	Result: function(){
		return Session.get('Result');
	},
	ByAddr: function(){
		return Session.get('ByAddr');
	},
	ByName: function(){
		return Session.get('ByName');
	},
	Files: function(){
		return Session.get('Result');
		
	},
	WaitingSearch: function(){
		return Session.get('WaitingSearch');
	},
	
	
	
	crawl: function(i) {
		// Fonction Permettant de mettre en forme les éléments de la structure de donné (struct Document) du SmartContract
		var resu = "";
		console.log("in crawl")
		var version_res = contracts["Docsign"].contract.a_document(i)[0].c[0];
		var nom_res = contracts["Docsign"].contract.a_document(i)[1];
		var createur_res = contracts["Docsign"].contract.a_document(i)[2];
		
		var hash_res = contracts["Docsign"].contract.a_document(i)[3];
		var date_res = UI._globalHelpers.timeConverter(contracts["Docsign"].contract.a_document(i)[4]);
		
		var result = {
			Version: contracts["Docsign"].contract.a_document(i)[0].c[0],
			Name: contracts["Docsign"].contract.a_document(i)[1],	
			Creator: contracts["Docsign"].contract.a_document(i)[2],
			
			Hash: contracts["Docsign"].contract.a_document(i)[3],
			Date: UI._globalHelpers.timeConverter(contracts["Docsign"].contract.a_document(i)[4])
		};
		
		// retourn un un objet aux fonctions "Search"
		return result;
	},


	
	Search2: function(_addr, _name, _length){
		// Fonction permettant de lister recurisement les éléments du tableaux (a_document) du smartcontract à partir 
		// de l'adresse du créateur de l'enregistrement
		var resu = "";
		var j =0;
		for (i = 0; i<_length; i++) {
		if(contracts["Docsign"].contract.a_document(i)[2]==_addr && contracts["Docsign"].contract.a_document(i)[1]==_name) {
			// On récupére l'objet de la structure  (struct Document) lorsque les critères sont matchés
			resu[j]= Template.Search.__helpers.get("crawl")(i);
			j++;
		}
	}
	Session.set('WaitingSearch',0);
	// On enregistre le résultat
	// Le résultat est utilisé dans la fonction "Result" du helpers Search
	Session.set('Result',resu);
	return 1;
	
	},
	
	Search1: function(_searchString, _id, _length){
		// Fonction permettant de lister recurisement les éléments du tableaux (a_document) du smartcontract à partir 
		// d'un des trois paramètres (adresse du créateur ou nom du fichier ou hash)

		var resu = [];
		var j =0;
		for (i = 0; i<_length; i++) {
			if(contracts["Docsign"].contract.a_document(i)[_id]==_searchString) {
				// On récupére l'objet de la structure  (struct Document) lorsque les critères sont matchés
				resu[j]= Template.Search.__helpers.get("crawl")(i);
				j++;
			}
		}
	Session.set('WaitingSearch',0);
	// On enregistre le résultat
	// Le résultat est utilisé dans la fonction "Result" du helpers Search
	Session.set('Result',resu);
	return 1;
	},
});


Template.Search.events({
	'input #ByName' (event){
		Session.set('ByName',event.target.value);
	},
	'input #ByAddr' (event){
		Session.set('ByAddr',event.target.value);
	},
	'submit  .Search' (event) {
		// Evenement utilisé lors de la validation du formulaire
	     event.preventDefault();
		const addr = event.target.ByAddr.value;
		const name = event.target.ByName.value;
		// Permet de récupérer la taille du tableau de structure du smart contract
		var length = contracts["Docsign"].contract.getCount();

		Session.set('ByAddr',addr);
       	Session.set('WaitingSearch',1);
		if(name == ""){
			
			Template.Search.__helpers.get("Search1")(addr,2,length);
			//console.log(resu);
			
		}
		else if (addr == ""){
			Template.Search.__helpers.get("Search1")(name,1,length);
		}
		else if (name!="" && addr!="") {
			Template.Search.__helpers.get("Search2")(addr,name,length);
			
		}
	},

});


Template.searchdropzone.events({
	'dropped #searchdropzone': function(e){
		// Event calculant localement le hash (SHA256) du fichier  
		FS.Utility.eachFile(e, function(file) {
			var File = new FS.File(file);
			var FileName = File.name();
			var reader =new FileReader();
			// Permet de récupérer la taille du tableau de structure du smart contract
			var length = contracts["Docsign"].contract.getCount();
			console.log('files droped');
			console.log(reader);
			Session.set('WaitingSearch',1);
			
			reader.onloadend = function(event) {
                // exécuté lors de l'exécution de la fonction asynchrone readAsArrayBuffer 
				console.log("load");
				if (event.target.readyState == FileReader.DONE) {
					var wordArray = CryptoJS.lib.WordArray.create(event.target.result);
					// On calcule le hash
					var hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
					console.log(hash);
					var length = contracts["Docsign"].contract.getCount();
					// On cherche le éléments
					Template.Search.__helpers.get("Search1")(hash,3,length);
					
				}
		
			};
			// On lit le fichier
			reader.readAsArrayBuffer(File.data.blob);
		});
	},
});
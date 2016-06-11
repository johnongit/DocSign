Template.body.events({
  // Gestion du carrousel 
    'click .btn-primary': function (event) {
      event.preventDefault();
      console.log(event.target.id);
      Session.set('board', event.target.id);

    }

});

Template.body.created = function(){
  // Initialisation de quelques variables
	Session.set('DisplaySmartContradAddForm',0);
	Session.set('board', "Sign");
  Session.set('DisplaySmartContradAddForm',0);
	

	Meteor.setInterval(function(){
    // Vérification de l'instance web3 toutes les 10 secondes
 		if(!web3.isConnected()) {
      // On affiche un message d'alerte empêchant d'utiliser l'application
 			console.log('NoNode');
 			Session.set('NoNode', 1);
 		}
        else {
        	console.log('Node Detected');
        	Session.set('NoNode', 0);	
        }
        }
        ,10000);
};

Template.body.helpers({
	'NoNode': function() {
    // Gestion de la boite d'alerte sur la connexion web3
		return Session.get('NoNode');
	},
});





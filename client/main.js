import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './Accueil.html';






Template.selectFrame.helpers({
	// 
    active: function() {
      return Session.get('board');
    }
});


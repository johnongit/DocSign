
// Ouverture de la DB locale au navigateur
DocSignCollection = new Meteor.Collection('DocSign', {connection: null});
new PersistentMinimongo(DocSignCollection, 'DocSignDB');
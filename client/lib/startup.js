Meteor.startup(function(){

  var localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
  var locale = 'en';
  if (localeFromBrowser.match(/fr/)) {
    locale = 'fr';
  }
  TAPi18n.setLanguage(locale);


});
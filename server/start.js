Meteor.methods({
contract:function () {
    var contract = {};
   contract = JSON.parse(Assets.getText('contract.json'));
 return contract;
 }
});
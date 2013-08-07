var navigationMod = angular.module('navigationMod',
    ['navigationModProvider', 'mod/navigation/0.1.0/views']);
navigationMod.config(function (navigationModProvider) {
    console.log('navigationMod.config');
    navigationModProvider.setTemplate('mod/navigation/0.1.0/views/navigation.html');
});


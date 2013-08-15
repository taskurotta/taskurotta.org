var navigationMod = angular.module('navigationMod',
    ['navigationModProvider', 'mod/navigation/views']);
navigationMod.config(function (navigationModProvider) {
    console.log('navigationMod.config');
    navigationModProvider.setTemplate('mod/navigation/views/navigation.html');
});


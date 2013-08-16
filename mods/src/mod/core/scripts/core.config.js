var coreMod = angular.module('coreMod', ['coreModProvider', 'ui.state'])
    .config(function (coreModProvider, $locationProvider) {
        console.log('coreMod.config');
    });

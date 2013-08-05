var appMod = angular.module('appMod', ['ui.state','navigationMod','footerMod']);
appMod.value('appModConfig',{});
appMod.config( function($locationProvider){
    console.log('appMod.config');
    //$locationProvider.html5Mode(true);
});
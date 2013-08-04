var appMod = angular.module('appMod', ['navigationMod','footerMod']);
appMod.value('appModConfig',{});
appMod.config( function($locationProvider){
    //$locationProvider.html5Mode(true);
});
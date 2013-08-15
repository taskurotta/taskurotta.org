markdownMod = angular.module('markdownMod', ['markdownModProvider']);
markdownMod.config(function(markdownModProvider){
    console.log('markdownMod.config');
    markdownModProvider.setBasePath('/');
    markdownModProvider.setSource('md/index.md');
});
markdownMod = angular.module('markdownMod', []);
markdownMod.value('markdownModConfig',{
    src: 'md/index.md'
});
markdownMod.run(function(){
    console.log('markdownMod.run');
});
markdownMod.service('markdownModService',function(){
    console.log('markdownMod.service');
});
markdownMod.config(function(){
    console.log('markdownMod.config');
});
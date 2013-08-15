var footerMod = angular.module('footerMod',
    ['footerModProvider', 'mod/footer/views']);
footerMod.config(function (footerModProvider) {
    console.log('footerMod.config');
    footerModProvider.setTemplate('mod/footer/views/footer.html');
    //footerModProvider.setCopyright('@Taskurotta Team 2013');
});


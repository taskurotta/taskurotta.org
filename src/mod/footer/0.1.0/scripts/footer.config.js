var footerMod = angular.module('footerMod',
    ['footerModProvider', 'mod/footer/0.1.0/views']);
footerMod.config(function (footerModProvider) {
    console.log('footerMod.config');
    footerModProvider.setTemplate('mod/footer/0.1.0/views/footer.html');
    //footerModProvider.setCopyright('@Taskurotta Team 2013');
});


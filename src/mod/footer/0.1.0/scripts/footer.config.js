footerMod = angular.module('footerMod', ['mod/footer/0.1.0/views']);
footerMod.value('footerModConfig', {
    template: 'mod/footer/0.1.0/views/footer.html',
    copyright: 'Taskurotta Team 2013',
    links: [
        {id: 'footnav_blog', href: 'https://github.com/taskurotta/taskurotta.org', name: 'Blog' },
        {id: 'footnav_issue', href: 'https://github.com/taskurotta/taskurotta.org/issues?state=open', name: 'Issues' }
    ]
});

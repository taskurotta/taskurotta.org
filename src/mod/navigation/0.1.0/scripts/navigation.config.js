var navigationMod = angular.module('navigationMod', ['mod/navigation/0.1.0/views']);
navigationMod.value('navigationModConfig', {
    template: 'mod/navigation/0.1.0/views/navigation.html',
    menu: {
        dropdown: true,
        items: [
            {id: 'rootnav_index', href: 'index.html', name: 'Taskurotta' },
            {id: 'rootnav_get_started', href: 'get_started.html', name: 'Введение' },
            {id: 'rootnav_road_map', href: 'road_map.html', name: 'План'},
            {id: 'rootnav_doc', href: '#', name: 'Документация (TODO)',
                items: [
                    {id: '1', href: '#', name: 'Основная концепция' },
                    {id: '2', href: '#', name: 'Сценарии использования'},
                    {id: '3', delim: true, href: '#', name: 'Пакеты' },
                    {id: '4', href: '#', name: 'Аннотации' },
                    {id: '5', href: '#', name: 'Исключения' },
                    {id: '6', href: '#', name: 'Мониторинг' },
                    {id: '7', delim: true, href: '#', name: 'Unit тесты' },
                    {id: '8', href: '#', name: 'Регрессионное тестирование' },
                    {id: '9', href: '#', name: 'A/B тестирование' }
                ]}
        ]
    }
});
/**
 * Created by Zakirov.RR on 05.08.13.
 */

//describe('Navigation menu tests ',function(){
//   var compile;
//   var rootScope;
//   beforeEach(module('navigationMod'));
//   beforeEach(inject(function($compile, $rootScope){
//       compile = $compile;
//       rootScope = $rootScope;
//   }));
//    beforeEach(inject(function ($provide) {
//            $provide.value('navigationModConfig', {
//                template: 'mod/navigation/0.1.0/views/navigation.html',
//                menu: {
//                    dropdown: true,
//                    items: [
//                        {id: 'rootnav_index', href: 'index.html', name: 'Taskurotta' },
//                        {id: 'rootnav_get_started', href: 'get_started.html', name: 'Введение' },
//                        {id: 'rootnav_road_map', href: 'road_map.html', name: 'План'},
//                        {id: 'rootnav_doc', href: '#', name: 'Документация (TODO)',
//                            items: [
//                                {id: '1', href: '#', name: 'Основная концепция' },
//                                {id: '2', href: '#', name: 'Сценарии использования'},
//                                {id: '3', delim: true, href: '#', name: 'Пакеты' },
//                                {id: '4', href: '#', name: 'Аннотации' },
//                                {id: '5', href: '#', name: 'Исключения' },
//                                {id: '6', href: '#', name: 'Мониторинг' },
//                                {id: '7', delim: true, href: '#', name: 'Unit тесты' },
//                                {id: '8', href: '#', name: 'Регрессионное тестирование' },
//                                {id: '9', href: '#', name: 'A/B тестирование' }
//                            ]}
//                    ]
//                }
//            });
//        }
//    ));

//   it('The menu has the required number of parent menu items',function(){
//       var element = compile('<div class="navbar-inner" navigation="index"></div>')(rootScope);
//       //expect(element.html()).toContain('index');
//       expect(repeater('.navbar-nav li').count()).toBe(4);
//   });
//
//    it('The menu has one active parent menu item',function(){
//        var element = compile('<div class="navbar-inner" navigation="index"></div>')(rootScope);
//        expect(repeater('.active').count()).toBe(1);
//        expect(element('#rootnav_index').class()).toBe('active');
//    });

//});
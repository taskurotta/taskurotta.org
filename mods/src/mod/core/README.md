#mod.core - Компонента ядра портала
## Описание
Компонента реализована provider Angular. Задача компоненты подтянуть объектую структуру
объединенного файла настроек всего портала и предоставить его остальным компонентам и приложениям.
Для использования необходимо в зависимости модуля добавить модуль Angular 'coreMod'
###Реализация
В каждом компоненте необходимо реализовать провайдер получающий объект с настроками текущего компонента
coreModProvider.getMod('current_mod_name')
и предоставить как функции сервиса, которые можно будет использовать в директивах и контроллерах компонентов,
через функции. Далее пример использования провайдере навигационного меню:

    angular.module('navigationModProvider', ['coreMod'])
        .provider('navigationMod', function (coreModProvider) {
            console.log('navigationMod.provider');
            var config = coreModProvider.getMod('navigation');
            this.template = null;
            this.menu = config.menu;
            this.setTemplate = function (template) {
                this.template = template;
            };
            this.getMenu = function () {
                return this.menu;
            };
            this.getTemplate = function () {
                return this.template;
            };
            this.$get = function ($log) {
                $log.log('navigationMod.provider.$get');
                $log.info(config);
                var self = this;
                return {
                    getMenu: function () {
                        return self.menu;
                    },
                    getTemplate: function () {
                        return self.template;
                    }
                };
            };
            this.$get.$inject = ['$log'];
        });

**Важная особенность компоненты mod.core в том, что его можно использовать только на этапе конфигурирования Angular
(через провайдер сoreModProvider),
на этапе работы модуля Angular, доступа к меню нет. Поэтому каждая компонента использующая coreMod должна
реализовать свой провайдер, получающий конфигурацию на этапе конфигурирования Angular и отдающая настройки
на этапе работы Angular, через реализацию this.$get = function (){...}**


###Настройки компоненты
**config.yml**
    mod:
        core:
            version: 0.1.0 # версия

###Сборка
При сборки портала, файла конфигурации перезаписывает значения полей конфигурационным файлом
приложения а затем общим конфигурационным файлом портала (при наличии схожих полей).

## Использование
- Обязательно используется всеми компонентами портала

## Зависимости
- нет


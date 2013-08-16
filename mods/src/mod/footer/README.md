#mod.footer - Компонента нижнего колонтитула страницы
## Описание
Отображение нижнего колонтитула страницы.
Компонента реализована как директива Angular. Реализован как атрибут footer.
    <footer class="bs-footer footer" footer>
    </footer>
###Настройки компоненты
**config.yml**
    mod:
        footer:
            version: 0.1.0 # версия
            copyright: Taskurotta Team 2013 # Строка copyright
            links: # Ссылки
**Структура элементов ссылок**
    mod.footer.links:
      - id: footnav_blog
        href: 'https://github.com/taskurotta/taskurotta.org'
        name: Blog
###Сборка
При сборки портала, файла конфигурации перезаписывает значения полей конфигурационным файлом
приложения а затем общим конфигурационным файлом портала (при наличии схожих полей).

## Использование
- Используется шаблоном портала template,
 в шаблоне template/src/_includes/footer.hbs
Внутри самих приложений не используется

## Зависимости
- [Компонета mod.core](mode_core/mod/core)


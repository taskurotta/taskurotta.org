#Сборка и запуск страницы портала
## Установка NodeJS
Для начала работы нам необходимо устновить nodejs. Дистрибутив можно скачать с сервера
http://nodejs.org/ или установить через репоизторий программ:
- для винды из http://chocolatey.org/ командой
    cinst nodejs
- для ubuntu, mint
    sudo apt-get install python-software-properties python g++ make
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

## Установка Grunt
Для начала работы нам необходимо устновить командый интерфейс GruntJS как глобальную библиотеку NPM (пакетного менеджера NodeJS)
командой:
    npm install -g grunt-cli
Более подробно про установку http://gruntjs.com/getting-started

## Установка библиотек
в текущем каталоге (portal) необходимо выполнить команду:
    npm install & bower install
После выполнения данной команды появятся два каталога
  node_modules и bower_components

## Сбока проекта и запуск сервера
Из текущего каталог (portal) необходимо выполнить команду:
    grunt server
Если у вас установлен chrome, то откроется главная страница портала,
если не установлен, зайдите в вашем браузере на страницу
    http://localhost:9000/

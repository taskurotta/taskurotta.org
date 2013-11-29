# Введение

Это руководство даст пошаговое представление о создании простого проекта. Представим себе, что перед нами стоит следующая
задача:

> Необходимо разработать приложение, отсылающее строковое сообщение пользователю.
> На вход мы получаем Id пользователя и набор символов. Из его профиля (по Id) достаем
> данные о предпочтении - получать сообщения по email или номеру телефона. Номер телефона и
> email также доступны в профиле. Далее отправляем сообщение нужным транспортом. В случае, если
> отправка не удалась (по причине не верного адреса или номера), необходимо отметить это в профиле
> для предотвращения повторных попыток в будущем.

Добавим еще к этому не функциональное требование, о том, что сервисы отправляющие сообщения уже существуют,
находятся в других подсетях и их нужно переиспользовать.

## Общее представление в двух словах <section id="overview"> &nbsp;</section>

Taskurotta позволяет реализовывать компоненты системы (Актеров), взаимодействующих между собой привычным для
разработчика способом - путем вызовов методов друг друга, но в асинхронной манере. Актеры делятся на два вида -
Исполнителей и Координаторов. Исполнители должны четко выполнять поставленные перед ними задачи. Они
представляют собой максимально независимые модули, и соответственно - максимально переиспользуемые. Исполнители
могут взаимодействовать с внешним миром (любые потоки ввода вывода) выполняя задачу таким образом и так долго, как этого
требуется. С другой стороны, Координаторы не выполняют задач, связанных с внешним миром. Они должны отрабатывать как
можно быстрее и не спотыкаться на прямом взаимодействии с БД, сетью и другими потенциально не стабильными компонентами.
Их обязанность ставить задачи исполнителям, координировать их действия и тем самым обеспечить реализацию (описание) процесса.
Координаторы могут ставить задачи другим координаторам, реализуя парадигму переиспользуемых подпроцессов.

## Чуть глубже в трех словах <section id="overview_deep"> &nbsp;</section>

Задача Координатора как можно быстрее раздать известные в данный момент задачи. Т.е. он не должен блокироваться на
ожидании результата. Он должен построить граф зависимостей между известными ему задачами и при необходимости
сформировать асинхронные точки определения дальнейших действий. Как этого достичь, давайте рассмотрим на синтетическом примере.

<blockquote>
    Предположим, что мы должны оповестить пользователя по одному из достпных способов. И если оповестить не удалось, то заблокировать его.
</blockquote>

В данном случае Координатор процесса должен сделать следующее:

1. Запросить профиль пользователя
2. Дождаться получения профиля
3. Отправить сообщение пользователю
4. Дождаться результата отправления

Кодировать данную последовательность действий с помощью автомата состояний, методами изменений одного сообщения несколькими
исполнителями и другими привычными, но костлявыми способами мы не будем. Сделаем это просто и красиво с помощью
сущности Promise и нашей системы, следящей за действиями Координатора.

     Promise<Profile> profilePromise = userProfileService.get(userId);
     Promise<Boolean> sendResultPromise = decider.sendToTransport(profilePromise, message);

В примере видно, что в результате вызова сервисов мы получаем не реальный объект, а некий Promise - ссылку на результат
выполнения задачи. Этот Promise мы можем передавать в качестве аргумента другим сервисам (т.е. задачам). Вызовы других
сервисов будут перехвачены системой (т.е. реального синхронного вызова не произойдет) и выстроена зависимость между ними.
Задачи не поступят на выполнение к сервисам до тех пор, пока все их аргументы типа Promise не будут готовы, т.е. пока
не будут выполнены все необходимые предварительные задачи.

Таким образом, управоение процессом выполняется совместно координатором и нашей системой. Координатор выстраивает
зависимости между задачами, а система берет на себя, кроме всего прочего, функцию ожидания выполнения предварительных задач
и последующего запуска зависимых от них задач.

Давайте теперь усложним пример и раскроем, что такое асинхронные точки определения дальнейших действий.

<blockquote>
    Предположим, что в дополнение к описанному примеру необходимо убедиться в том, что оправка уведомления была успешна
    и если нет то нужно заблокировать отправку уведомлений пользователю.
</blockquote>

В данном случае необходимо между отправкой уведомления и дальнейшими действиями проанализировать результат. Т.е.
дождаться выполнения задачи, произвести анализ и в зависимости от результата, блокировать или нет. Для решения
такой проблемы у координатора есть возможность создать задачу на самого себя - т.е. точку определения дальнейших действий,
в которую передать необходимые Promise. Ниже представлено как это выглядит.

    public void start(String userId, String message) {
           Promise<Profile> profilePromise = userProfileService.get(userId);
           Promise<Boolean> sendResultPromise = decider.sendToTransport(profilePromise, message);
           decider.blockOnFail(userId, sendResultPromise);
       }

     @Asynchronous
     public void blockOnFail(String userId, Promise<Boolean> sendResultPromise) {
            logger.info(".blockOnFail(userId = [{}], sendResultPromise = [{}])", userId, sendResultPromise);
            if (!sendResultPromise.get()) {
                userProfileService.blockNotification(userId);
            }
     }

Метод start() - это старт процесса. Далее идет постановка двух задач. Первая на получение профиля, вторую задачу на отправка,
а третью Координатор ставит сам себе для последующего анализа результата (вызов метода blockOnFail). Таким образом Координатор
как бы ждет решения первой задачи, но без блокировки. Как только задача решена, система Taskurotta вызывает метод координатора
blockOnFail, передавая в него готовый Promise объект, из которого можно получить реальные данные методом get().
После определения того, что получен не отказ на отправку уведомления, мы ставим следующую задачу на блокировку.

С помощью точек определения дальнейших действий можно реализовать различные поведения процесса:

- распараллеливание на различные ветки;
- дальнейшее слияние независимых потоков процесса в одной точке с помощью проброса Promise и @NoWait аннотации
(см. документацию TODO);
- асинхронную рекурсию;
- распараллеливание выполнения однотипных задач, например проверки ЭЦП всех файлов и ожидания результатов выполнения в
одной точке принятия решений;
- и т.д.

P.S.: Вызов задачи blockOnFail происходит через объект decider. Это искусственный объект, перехватывающий вызов, но реально
не вызывающий метод blockOnFail. Нам нужно поставить задачу, а не вызвать ее синхронно. Можно сделать перехват и без
этого объекта, но это будет уже тема в четырех словах. Не будем пока углубляться в джунгли и приступим непосредственно
к разработке...


## Настройка Maven <section id="maven-dep"> &nbsp;</section>

Для начала работы нам необходимо добавить зависимость от модуля core в проект.

    <dependency>
        <groupId>ru.taskurotta</groupId>
        <artifactId>core</artifactId>
        <version>${ru.taskurotta.version}</version>
    </dependency>

В этом модуле содержатся все необходимые классы для разработки и unit тестирования Исполнителей и Координаторов.

## Создание Исполнителя <section id="worker-new"> &nbsp;</section>

Так как по сценарию у нас уже есть Исполнители для отправки email и sms, то нам остается только создать Исполнителя для работы
с профилем. У данного Исполнителя две задачи:

1. Вернуть профиль по идентификатору пользователя.
2. Сделать в профиле отметку о невозможности отправки сообщений для конкретного пользователя.

Начинаем с объявления его интерфейса. С этим интерфейсом будет работать Координатор. Здесь и далее, для компактности
опущены комментарии и другие не существенные части кода.

    @Worker
    public interface UserProfileService {

        public Profile get(String userId);

        public void blockNotification(String userId);

    }

Аннотация @Worker определяет этот интерфейс как Исполнителя. У аннотации есть необязательные атрибуты определяющие аго
имя и версию. По умолчанию, именем является полное имя интерфейса, а версия - "1.0". Исполнители различных версий могут
одновременно работать для разных процессов без каких либо конфликтов.

Перейдем к реализации интерфейса.

    public class UserProfileServiceImpl implements UserProfileService {

        private static final Logger logger = LoggerFactory.getLogger(UserProfileServiceImpl.class);

        @Override
        public Profile get(String userId) {
            return ProfileUtil.createRandomProfile(userId);
        }

        @Override
        public void blockNotification(String userId) {
            logger.info(".blockNotification(userId = [{}]", userId);
        }
    }

Тут мы опустили инициализацию менеджера профилей (ProfileUtil). Он может работать с БД, LDAP или другим реестром. Данный
пример нам показывает, что Исполнитель получает задачи (вызовы) и делегирует их реальному модулю.

На этом создание Исполнителя завершается.

## Объявление способа взаимодействия <section id="worker-client"> &nbsp;</section>

Для решения поставленной перед нами задачи, Координатор должен передать ссылку на еще не полученный профиль
(объект Promise) в точку определения дальнейших действий. Там он выберет транспорт или не будет ничего отсылать,
если отправка сообщений для данного пользователя уже заблокирована.

Однако интерфейс исполнителя, как и сам исполнитель, получают и отдают результат синхронно, а потому не имеют в декларации
результатов выполнения в виде объекта Promise, а возвращают чистый объект данных. Это и правильно. Исполнитель не должен знать
как его используют. Например, наш Исполнитель по получению профиля можно использовать если уже известен
идентификатор пользователя, или если он не известен и нужно передать ссылку на другую задачу, которая этот идентификатор
откуда-то получит. Таким образом мы приходим к интерфейсу взаимодействия с Исполнителем. Этот интерфейс определяет сам
Координатор для своих нужд. Т.е. он определяется в пакете (проекте) Координатора. Добавим интерфейс взаимодействия
с Исполнителем для работы с профилем:

    @WorkerClient(worker = UserProfileService.class)
    public interface UserProfileServiceClient {

        public Promise<Profile> get(String userId);

        public void blockNotification(String userId);
    }

Мы видим интерфейс помеченный аннотацией @WorkerClient. Параметр аннотации ссылается на класс реального интерфейса Исполнителя. Таким
образом устанавливается связь между существующим интерфейсом и необходимым интерфейсом для конкретного Координатора.
Назовем этот интерфейс "клиентским интерфейсом Исполнителя". Этот клиентский интерфейс должен содержать все необходимые
координатору методы (можно не объявлять не используемые) и с идентичной сигнатурой аргументов. Любой аргумент может
быть типом Promise, если требуется передавать в качестве аргумента результат еще не завершенной задачи.

## Создание Координатора <section id="decider-new"> &nbsp;</section>

Теперь переходим к самому интересному - созданию координатора. Для начала ниже представлен интерфейс координатора,
используя который клиенты Taskurotta будут запускать нужные им процессы.

    @Decider
    public interface NotificationDecider {

        @Execute
        public void start(String userId, String message);
    }

Этот интерфейс определен как @Decider - т.е. как Координатор. У этой аннотации есть те же свойства, что и у аннотации
@Worker - имя и версия. По умолчанию за имя берется полное имя интерфейса, а за версию - "1.0".

Метод start помечен как @Execute. Это означает что через данный метод можно запускать процесс.

Теперь переходим к реализации координатора

    public class NotificationDeciderImpl implements NotificationDecider {

        private static final Logger logger = LoggerFactory.getLogger(NotificationDeciderImpl.class);

        private UserProfileServiceClient userProfileService;
        private MailServiceClient mailService;
        private SMSServiceClient smsService;
        private NotificationDeciderImpl decider;

        @Override
        public void start(String userId, String message) {
            logger.info(".start(userId = [{}], message = [{}])", userId, message);

            Promise<Profile> profilePromise = userProfileService.get(userId);
            Promise<Boolean> sendResultPromise = decider.sendToTransport(profilePromise, message);
            decider.blockOnFail(userId, sendResultPromise);
        }

        @Asynchronous
        public Promise<Boolean> sendToTransport(Promise<Profile> profilePromise, String message) {
            logger.info(".sendToTransport(profilePromise = [{}], message = [{}])", profilePromise, message);

            Profile profile = profilePromise.get();

            switch (profile.getDeliveryType()) {
                case SMS: {
                    return smsService.send(profile.getPhone(), message);
                }
                case EMAIL: {
                    return mailService.send(profile.getEmail(), message);
                }

            }

            return Promise.asPromise(Boolean.TRUE);
        }


        @Asynchronous
        public void blockOnFail(String userId, Promise<Boolean> sendResultPromise) {
            logger.info(".blockOnFail(userId = [{}], sendResultPromise = [{}])", userId, sendResultPromise);

            if (!sendResultPromise.get()) {
                userProfileService.blockNotification(userId);
            }
        }
    }

В данном коде мы также опустили инициализацию приватных объектов. Полный и работающий код примера можно посмотреть в
пакете example. Тут только отметим, что значения приватных полей получаются через специальную фабрику прокси объектов
для Координатора.

В  примере реализации есть две точки ожидания результатов выполнения незавершенных задач Координатором. Это метод
sendToTransport и blockOnFail. Данные методы будут вызваны только тогда, когда все их аргументы типа Promise будут готовы,
т.е. выполнены соответствующий задачи.

Объекты полей типа MailServiceClient и SMSServiceClient также являются клиентскими интерфейсами к соответствующим Исполнителям.
Их инициализацию можно также посмотреть в проекте example.

На данный момент у нас есть все реализованные Исполнители и Координатор. Перейдем непосредственно к запуску Актеров
(т.е. Исполнителей и Координаторов).

## Модуль запуска <section id="bootstrap"> &nbsp;</section>

Выполнение задач может происходить как внутри серверов приложений, так и в виде отдельного java
приложения (*данный пример использует вариант отдельного приложения из модуля bootstrap).
Что делает отдельное приложение:

- Регистрируется на сервере Taskurotta.
- Запускает пул из N потоков для выполнения задач.
- Получает задачи от серверов Taskurotta.
- Запускает их выполнение.
- Пересылает результат серверу Taskurotta.

Для запуска отдельного java приложения используется пакет bootstrap, а конкретнее - класс ru.taskurotta.bootstrap.Main .
Ему в качестве аргумента нужно передать местонахождение файла конфигурации в формате YAML.

Рассмотрим файл конфигурации.

## Настройка приложения <section id="config"> &nbsp;</section>

Файл конфигурации для Координатора в формате YAML выглядит следующим образом:

    runtime:
      - Runtime:
          class: ru.taskurotta.example.bootstrap.SimpleRuntimeConfig
          instance:
            context: "fff"

    spreader:
      - Spreader:
          class: ru.taskurotta.example.bootstrap.SimpleSpreaderConfig
          instance:
            endpoint: "http://localhost:8081"
            threadPoolSize: 10
            readTimeout: 0
            connectTimeout: 3000

    profiler:
      - Profiler:
          class: ru.taskurotta.bootstrap.config.DefaultProfilerConfig
          instance:
            class: ru.taskurotta.bootstrap.profiler.MetricsProfiler
            properties:
              meterCycle: true
              trackExecute: true
              trackCycle: true
              trackPull: true
              trackRelease: true
              trackError: false
              logOutput: false
              consoleOutput: false

    actor:
      - NotificationDecider:
          actorInterface: ru.taskurotta.example.decider.NotificationDecider
          runtimeConfig: Runtime
          spreaderConfig: Spreader
          profilerConfig: Profiler
          count: 1

Файл конфигурации для Исполнителей в формате YAML выглядит следующим образом:

    runtime:
      - Runtime:
          class: ru.taskurotta.example.bootstrap.SimpleRuntimeConfig
          instance:
            context: "fff"

    spreader:
      - Spreader:
          class: ru.taskurotta.example.bootstrap.SimpleSpreaderConfig
          instance:
            endpoint: "http://localhost:8082"
            threadPoolSize: 10
            readTimeout: 0
            connectTimeout: 3000

    profiler:
      - Profiler:
          class: ru.taskurotta.bootstrap.config.DefaultProfilerConfig
          instance:
            class: ru.taskurotta.bootstrap.profiler.MetricsProfiler
            properties:
              meterCycle: true
              trackExecute: true
              trackCycle: true
              trackPull: true
              trackRelease: true
              trackError: false
              logOutput: false
              consoleOutput: false

    actor:
      - ProfileService:
          actorInterface: ru.taskurotta.example.worker.profile.UserProfileService
          runtimeConfig: Runtime
          spreaderConfig: Spreader
          profilerConfig: Profiler
          count: 1

      - MailService:
          actorInterface: ru.taskurotta.example.worker.mail.MailService
          runtimeConfig: Runtime
          spreaderConfig: Spreader
          profilerConfig: Profiler
          count: 1

      - SMSService:
          actorInterface: ru.taskurotta.example.worker.sms.SMSService
          runtimeConfig: Runtime
          spreaderConfig: Spreader
          profilerConfig: Profiler
          count: 1

Секция actor определяет Актеров. По порядку элементов секции:

1. actorInterface - интерфейс Актера.
2. runtimeConfig - имя конфигуратора инициализирующего и далее предоставляющего для работы экземпляр объекта Актера.
3. spreaderConfig - конфигурация модуля взаимодействующего с серверами Taskurotta для получения задач и регистрации результата
их выполнения.
4. count - количество потоков, получающих задачи для актеров и запускающих их выполнение. Т.е. фактически - количество
одновременно работающих актеров.

Секции runtime и spreader специфичны для конкретной реализации контекста выполнения. В данном руководстве мы
их описание опустим. См. соответствующие разделы документации (TODO).

## Fat Jar <section id="fat-jar"> &nbsp;</section>

С помощью плагинов maven-jar-plugin и maven-shade-plugin мы создаем единый jar файл включающий в себя все необходимые
библиотеки. Это исполняемый jar файл, который можно просто запустить командной <code>java -jar {mainClass}</code> и
так же легко остановить процесс средствами операционной системы.

Таким образом наши Актеры будут очень близки к обычным процессам ОС. Их можно легко перемещать по разным машинам руками,
или автоматически для управления нагрузкой в светлом-присветлом будущем.

Подробнее об использовании плагинов см. в документации в разделе Fat Jar (TODO)

## Запуск приложения <section id="run"> &nbsp;</section>

Наконец мы имеем один jar файл с нашим приложением и конфигурационный файл для него. Остается только запустить приложение:

строка для запуска Координатора
    <code>java -jar process-0.1.0-SNAPSHOT.jar -f config-decider.yml</code>

строка для запуска Исполнителей
    <code>java -jar process-0.1.0-SNAPSHOT.jar -f config-actors.yml</code>

Готовый пример можно взять [здесь](https://github.com/taskurotta/taskurotta-getstarted)

На этом мы заканчиваем первое знакомство. Для более глубокого изучения вам предоставляется подробная документация (TODO).

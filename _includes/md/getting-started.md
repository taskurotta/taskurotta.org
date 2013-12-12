## <div id="gs-task">Task</div>

Let's write simple application which shows to us how all stuff works. Imagine that we got task create application:

> We should sent text message to user. We have user id and message. We should retrieve user profile by user id.
> From user profile we should get user preferences how to receive messages(by phone or by E-mail).
> Email and phone number we got in user profile too. After that we should try to send message through preferred transport.
> If we couldn't send message to user we should mark this in user profile to prevent send through this transport in future.


Additional to these requirements imagine that you already have services for E-mail and Phone transport.
These services situated in the other sub-networks and we want to reuse them.

PS: All source code for this manual is available at GitHub
[taskurotta-getstarted](https://github.com/taskurotta/taskurotta-getstarted) project.

## <div id="gs-overview">Overview</div>

Taskurotta helps us implement components(Actors) of our application, which can interact between each other in the familiar style.
All interactions would be asynchronous. Actors divided on two types - Workers and Deciders. Workers - component with
independent responsibility. Workers could interact with legacy systems, RDBMS, SNMP, etc. They can run process as long as they should.
And the most important thing that they should be reusable. On the other hand Deciders doesn't do any job with legacy systems and unstable systems.
They should working as fast as they can. They should only run tasks on workers and coordinate interactions between them.
Of course deciders can call methods of other deciders, this feature helps us create reusable processes in taskurotta environment.

Main responsibility of Decider to run tasks on Workers as fast as it can. In the other words it doesn't waiting result from worker.
It just creating graph of invocations between tasks and if it necessary creating asynchronous points of decision.
How it works? We will try to explain on simple example below.

<blockquote>
    Imagine that we need notify user by one of available transport service. If we can't notify we should block him.
</blockquote>

For this requirement our Decider should have done next steps:

1. Ask user profile
2. Wait until it receives user profile
3. Notify user
4. Wait until it receives result of notification

Commonly for this situation we should use a state machine, but this is ugly code with overhead. We will do this with more handy
tools like Promise and Taskurotta.

```java
     Promise<Profile> profilePromise = userProfileService.get(userId);
     Promise<Boolean> sendResultPromise = decider.sendToTransport(profilePromise, message);
```

In this example we see that as result of invocation of service, our service would returned just Promise not real object.
Promise it's a link to our result and this Promise instance we can pass as argument to other services. Other services
invocations would be intercepted by Taskurotta and this invocation would be added to our graph of invocations.
Task for invocation on real Worker wouldn't be added until it didn't get real result for it.

Decider arranging all dependencies between tasks, from the other side
taskurotta server takes responsibility for getting real result from workers and executes task which depends from that results.

Let's try to add some complications to our example, in this complication you will see how works our asynchronous points of decisions.

<blockquote>
    Imagine that we got special requirement for our example. We should got feedback that notification successfully received.If notify was failed we should block notification in future for this user.
</blockquote>


As we see in this situation we should analyze result between notification and other tasks. We should wait for real result.
If we got failure we should block user notification. To solve this problem we can create task on itself. This is what we call
asynchronous decisions points, in this point we can pass Promise arguments. Follow our simple example.

```java
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
```

Method start() - this is the main method of process. In the next lines we are creating two tasks. First for retrieve user profile,
second for sending notification. And in the third line decider creates task on itself for analyzing result(method blockOnFail()).
Decider would be wait for result, but without blocking. When task will be solved, Taskurotta will be invocate method blockOnfail() and pass
Promise object with real result which can get by calling method get().
If we get result with failure we it will invocate task for blocking notification.

With asynchronous points of decision you can solve a lot of scenarios, like:
- paralleling process on a different branches
- fork and join tasks of process in one point with Promise object and @NoWait annotation(see the doc TODO)
- asynchronous recursion
- execute paralleling simple tasks and wait until they ends(for example: Digital signature of files bundle)
- etc.

P.S.: Invocation of method blockOnFail() happens via object decider. This is interceptor which helps create us a new task,
instead of real synchronous invocation.

## <div id="gs-create-worker">Create Workers</div>

As we told before, we have already Workers for notification over email and sms. We should only create worker for user profile
manipulation. This worker has two tasks:

1. Get user profile by user ID
2. Mark profile about failure notification via prefered transport

Let's start from interface creation. With this interface would be work our Decider.

```java
    @Worker
    public interface UserProfileService {

        public Profile get(String userId);

        public void blockNotification(String userId);

    }
```

@Worker annotation mark our interface as interface of Worker. This annotation has mandatory attributes which define
name and version of our worker. By default name of worker equals the full name of interface and version as "1.0".
Workers of different version can works at the same time for different processes with out conflicts.

Implementation of our interface

```java
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
```
Implementation of ProfileUtil it could be anything. It could be works with LDAP, RDBMS, etc. In this example you should see this worker only delegate invocation itself to real module ProfileUtil.

## <div id="gs-create-worker-client">Declaration of Interaction Method</div>

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

```java
    @WorkerClient(worker = UserProfileService.class)
    public interface UserProfileServiceClient {

        public Promise<Profile> get(String userId);

        public void blockNotification(String userId);
    }
```

Мы видим интерфейс помеченный аннотацией @WorkerClient. Параметр аннотации ссылается на класс реального интерфейса Исполнителя. Таким
образом устанавливается связь между существующим интерфейсом и необходимым интерфейсом для конкретного Координатора.
Назовем этот интерфейс "клиентским интерфейсом Исполнителя". Этот клиентский интерфейс должен содержать все необходимые
координатору методы (можно не объявлять не используемые) и с идентичной сигнатурой аргументов. Любой аргумент может
быть типом Promise, если требуется передавать в качестве аргумента результат еще не завершенной задачи.

## <div id="gs-create-decider">Create Decider</div>

Теперь переходим к самому интересному - созданию координатора. Для начала ниже представлен интерфейс координатора,
используя который клиенты Taskurotta будут запускать нужные им процессы.

```java
    @Decider
    public interface NotificationDecider {

        @Execute
        public void start(String userId, String message);
    }
```
Этот интерфейс определен как @Decider - т.е. как Координатор. У этой аннотации есть те же свойства, что и у аннотации
@Worker - имя и версия. По умолчанию за имя берется полное имя интерфейса, а за версию - "1.0".

Метод start помечен как @Execute. Это означает что через данный метод можно запускать процесс.

Теперь переходим к реализации координатора

```java
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
```

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

## <div id="gs-bootstrap">Bootstrap</div>

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

## <div id="gs-config">Config</div>

Файл конфигурации для Координатора в формате YAML выглядит следующим образом:

```yaml
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
```

Файл конфигурации для Исполнителей в формате YAML выглядит следующим образом:


```yaml
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
```
Секция actor определяет Актеров. По порядку элементов секции:

1. actorInterface - интерфейс Актера.
2. runtimeConfig - имя конфигуратора инициализирующего и далее предоставляющего для работы экземпляр объекта Актера.
3. spreaderConfig - конфигурация модуля взаимодействующего с серверами Taskurotta для получения задач и регистрации результата
их выполнения.
4. count - количество потоков, получающих задачи для актеров и запускающих их выполнение. Т.е. фактически - количество
одновременно работающих актеров.

Секции runtime и spreader специфичны для конкретной реализации контекста выполнения. В данном руководстве мы
их описание опустим. См. соответствующие разделы документации (TODO).

## Fat Jar <section id="gs-fat-jar"> &nbsp;</section>

С помощью плагина maven-shade-plugin мы создаем единый jar файл включающий в себя все необходимые
библиотеки. Это исполняемый jar файл, который можно просто запустить командной <code>java -jar {mainClass}</code> и
так же легко остановить процесс средствами операционной системы.

Таким образом наши Актеры будут очень близки к обычным процессам ОС. Их можно легко перемещать по разным машинам руками,
или автоматически для управления нагрузкой в светлом-присветлом будущем.

Подробнее об использовании плагинов см. в документации в разделе Fat Jar (TODO)


## <div id="gs-run-it">Run it!</div>

### <div id="gs-requirements">Requirements</div>

- jdk 1.7
- maven 3
- git

### <div id="gs-ts-clone">Clone Taskurotta repository</div>

    git clone https://github.com/taskurotta/taskurotta.git
    cd taskurotta/

Checkout last tested version

    git checkout 246146d

### <div id="gs-ts-install">Install</div>

    mvn install -DskipTests

### <div id="gs-ts-run">Run servers</div>

Run two nodes on same physical server (for test reason). Note: you can run as many nodes as you need.
Please correct port numbers if you will use same physical server.

Run first node:

    java -Xmx256m -DassetsMode=dev -Dts.node.custom.name="node1" -Ddw.http.port=8081 -Ddw.http.adminPort=9081 -Ddw.logging.file.currentLogFilename="assemble/target/server1.log" -jar assemble/target/assemble-0.3.1.jar server assemble/src/main/resources/hz.yml

Run second node:

    java -Xmx256m -DassetsMode=dev -Dts.node.custom.name="node2" -Ddw.http.port=8082 -Ddw.http.adminPort=9082 -Ddw.logging.file.currentLogFilename="assemble/target/server2.log" -jar assemble/target/assemble-0.3.1.jar server assemble/src/main/resources/hz.yml

When both servers connected to each other, you can find message like this

    Members [2] {
    	Member [192.168.1.2]:7777
    	Member [192.168.1.2]:7778 this
    }


Open console in browser:

[http://localhost:8081/index.html](http://localhost:8081/index.html) or [http://localhost:8082/index.html](http://localhost:8082/index.html)

You can use ANY node console later. In general, consoles provide the same information.
Note: console is not implemented yet. It is support all features only in configuration with mongodb and oracle
backends.

### <div id="gs-actors-clone">Clone pet repository</div>

    git clone https://github.com/taskurotta/taskurotta-getstarted.git
    cd taskurotta-getstarted/

Package ru.taskurotta.example.worker contains three worker interfaces and its implementations.

Package ru.taskurotta.example.decider contains decider interface NotificationDecider, its implementation and
clients interfaces which are used by decider to communicate with workers.

NotificationDeciderImlTest class contains example of decider initialisation and testing of two its methods.


### <div id="gs-actors-assemble">Assemble it</div>

    mvn install

### <div id="gs-proc-create">Create processes</div>

    java -cp target/process-1.0-SNAPSHOT.jar ru.taskurotta.example.starter.NotificationModule http://localhost:8081 91

Check console [http://localhost:8081/index.html](http://localhost:8081/index.html) . Select "Queues" menu item. There should be 91 tasks in
ru.taskurotta.example.decider.NotificationDecider#1.0 queue.

![Image](/getting-started/img/step1.png)

### <div id="gs-proc-run-deciders">Run decider</div>

    java -Xmx256m -jar target/process-1.0-SNAPSHOT.jar -f src/main/resources/config-decider.yml

Our decider going to register on taskurotta to port 8081 just check src/main/resources/config-decider.yml

     spreader:
          - Spreader:
              class: ru.taskurotta.example.bootstrap.SimpleSpreaderConfig
              instance:
                endpoint: "http://localhost:8081"
                threadPoolSize: 10
                readTimeout: 0
                connectTimeout: 3000

After decider start. Check console [http://localhost:8081/index.html](http://localhost:8081/index.html) . Select "Queues" menu item. There should be 91 tasks in ru.taskurotta.example.worker.profile.UserProfileService#1.0 queue.

![Image](/getting-started/img/step2.png)

### <div id="gs-proc-run-actors">Run actors</div>

    java -Xmx256m -jar target/process-1.0-SNAPSHOT.jar -f src/main/resources/config-actors.yml

Our actors going to ask taskurotta to port 8082 just check src/main/resources/config.yml

    spreader:
      - Spreader:
          class: ru.taskurotta.example.bootstrap.SimpleSpreaderConfig
          instance:
            endpoint: "http://localhost:8082"
            threadPoolSize: 10
            readTimeout: 0
            connectTimeout: 3000

Now you see how our small cluster works. Test starter creates processes on [http://localhost:8081/index.html](http://localhost:8081/index.html) and **decider** started with registration **on port 8081** too.
But our **actors** executes processes getting them from [http://localhost:8082/index.html](http://localhost:8082/index.html).

If you open web console on [http://localhost:8081/index.html](http://localhost:8081/index.html) or on [http://localhost:8082/index.html](http://localhost:8082/index.html), you will see that all queues have zero tasks because all tasks have already executed after actors run.

![Image](/getting-started/img/step3.png)

Try to change configuration and you will see that two taskurotta servers can be used vice versa.

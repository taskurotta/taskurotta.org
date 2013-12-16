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
taskurotta server takes responsibility for getting real result from workers and executes task which depends from this results.

Let's try to add some complications to our example, in this complication you will see how works our asynchronous points of decisions.

<blockquote>
    Imagine that we got special requirement for our example. We should got feedback that notification successfully received.If notify was failed we should block notification in future for this user.
</blockquote>


As we see in this situation we should analyze result between notification and other tasks. We should wait for real result.
If we got failure we should block user notification. To solve this problem we can create task on itself. This is what we call
asynchronous points of decisions, in these points we can pass Promise arguments. Follow our simple example.

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
Implementation of ProfileUtil could be anything. It could be works with LDAP, RDBMS, etc. In this example you should see this worker only delegate invocation itself to real module ProfileUtil.

## <div id="gs-create-worker-client">Declaration of Interaction Method</div>

To solve this problem Decider should pass link on profile which not yet received(Promise object) to decision point for future analyze.
Than it will choose transport or decline notification, if notification already blocked for this user.

However interface of worker, as is a worker received and returned result in synchronous way, and therefore does not have declaration with Promise object.
This is right way. Worker shouldn't know about how Decider works with it.
For example, our worker which works with user profile can be used if we already know user ID, otherwise we should take
care about how to pass link of task with user ID.
To realize this we should create contract interface between worker and decider. This contract interface would be defined in decider package for own
interaction with worker.

```java
    @WorkerClient(worker = UserProfileService.class)
    public interface UserProfileServiceClient {

        public Promise<Profile> get(String userId);

        public void blockNotification(String userId);
    }
```

Look at the @WorkerClient. Annotation attribute has reference to class of worker interface. In this way we connect exist interface
of worker with contract interface of decider. Contract interface should contains all necessary methods for
decider(you shouldn't declare all methods from worker interface) with identical signature of arguments.
Any argument can be type of Promise if you need pass result of unfinished task as argument.

## <div id="gs-create-decider">Create Decider</div>

Now we are come to the most interesting part - Create Decider. First of all look at the decider interface below,
which would be used by clients of Taskurotta to run processes.

```java
    @Decider
    public interface NotificationDecider {

        @Execute
        public void start(String userId, String message);
    }
```
Interface marked as @Decider. This annoation contains the same attributes as annotation @Worker. And as worker
by default name of decider equals the full name of interface and version as "1.0".

Method start marked as @Execute. This means that by this method we can run  process.

Now look at implementation of Decider.

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

In this code-paste we show only meaningful part of source code. For the full source code just look at the package example.
All values of private fields resolved via special factory of proxy object for Decider.

In example exist two asynchronous points of decision. Method sendToTransport and blockOnFail. This methods would be invoked
only when all arguments of type Promise will be ready. In other words - all tasks will be finished.

Fields MailServiceClient and SMSServiceClient - contract interfaces to the other workers. They initialization you can
check in source code of project example.

Now we have decider and worker, let's go to see how to run all this stuff!

## <div id="gs-bootstrap">Bootstrap</div>

Task execution can be as in the application server, or as standalone java application. This example use standalone run
from module bootstrap.

Features of boostrap:
- Registration on Taskurotta server
- Run thread pool with N threads for task execution
- Retreive tasks from Taskurotta server
- Run tasks
- Send results to the Taskurotta server

To run as standalone java application we should use class ru.taskurotta.bootstrap.Main from package bootstrap.
This class receive argument where we should pass path for YAML configuration file.

Let's check config file.

## <div id="gs-config">Config</div>

Configuration file for decider in YAML format looks like:

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

Configuration file for workers in YAML format looks like:


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
Section actor defines the actors. By order of the items section:

1. actorInterface - actor interface
2. runtimeConfig - Configurator for initialization of actor instance
3. spreaderConfig - Module configuration for interaction with Taskurotta server
4. count - amount of threads for actors

Sections runtime and spreader doesn't covered in this manual. See the doc (TODO).

## Fat Jar <section id="gs-fat-jar"> &nbsp;</section>

With handy maven-shade-plugin we are creating single jar which includes all libs.
This is executable jar file, which you simply run with command <code>java -jar {mainClass}</code> and of course
you can simply stop this application with tools of OS.

Thus our Actors looks like processes of OS. You can easy to move them from one machine to another.
Or you can automate it with tools such as Puppet.

For more information see the doc Fat Jar (TODO)


## <div id="gs-run-it">Run it!</div>

### <div id="gs-requirements">Requirements</div>

- jdk 1.7
- maven 3
- git

### <div id="gs-ts-clone">Clone Taskurotta repository</div>

    git clone https://github.com/taskurotta/taskurotta.git
    cd taskurotta/

Checkout last tested version

    git checkout release-0.4.0

### <div id="gs-ts-install">Install</div>

    mvn clean install -DskipTests

### <div id="gs-ts-run">Run servers</div>

Run cluster of two server nodes (it will use the same machine for test purposes). Note: you can run as many nodes as you need in production environment.
But be sure to correct the port numbers if you're going to use the same machine.

Run the first node:

    java -Xmx64m -Ddw.http.port=8081 -Ddw.http.adminPort=9081 -Ddw.logging.file.currentLogFilename="assemble/target/server1.log" -jar assemble/target/assemble-0.4.0.jar server assemble/src/main/resources/hz.yml

Run the second node:

    java -Xmx64m -Ddw.http.port=8082 -Ddw.http.adminPort=9082 -Ddw.logging.file.currentLogFilename="assemble/target/server2.log" -jar assemble/target/assemble-0.4.0.jar server assemble/src/main/resources/hz.yml

When both servers are connected to each other, a log message like this appears:

    Members [2] {
    	Member [192.168.1.2]:7777
    	Member [192.168.1.2]:7778 this
    }


Open console in a web browser:

[http://localhost:8081/index.html](http://localhost:8081/index.html) or [http://localhost:8082/index.html](http://localhost:8082/index.html)

You can use ANY node console later. In general, consoles provide the same information.
Note: console is not implemented yet. It is support all features only in configuration with mongodb and oracle
backends.

## 3. Run example process

### <div id="gs-actors-clone">Clone repository</div>

    git clone https://github.com/taskurotta/taskurotta-getstarted.git
    cd taskurotta-getstarted/

### Example process content

Package **ru.taskurotta.example.worker** contains three worker interfaces and their implementations.

Package **ru.taskurotta.example.decider** contains decider interface **NotificationDecider**, its implementation and
client interfaces which are used by the decider to communicate with workers.

**NotificationDeciderImlTest** class contains an example of decider initialization and testing code for two of its methods.

### <div id="gs-actors-assemble">Assemble example process project</div>

    mvn clean install

### <div id="gs-proc-create">Submit process starters tasks</div>

To do the actual job actor should obtain task from the server. So lets submit some tasks for a decider to start the example process.

    java -cp target/getstarted-process-0.1.0.jar ru.taskurotta.example.starter.NotificationModule http://localhost:8081 91

Check the console [http://localhost:8081/index.html](http://localhost:8081/index.html) . Select "Queues" menu item. There should be 91 tasks in the
ru.taskurotta.example.decider.NotificationDecider#1.0 queue. They are the process starters tasks for deciders.

<img src="/getting-started/img/step1.jpg" width="646" height="289" alt="step1 image" />

### <div id="gs-proc-run-deciders">Run the decider</div>

    java -Xmx64m -jar target/getstarted-process-0.1.0.jar -f src/main/resources/config-decider.yml

The example decider uses server endpoint provided via YAML file and pointed to the first cluster node (port 8081).
Check src/main/resources/config-decider.yml for configuration details.

     spreader:
          - Spreader:
              class: ru.taskurotta.example.bootstrap.SimpleSpreaderConfig
              instance:
                endpoint: "http://localhost:8081"
                threadPoolSize: 10
                readTimeout: 0
                connectTimeout: 3000

The result of example decider execution is a task for the worker that would appear in worker's queue on server.
Every taskurotta actor is bind to the corresponding server queue and executes tasks from it.
Check the console [http://localhost:8081/index.html](http://localhost:8081/index.html) . On "Queues" menu item there should be 91 tasks in ru.taskurotta.example.worker.profile.UserProfileService#1.0 queue.

<img src="/getting-started/img/step2.jpg" width="640" height="317" alt="step2 image" />

### <div id="gs-proc-run-actors">Run the workers</div>

    java -Xmx64m -jar target/getstarted-process-0.1.0.jar -f src/main/resources/config-workers.yml

The workers also use the endpoint provided via YAML configuration file, but they would poll the second cluster node (port 8082).
Check src/main/resources/config.yml for details.

    spreader:
      - Spreader:
          class: ru.taskurotta.example.bootstrap.SimpleSpreaderConfig
          instance:
            endpoint: "http://localhost:8082"
            threadPoolSize: 10
            readTimeout: 0
            connectTimeout: 3000

It should demonstrate how our small cluster works: test starter class creates processes on the first node [http://localhost:8081/index.html](http://localhost:8081/index.html) and
**decider** is started pointed to this node (**port 8081**) too.
But the **actors** execute processes by getting them from the second node [http://localhost:8082/index.html](http://localhost:8082/index.html).

If you open the web console on [http://localhost:8081/index.html](http://localhost:8081/index.html) or [http://localhost:8082/index.html](http://localhost:8082/index.html), you will see that all
queues have now zero tasks because all tasks have already been executed after actors run.

<img src="/getting-started/img/step3.jpg" width="643" height="380" alt="step3 image" />

Try to change the configuration and you will see that two taskurotta servers can be used vice versa.

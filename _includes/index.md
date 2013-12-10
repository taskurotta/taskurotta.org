Taskurotta is based on [Amazon SWF ideology](http://aws.amazon.com/swf/). Common idea is concentration on business
logic instead on low level communication issues. All business-logic should be implemented in reusable components
«Actors» - «Workers» and «Deciders». Actors can be organized to work in one JVM instance or in different JVM instances.
This is very flexible solution which can be used for fault-tolerance or load-balancing.

All parameters of actors and their work results are stored for a future analysis. It’s very convenient to have archive of data for operational analysis and regression tests.

Actors can work as in existed application servers or as in special simple stack - «Taskurotta
.bootstrap». Taskurotta server has simple REST interface for interaction between actors and clients which can start process in the system.
Process creation and coordination can be implemented in common Java-style coding. All you need it’s just to work with
object who has implementation of business interface.

Taskurotta has using [Hazelcast](http://www.hazelcast.com/) in-memory data grid for creating
shared memory and runtime environment between Taskurotta servers. This framework allows us to create transparent
scalability. All nodes have auto-discovery feature which helps to register new node and distribute memory from one
node to another.

Processes which should run by schedule can be used with Process Scheduler who has configuration based on cron-expressions. Process Scheduler also as all of components has fault-tolerance feature and can be run on one of live Taskurotta server after
system crash.

Web-console helps to control all process. It can be accessed on every node of Taskurotta servers.
Web-console main features:

- Show all information about process and queues
- Metrics (queue size, execution duration of task by actor,
processing time of task by server etc.)
- Managing broken processes
- Managing process scheduler

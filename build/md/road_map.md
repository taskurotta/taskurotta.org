Taskurotta is based on [Amazon SWF ideology](http://aws.amazon.com/swf/).

Main features

- Dynamic process creation
- Simple run and control of processes
- Reusable Actors in processes(Workers and Coordinators)
- Regression tests based on actors and archive data
- Handy creation of actors
- Handy scalability of actors and servers
- Fault-tolerance and load-balancing
- Process Scheduler

Common idea is concentration on business logic. All business-logic should be implemented in reusable components - «Workers».  Workers can be organized to work in one JVM instance or in different JVM instances.
This is very flexible solution which can be used for fault-tolerance or load-balancing.

All parameters of actors and their work results are stored for a future analysis. It’s very convenient to have archive of data for operational analysis and regression tests.

Actors can work as in existed application server and as in special useful wrapper - «Taskurotta.bootstrap». Taskurotta server has simple REST interface for interaction between actors and clients which can start process in the system.
Process creation can be implemented in common Java-style coding. All you need it’s just to work with object who has implementation of business interface.

Taskurotta has using [Hazelcast Framework](http://www.hazelcast.com/) for creating shared memory and runtime enviroment between Taskurotta servers. This framework allows us to create transparent scalability.
All nodes have auto-discovery feature which helps to register new node and distribute memory from one node to another.

Processes which should run by schedule can be used with Process Scheduler who has configuration based on cron-expressions. Process Scheduler also as all of components has fault-tolerance feature and can be run on one of live Taskurotta server after
system crash.

Web-console helps to control all process. It can be accessed on every node of Taskurotta servers.
Web-console main features

- Show all information about process
- Statuses of all tasks in queues
- Metrics(for example: estimated time of task, execution duration of task by actor, processing time of task by server etc.)
- Managing Process Scheduler

We are going to open source with all stuff in the end of the year. https://github.com/taskurotta/taskurotta
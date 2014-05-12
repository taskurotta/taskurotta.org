REST API for remote services
============================

##Resources description

There are three main REST resources available for server interactions. Each of them is described below in detail
along with their respect JSON entities.

### 1. Start the new workflow: "/tasks/start"

- URL: "http://host:port/tasks/start"
- Method: POST
- Media type: application/json
- Consumes: *TaskContainer* object
- Produces: HTTP status 200 on success,
            HTTP 500 on error



### 2. Request for a new task: "/tasks/poll"

- URL: "http://host:port/tasks/poll"
- Method: POST
- Media type: application/json
- Consumes: *ActorDefinition* object
- Produces: *TaskContainer*  object on success,
            HTTP 500 on error



### 3. Return task execution result: "/tasks/release"

- URL: "http://host:port/tasks/release"
- Method: POST
- Media type: application/json
- Consumes: *DecisionContainer* object
- Produces: HTTP 200 on success,
            HTTP 500 on error



##JSON entities description

### 1. ActorDefinition
Object identifies actor type.

Fields:

- **name** : string. Contains actor identity string. Should contain full name of the actor interface unless other specified.
- **version** : string. Contains actor interface version. Defaults to "1.0".
- **taskList** : string(optional). Contains task list identity this actor is bind to. null if task list is not specified.

Example JSON (short):
<pre class="brush: js;">
{
  "name": "EmailNotifier",
  "version": "1.0"
}
</pre>

Example JSON (full):
<pre class="brush: js;">
{
  "name": "ru.rr.monbaz.data.provider.workers.IEmailNotifier",
  "version": "1.0",
  "taskList": "dedicated_queue_X"
}
</pre>


### 2. ArgContainer
JSON describing each of the task method invocation arguments as well as its return value.

Fields:

- **dataType** : string. Description for the value data type. For instance, value class name in java implementation
- **taskId** : UUID string(optional for real values). Identifier for the task responsible for resolving
this argument (in case it is a Promise not a real value).
- **valueType** : enumeration PLAIN(default)|ARRAY|COLLECTION (optional). Type of the argument or return value - simple object,
collection of objects or an array.
- **compositeValue** : *ArgContainer* array(optional). Contains argument value in case of a collection or an array argument type.
- **promise** : boolean. Indicates that the argument is a promise or a real value.
- **errorContainer** : *ErrorContainer* object(optional). Error stack spawned during the execution of the task providing argument.
- **ready** : boolean. Indicates that the argument value is ready.
- **jsonvalue** : JSON object(optional). JSON representation for the PLAIN-type argument value.


Example JSON:
<pre class="brush: js;">
{
  "dataType": "ru.rr.monbaz.data.provider.model.DataRequest",
  "taskId": null,
  "valueType": "PLAIN",
  "compositeValue": null,
  "promise": false,
  "errorContainer": null,
  "ready": true,
  "jsonvalue": {
    "userId": "John Smith",
    "requestId": "TSK-341",
    "period": null,
    "type":4,
    "nsl": [
      "Item-1",
      "Item-2",
      "Item-3",
      "Item-4"
    ]
  }
}
</pre>


### 3. TaskContainer
JSON description of the actor's task. In general it represents actor method with its
arguments and additional parameters governing the specific actor behaviour if needed.

Fields:

- **taskId** : UUID string. Unique task identifier.
- **method** : string. Contains executing method name.
- **actorId** : string. Actor identity in the form of "actor_name#version".
- **type** : enumeration DECIDER_START|DECIDER_ASYNCHRONOUS|WORKER|WORKER_SCHEDULED. Represents type of the
task: start new workflow, asynchronous decider invocation, regular actor invocation, scheduled worker invocation.
- **startTime** : number. Time in milliseconds representing task start time. The task should be started at that
time. Value -1 means start right away.
- **numberOfAttempts** : number. Number of attempt to re-run the task. Ability to re-run the task on execution
failure could be configured for actors.
- **args** : *ArgContainer* array. Task arguments description.
- **options** : *TaskOptionsContainer* (optional). Specific task options if there are any.
- **processId** : UUID string. Unique identifier of the process containing the task.
- **unsafe** : boolean (optional). Indicates that the task execution could be interrupted with error without
breaking the whole process flow. Meaning that the decider for the process knows how to handle such errors gracefully.
- **failTypes** : strings array(optional). String representation of error types that could be handled
gracefully by process decider. All other types of errors will cause process flow to stop.

Example JSON (PLAIN-type argument):
<pre class="brush: js;">
{
  "taskId": "09dcc2a2-f5f8-46c4-a37f-5b05cd76b265",
  "method": "provideData",
  "actorId": "ru.rr.monbaz.data.provider.workers.IDataProvider#1.0",
  "type": "WORKER",
  "startTime": -1,
  "numberOfAttempts": 1,
  "args": [
    {
      "dataType": "ru.rr.monbaz.data.provider.model.DataRequest",
      "taskId": null,
      "valueType": "PLAIN",
      "compositeValue": null,
      "promise": false,
      "errorContainer": null,
      "ready": true,
      "jsonvalue": {
        "userId": "John Smith",
        "requestId": "TSK-341",
        "period": null,
        "format": null,
        "type": null,
        "nsl":[
          "Item-1",
          "Item-2",
          "Item-3",
          "Item-4"
        ]
      }
    }
  ],
  "options": null,
  "processId": "85726c28-85ae-4978-8b29-1108c4b5c622",
  "unsafe": false,
  "failTypes": null
}
</pre>

Example JSON (ready promise argument):
<pre class="brush: js;">
{
  "taskId": "2e58d2e3-868f-4d66-bae3-31eb73c4107d",
  "method": "sendNotification",
  "actorId": "ru.rr.monbaz.data.provider.deciders.IProvideDataProcess#1.0",
  "type": "DECIDER_ASYNCHRONOUS",
  "startTime":-1,
  "numberOfAttempts":1,
  "args": [
    {
      "dataType": "ru.rr.monbaz.data.provider.model.ExposeResult",
      "taskId": "442bfde9-6dd5-455e-adf5-20a4394b5a6b",
      "valueType": "PLAIN",
      "compositeValue": null,
      "promise": true,
      "errorContainer": null,
      "ready": true,
      "jsonvalue": {
        "files": [
          {"fileName":"readme.txt","link":"http://host/dmz/readme.txt","size":6},
          {"fileName":"readme-1.txt","link":"http://host/dmz/readme-1.txt","size":8},
          {"fileName":"readme-2.txt","link":"http://host/dmz/readme-2.txt","size":12}
        ],
        "exposeGuid":"b354c052-21ed-4a49-be4e-f13858b51915",
        "exposeDate":1396601657476
      }
    },
    {
      "dataType": "ru.rr.monbaz.data.provider.model.RequestVO",
      "taskId": null,
      "valueType": "PLAIN",
      "compositeValue": null,
      "promise": false,
      "errorContainer": null,
      "ready": true,
      "jsonvalue": {
        "id":181,
        "requestNum":"TSK-321",
        "price":"unknown",
        "declarant":"Some sort of string",
        "status":0,
        "email":"username@example.com",
        "nls":[
          "Item-1",
          "Item-2",
          "Item-3",
          "Item-4"
        ]
      }
    }
  ],
  "options": null,
  "processId": "09a4911e-acf9-4701-89ff-dd9ebfde3e46",
  "unsafe": false,
  "failTypes": null
}
</pre>


### 4. DecisionContainer
JSON description of the actor's task execution result. It could be some object (in the case of worker invocation),
a list of new actor's tasks (in the case of decider invocation) or both.

Fields:

- **taskId**: UUID string. Should match the unique identifier of the task this decision belongs to.
- **processId**: UUID string. Should match the unique identifier of the process containing
task this decision belongs to.
- **value**: *ArgContainer*. Represents the task actual return value;
- **errorContainer**: *ErrorContainer*(optional). Error stack if there are any.
- **restartTime**: number(optional). Time in milliseconds for task to be restarted. Value is set in the case
of execution error if such behaviour had been configured for the actor.
- **tasks**: *TaskContainer* array(optional). In the case or decider execution result could contain a list
of new created tasks.
- **actorId**: string(optional). Actor identity in the form of "actor_name#version".
- **executionTime**: number(optional). Time spent on the task execution, in milliseconds.


Example JSON (worker case):
<pre class="brush: js;">
{
  "taskId": "09dcc2a2-f5f8-46c4-a37f-5b05cd76b265",
  "processId": "85726c28-85ae-4978-8b29-1108c4b5c622",
  "value":
    {
      "dataType": "ru.rr.monbaz.data.provider.model.DataResponse",
      "taskId": null,
      "valueType": "PLAIN",
      "compositeValue": null,
      "promise": false,
      "errorContainer": null,
      "ready": true,
      "jsonvalue": {
        "requestId": "mnb-341",
        "data": [
          "file:/taskurotta/dataprovider/files/1.data",
          "file:/taskurotta/dataprovider/files/2.data",
          "file:/taskurotta/dataprovider/files/3.data",
          "file:/taskurotta/dataprovider/files/4.data"
        ]
      }
    },
  "errorContainer": null,
  "restartTime": -1,
  "tasks": null,
  "actorId": "ru.rr.monbaz.data.provider.workers.IDataProvider#1.0",
  "executionTime": 15000
}
</pre>

Example JSON (decider case):
<pre class="brush: js;">
{
  "taskId": "7c1e8619-0736-4c94-ad3f-999fccada3fc",
  "processId": "85726c28-85ae-4978-8b29-1108c4b5c622",
  "value": {
    "dataType": "java.lang.Object",
    "taskId": null,
    "valueType": null,
    "compositeValue": null,
    "promise": false,
    "errorContainer": null,
    "ready": true,
    "jsonvalue": null
  },
  "errorContainer": null,
  "restartTime": -1,
  "tasks": [
    {
      "taskId": "09dcc2a2-f5f8-46c4-a37f-5b05cd76b265",
      "method": "provideData",
      "actorId": "ru.rr.monbaz.data.provider.workers.IDataProvider#1.0",
      "type": "WORKER",
      "startTime": -1,
      "numberOfAttempts": 1,
      "args": [
        {
          "dataType": "ru.rr.monbaz.data.provider.model.DataRequest",
          "taskId": null,
          "valueType": "PLAIN",
          "compositeValue": null,
          "promise": false,
          "errorContainer": null,
          "ready": true,
          "jsonvalue": {
            "userId":"John Smith",
            "requestId":"MNB-341",
            "period":null,
            "format":null,
            "type":null,
            "nsl":[
              "Item-1",
              "Item-2",
              "Item-3",
              "Item-4"
            ]
          }
        }
      ],
      "options": null,
      "processId": "85726c28-85ae-4978-8b29-1108c4b5c622",
      "unsafe": false,
      "failTypes": null
    },
    {
      "taskId": "405c80f3-8f24-41a5-9a93-1b94a124d555",
      "method": "exposeFilesAndSendNotification",
      "actorId": "ru.rr.monbaz.data.provider.deciders.IProvideDataProcess#1.0",
      "type": "DECIDER_ASYNCHRONOUS",
      "startTime": -1,
      "numberOfAttempts": 1,
      "args": [
        {
          "dataType": null,
          "taskId": "09dcc2a2-f5f8-46c4-a37f-5b05cd76b265",
          "valueType": null,
          "compositeValue": null,
          "promise": true,
          "errorContainer": null,
          "ready": false,
          "jsonvalue": null
        },
        {
          "dataType": "ru.rr.monbaz.data.provider.model.RequestVO",
          "taskId": null,
          "valueType": "PLAIN",
          "compositeValue": null,
          "promise": false,
          "errorContainer": null,
          "ready": true,
          "jsonvalue": {
            "id":201,
            "requestNum": "TSK-341",
            "price": "unknown",
            "declarant": "Some string value",
            "status":0,
            "email": "user@example.com",
            "nls":[
              "Item-1",
              "Item-2",
              "Item-3",
              "Item-4"
            ]
          }
        }
      ],
      "options": null,
      "processId": "85726c28-85ae-4978-8b29-1108c4b5c622",
      "unsafe": false,
      "failTypes": null
    }
  ],
  "actorId": "ru.rr.monbaz.data.provider.deciders.IProvideDataProcess#1.0",
  "executionTime": 12
}
</pre>


### 5. ErrorContainer
JSON describing execution error. Used by a web console for displaying information on broken processes.
Standard workflow behaviour is to break and hold on actor execution error.

Fields:

- **classNames**: string array. Error cause type hierarchy.
- **message**: string. Human readable error message.
- **stackTrace**: string(optional). Error stack trace represented as a string.

Example JSON:
<pre class="brush: js;">
{
  "classNames": [
    "javax.xml.ws.WebServiceException",
    "java.lang.RuntimeException"
  ],
  "message": "Could not send Message.",
  "stackTrace": "javax.xml.ws.WebServiceException: Could not send Message.\n\tat org.apache.cxf.jaxws.JaxWsClientProxy.invoke(JaxWsClientProxy.java:146)\n\t... 10 more\nCaused by: java.net.UnknownHostException: example.com"
}
</pre>


### 6. TaskOptionsContainer
Additional policies and special configurations for the task that could be specified for a process's decider.

Fields:

- **argTypes** : enumerations array NONE|WAIT|NO_WAIT (optional). Specific argument types for a task.
  Array length must match the arguments number.
   NONE - usual argument,
   WAIT - argument is a list of *Promise* objects and every one of them must be initialized and have
   ready state before task execution begins (ensured by server before placing task to a queue).
   NO_WAIT - argument is a *Promise* and task could be started even if it have not been initialized yet.
- **actorSchedulingOptions** : *ActorSchedulingOptionsContainer* (optional). Configuration for task re-run.
- **promisesWaitFor**: *ArgContainer* array (optional). List of *Promise* arguments of some other tasks, which must be
executed (and their return values ready) before this task starts.

Example JSON (with only process custom ID specified):
<pre class="brush: js;">
{
  "argTypes": [
    "NONE",
    "WAIT",
    "NONE"
  ],
  "actorSchedulingOptions": {
      "customId": "mnb-415",
      "startTime":-1,
      "taskList": null
  },
  "promisesWaitFor": [
    {
      "dataType": "ru.rr.monbaz.data.provider.model.DataResponse",
      "taskId": "85726c28-85ae-4978-8b29-1108c4b5c633",
      "valueType": "PLAIN",
      "compositeValue": null,
      "promise": true,
      "errorContainer": null,
      "ready": false,
      "jsonvalue": null
    }
  ]
}
</pre>

### 7. ActorSchedulingOptionsContainer

Fields:

- **customId**: string (optional). Human readable process description, if provided.
- **startTime**: number (optional). Task re-run time in milliseconds.
- **taskList**: string (optional).  Contains task list identity this actor is bind to.

Example JSON:
<pre class="brush: js;">
{
  "customId": "p-567-an-ty-6z",
  "startTime": 1399874451935,
  "taskList": "server_8"
}
</pre>

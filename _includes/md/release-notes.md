## <div id="v0.4.0">v0.4.0</div>

- Added Garbage Collector service. It removes all objects associated with the completely finished processes after
configured period of time (<code>gc.time.before.delete property</code>, 1 day by default).
- Decider can mark actor method as unsafe through annotation <code>@AcceptFail</code>. It allows to get and
analyze Actor errors in Decider to change process flow as needed. Feature usage example is presented in ru.taskurotta.recipes.erroneous package.
- Added metrics for queues size. Improvement of queue page in management console.
- "Getting started" project created at GitHub as an enter point to the Taskurotta.
- Fixes: Memory leaks removed, 64md stress tests passed; <code>DelayIQueue</code> for Hazelcast are implemented. It
gives an ability to put queue items into the future. It uses mongodb as a temporary storage.


## <div id="v0.5.0">v0.5.0</div>

- Add: Support for broken processes: backend service and console web interface for processes interrupted due to actor error.
- Add: Full feature and full feature with monkey exceptions tests introduced.
- Add: Node configuration info on the console homepage
- Add: MongoDB metrics with output to logger
- Fix: fixed bug in Arbiter
- Fix: NullPointerException in replay process
- Fix: queue store's indexes lost on mongoDB failure
- Fix: NPE when get taskValue before check task is released
- Fix: fixed bug in RetryPolice maxRetry counter
- Fix: NPE during NoWait argument of task calculation
- Fix: OOM in FF stress test
- Fix: setting finish state to process on finish
- Ref: Recovery service replaced with improved implementation via Operation and OperationExecutor entities. Recovery service can be disabled now.
- Ref: Minor code cleanups and refactorings
- Ref: Dependency hierarchy cleaned up.
- Ref: client packages downgraded to java 1.6
- Ref: console views refactored and improved
- Ref: ActorThreadPool behaviour improved on server error processing
- Ref: Optimized null values queue drain
- Ref: Long.valueOf overhead removed from MapService; removed task options and fail types if empty; Memory usage of hazelcast maps; stress test with uniform load
- Ref: actor config simplifications: in case of only one config (runtime, spreader or policy) no need to specify it for actor. PolicyConfig and ProfilerConfig are not required.
## <div id="v0.4.0">v0.4.0</div>

- Added Garbage Collector service which removes data of completely finished processes. It removes all  objects
associated with process after configured period of time (<code>gc.time.before.delete property</code>). By default it is
 1 day.
- Decider can mark actor method as unsafe through annotation <code>@AcceptFail</code>. It allows to  get and to
analyze Actor errors  by Decider and change process flow as needed. ru.taskurotta.recipes.erroneous package has
example of feature usage.
- Added metrics for queues size. Improvement of queue page in management console.
- "Getting started" project are created at GitHub as a first point of enter to Taskurotta.
- Fixes: Memory leaks removed, 64md stress tests passed; <code>DelayIQueue</code> for Hazelcast are implemented. It
gives ability to put queue items into the future. It uses mongodb as a temporary storage.

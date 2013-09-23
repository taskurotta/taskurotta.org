# Profiler
Для оценки производительности приложения используются метрики от компании [Yammer](http://metrics.codahale.com/).
Для того, чтобы встроить метрики в приложение, можно использовать интерфейс Profiler, который декорирует обращения Координатора и Исполнителей за задачами и возврат решений этих задач.
Таким образом решается задача вычисления основных циклов работы приложения.
На текущий момент существуют две имплементации этого интерфейса ru.taskurotta.bootstrap.profiler.Profiler - это SimpleProfiler и MetricsProfiler.

## SimpleProfiler
Простейший профайлер, который на текущий момент не выполняет никакого профилирования, но в будущем, возможно, будет переработан для сбора общей статистики работы приложения.

## MetricsProfiler
Профайлер, считающий статистику по основным циклам приложения и позволяющий выводить её в лог, консоль или jmx.
Рассмотрим основные метрики, собираемые этим профайлером:

### Метрики
+ meterCycle - собирает статистику по полному циклу работы Актера от момента получения задачи из очереди задач до момента окончания разбора полученного решения;
+ trackExecute - считает время получения задачи из очереди;
+ trackCycle - считает время выполнения цикла с момента получения задачи из очереди до момента разбора полученного ответа;
+ trackPull - считает время, потраченное на получение задачи из очереди задач;
+ trackRelease - считает время, потраченное на анализ полученного решения;
+ trackError - считает время, потраченное на анализ ошибки во время выполнения задачи.

### Вывод метрик
+ logOutput - разрешает вывод всех собранных метрик в root лог приложения;
+ logOutputPeriod - задаёт период в секундах, за который будут выводиться метрики;
+ consoleOutput - разрешает вывод всех собранных метрик в консоль;
+ consoleOutputPeriod - задаёт период в секундах, за который будут выводиться метрики;

Кроме этого, все метрики доступны для просмотра через клиента jmx (например jconsole или jvisualvm, входящих в комплект поставки JDK).
Для того, чтобы получить к ним доступ, необходимо запустить приложение с ключами:

`-Dcom.sun.management.jmxremote.port=<нужный порт> -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false`

### Пример описания профайлера в файле настроек

    profiler:
      - MainProfilerConfig:
          class: ru.taskurotta.bootstrap.config.DefaultProfilerConfig
          instance:
            class: ru.taskurotta.bootstrap.profiler.MetricsProfiler
            properties:
              meterCycle: true
              trackExecute: true
              trackCycle: false
              trackPull: true
              trackRelease: true
              trackError: false
              logOutput: true
              logOutputPeriod: 10
              consoleOutput: false
              consoleOutputPeriod: 10

### Использование
Для того, чтобы включить профилирование у Актера, необходимо в его описание в файле настроек добавить строку profilerConfig: <имя профайлера>, например:

    actor:
      - PiDecider:
          actorInterface: ru.taskurotta.recipes.parallel.decider.PiDecider
          runtimeConfig: MainRuntimeConfig
          spreaderConfig: MainTaskSpreaderConfig
          profilerConfig: MainProfilerConfig
          count: 1
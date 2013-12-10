## <div id="d-schemes">Deployment schemes</div>

В Taskurotta предумотрено несоклько вариантов развертывания системы. Выбор конкретного зависит от назначения системы и предполагаемой нагрузки:

- поднятие окружения разработчика [Подробнее](#deployment_dev).
- развертывание сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard и хранилищем заданий и процессов в памяти [Подробнее](#deployment_memory).
- развертывание сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard и хранилищем заданий и процессов с использованием Hazelcast [Подробнее](#deployment_hz).
- развертывание сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard и хранилищем заданий и процессов с использованием Hazelcast и журналированием в MongoDB [Подробнее](#deployment_hz_mongo).
- развертывание сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard и хранилищем заданий с использованием Hazelcast и журналированием в MongoDB. В качестве хранилища процессов используется Oracle [Подробнее](#deployment_hz_mongo_ora).

## <div id="d-memory">All Together in Memory</div>

![Схема системы] (/install/img/deployment_dev.png)

Окружение разработчика предполагает запуск и клиента и сервера на одной машине в виде общего fat-jar.
В данном случае не используется никакой промежуточный транспорт и вся информация хранится в памяти.

### <div id="d-memory-config">Config</div>

Для создания проекта поднятия окружения разработчика необходимо в проект с реализацией воркеров добавить зависимость на модули
ru.taskurotta.spring и ru.taskurotta.core. Также необходима настройка сборки fat-jar. Основным отличием окружения разработки является
одновременное поднятие клиента и сервера в рамках одного jar. Из-за этого требуется специфичная конфигурация:

	runtime:
	  - MainRuntimeConfig:
		  class: ru.taskurotta.spring.configs.RuntimeConfigPathXmlApplicationContext
		  instance:
			context: ru/taskurotta/recipes/recursion/RuntimeBeans.xml

	spreader:
	  - MainTaskSpreaderConfig:
		  class: ru.taskurotta.spring.configs.SpreaderConfigPathXmlApplicationContext
		  instance:
			context: ru/taskurotta/recipes/recursion/SpreaderBeans.xml
			properties:
			  number: 4
			  count: 1

	profiler:
	  - MainProfilerConfig:
		  class: ru.taskurotta.bootstrap.config.DefaultProfilerConfig
		  instance:
			class: ru.taskurotta.test.flow.FlowArbiterProfiler

	actor:
	  - FibonacciDecider:
		  actorInterface: ru.taskurotta.recipes.recursion.decider.FibonacciDecider
		  runtimeConfig: MainRuntimeConfig
		  spreaderConfig: MainTaskSpreaderConfig
		  profilerConfig: MainProfilerConfig
		  count: 1

Особенности конфигурации:

- секция runtime - определяет настройки основного Spring runtime-контекста серверной части
- секция spreader - определяет настройки Spring runtime-контекста клиентской части (ответственна за запуск задач)
	- properties - дополнительные настройки для инициализации и запуска создателя заданий
- секция prfiler - настройки профилировщика TASKUROTTA
- секция actor - настройка актеров

Как видно из файла конфигурации в случае окружения разработчика имеются в наличии два контекста Spring. Для настройки актеров и провайдера
времени выполнения используется файл конфигурации RuntimeBeans.xml:

	<?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xsi:schemaLocation="
                http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

        <context:annotation-config/>

        <bean id="runtimeProvider" class="ru.taskurotta.RuntimeProviderManager" factory-method="getRuntimeProvider"/>

        <bean id="fibonacciDecider" class="ru.taskurotta.recipes.recursion.decider.FibonacciDeciderImpl">
            <property name="asynchronous">
                <bean class="ru.taskurotta.ProxyFactory" factory-method="getAsynchronousClient">
                    <constructor-arg value="ru.taskurotta.recipes.recursion.decider.FibonacciDeciderImpl" />
                </bean>
            </property>
        </bean>

        <bean id="arbiter" class="ru.taskurotta.test.flow.BasicFlowArbiter">
            <constructor-arg name="stages">
                <list>
                    <value>show</value>
                </list>
            </constructor-arg>
            <property name="strictFlowCheck" value="false" />
        </bean>

        <bean class="ru.taskurotta.test.flow.FlowArbiterFactory">
            <property name="instance" ref="arbiter" />
        </bean>
    </beans>

В данной конфигурации определяются реализации обработчиков, менеджер провайдера времени исполнения и задается арьитр для определения коректности завершения процесса.
Для конфигурирования создателя заданий в данном примере используется файл SpreaderBeans.xml:

	<?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xsi:schemaLocation="
                http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

        <context:property-placeholder/>

        <bean id="clientServiceManager" class="ru.taskurotta.client.memory.ClientServiceManagerMemory"/>

        <bean id="taskCreator" class="ru.taskurotta.recipes.recursion.TaskCreator" init-method="createStartTask">
            <property name="clientServiceManager" ref="clientServiceManager"/>
            <property name="count" value="${count}"/>
            <property name="number" value="${number}"/>
        </bean>

    </beans>

В данном контексте задается реализация создателя задач. И настраивается взаимодействие с серверной частью.

### <div id="d-memory-run">Run</div>

java -jar <JAR_DIR_PATH>/recipes-0.3.0-SNAPSHOT.jar -r <CONFIG_FILE_PATH>

- JAR_DIR_PATH - путь к каталогу, в котором размещается собранный JAR-файл сервера TASKUROTTA
- CONFIG_FILE_PATH - путь к файлу конфигурации.

## <div id="d-s-memory">Server in Memory</div>

![Схема системы] (/install/img/deployment_memroy.png)

Данная конфигурация предполагает установку сервера TASKUROTTA на отдельный хост. Для хранения информации о процессах и их заданиях используется собственная реализация хранилища в памяти. Взаимодействия
клиента с сервером организованно посредством RESTfull сервиса, реализованного с использованием Dropwizard. Для запуска сервера необходимо наличие JVM, установка дополнительного програмного обеспечения не требуется.
Вариант развертывания с хранением данных о процессах и заданиях в памяти не может использоваться в кластерном окружении, т.к. хранилище не предумастривает репликацию информации. При запуске сервера с
RESTfull транспортом для мониторинга доступна консоль по адресу http://&lt;HOST\_NAME&gt;:&lt;HTTP\_PORT&gt;/index.html.

### <div id="d-s-memory-req">Requirements</div>

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7

### <div id="d-s-memory-conf">Config</div>

	 #Location of Spring application context:
	 contextLocation: "classpath*:spring/memory.xml, classpath*:context/console-context.xml"

	 #Used for static resource serving in development mode
	 assets:
	   overrides:
		 /: ../../wf-dropwizard/src/main/resources/assets/

	 #Configuration of actors served by this server:
	 actorConfig:
	   actorPreferences:
		 - id: "default"

	 #Task server common properties (will be available as placeholders in spring context):
	 properties:
	   pollDelay: 10
	   pollDelayUnit: "SECONDS"
	   retryTimes: 10
	   recovery.schedule: "*/35 * * * * ?"
	   recovery.period: 2
	   recovery.period.unit: "DAYS"
	   recovery.timeStep: 1
	   recovery.timeStep.unit: "DAYS"

	 #Http server configuration:
	 logging:
		 level: INFO
		 loggers:
			 ru.taskurotta: INFO
			 com.yammer: INFO
		 file:
			 enabled: true
			 archive: true
			 currentLogFilename: ./target/logs/service.log
			 archivedLogFilenamePattern: ./target/logs/service-%d.log.gz
	 http:
		 rootPath: "/rest/*"
		 gzip:
			 enabled: false
		 requestLog:
			 file:
				 enabled: true
				 archive: true
				 currentLogFilename: ./target/logs/requests.log
				 archivedLogFilenamePattern: ./target/logs/service-%d.log.gz

Специфичные настройки конфигурации:

- assets - определяет в корневой каталог для статического сайта (консоль TASKUROTTA);
- http - секция настроек работы с HTTP протоколом для DropWizard;
	- rootPath - определяет корневой путь для RESTfull сервиса;
	- gzip - настройка сжатия ответов RESTfullсервиса;
		- enabled - включение/отключение сжатия;
    - requestLog - настройка логирования HTTP запросов;
    	- file - настройка логирования в файл;
    		- enabled - включение/отключение логирования в файл;
    		- archive - влючение/выключение сохранения логов за прошлый период и их сжатия;
            - currentLogFilename - путь к текущему файлу лога;
            - archivedLogFilenamePattern - паттерн для архивов файла логирования.


### <div id="d-s-memory-run">Run</div>

	java -Dcom.sun.management.jmxremote.port=<JMX_PPORT> -Dcom.sun.management.jmxremote.authenticate=false
		-Dcom.sun.management.jmxremote.ssl=false -DassetsMode=dev
		-Dts.node.custom.name=<NODE_NAME> -Ddw.http.port=<HTTP_PORT>
	 	-Ddw.http.adminPort=<ADMIN_PORT> -Ddw.logging.file.currentLogFilename="<LOG_FILE_PATH>"
	 	-jar <JAR_DIR_PATH>/assemble-0.3.0-SNAPSHOT.jar server <CONFIG_FILE_PATH>

- JMX_PPORT - порт для подключения JMX-консоли для мониторинга состояния и производительности сервера
- NODE_NAME - имя ноды для текущего сервера (актуально для кластерных решений)
- HTTP_PORT - порт, который будет использоваться для взаимодействия по протоколу HTTP
- ADMIN_PORT -  порт, на котором поднимается интерфейс администрирования и мониторинга DropWizard
- JAR_DIR_PATH - путь к каталогу, в котором размещается собранный JAR-файл сервера TASKUROTTA
- CONFIG_FILE_PATH - путь к файлу конфигурации.


## <div id="d-s-hz">Server with Hazelcast</div>

![Схема системы] (/install/img/deployment_hz.png)

Этот вариант является дальнейшим развитием [варианта развертывания с хранением информаци в памяти](#deployment_memory). Собственная реализация хранилища заменена на использование
Hazelcast 3. Это позволяет организовывать кластерное окружение из нескольких серверов TASKUROTTA (см. далее). Также как и в предыдущем способе развертывания
для старта сервера необходимо наличие JVM, другое программное обеспечение не требуется.

### <div id="d-s-hz-req">Requirements</div>

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7

### <div id="d-s-hz-conf">Config</div>

	#Location of Spring application context:
	#Hazelcast without mongo mapstore
	contextLocation: "classpath*:spring/hz.xml, classpath*:context/console-context.xml"

	#Used for static resource serving in development mode
	assets:
	  overrides:
		/: ../../dropwizard/src/main/resources/assets/

	#Configuration of actors served by this server:
	actorConfig:
	  actorPreferences:
		- id: "default"

	#Task server common properties (will be available as placeholders in spring context):
	properties:
	  pollDelay: 10
	  pollDelayUnit: "SECONDS"
	  hz.mancenter.enabled: false
	  hz.mancenter.url: "http://localhost:8080/mancenter-2.6"
	  hz.nodes: localhost:7777
	  recovery.schedule: "*/35 * * * * ?"
      recovery.period: 2
      recovery.period.unit: "DAYS"
      recovery.timeStep: 1
      recovery.timeStep.unit: "DAYS"


	#Http server configuration:
	logging:
		level: WARN
		loggers:
			com.hazelcast: INFO
			ru.taskurotta: INFO
			com.yammer: INFO
		file:
			enabled: true
			archive: true
			currentLogFilename: ./target/logs/service.log
			archivedLogFilenamePattern: ./target/logs/service-%d.log.gz
			logFormat: "%-4r %d [%t] %-5p %c - %m%n"

	http:
		rootPath: "/rest/*"
		gzip:
			enabled: false
		requestLog:
			file:
				enabled: false
				archive: true
				currentLogFilename: ./target/logs/requests.log
				archivedLogFilenamePattern: ./target/logs/requests-%d.log.gz

Специфичные настройки конфигурации:

- hz.mancenter.enabled - включение/отключение центра управления Hazelcast для управления кластером.
- hz.mancenter.url - URL, по которому располагается центр управления
- hz.nodes - список нод кластера Hazelcast и их портов

### <div id="d-s-hz-run">Run</div>

	java -Dcom.sun.management.jmxremote.port=<JMX_PPORT> -Dcom.sun.management.jmxremote.authenticate=false
		-Dcom.sun.management.jmxremote.ssl=false -DassetsMode=dev
		-Dts.node.custom.name=<NODE_NAME> -Ddw.http.port=<HTTP_PORT>
	 	-Ddw.http.adminPort=<ADMIN_PORT> -Ddw.logging.file.currentLogFilename="<LOG_FILE_PATH>"
	 	-jar <JAR_DIR_PATH>/assemble-0.3.0-SNAPSHOT.jar server <CONFIG_FILE_PATH>

- JMX_PPORT - порт для подключения JMX-консоли для мониторинга состояния и производительности сервера
- NODE_NAME - имя ноды для текущего сервера (актуально для кластерных решений)
- HTTP_PORT - порт, который будет использоваться для взаимодействия по протоколу HTTP
- ADMIN_PORT -  порт, на котором поднимается интерфейс администрирования и мониторинга DropWizard
- JAR_DIR_PATH - путь к каталогу, в котором размещается собранный JAR-файл сервера TASKUROTTA
- CONFIG_FILE_PATH - путь к файлу конфигурации.


## <div id="d-s-hzm">Server with Hazelcast and MongoDB</div>

![Схема системы] (/install/img/deployment_hz_mongo.png)

В [паредыдущем варианте развертывания](#deployment_hz) было рассмотрена конфигурация с хранилищем на основе Hazelcast. Она позволяет организовывать кластерные решения,
но при этом  имеет ряд недостатков. Во-первых, размер хранилища определяется объемом оперативной памяти. Во-вторых, при непредвиденном отключение сервера его состояние
никак не сохраняется, что может привести к потере запущенных процессов изаданий. Поэтому для систем с большим количеством процессов и высокой стоимостью потери процессов
рекомендуется использовать вариант развертывания с дополнительным журналированиемна основе MongoDB. В этом случае вся информация о процесссах и их задачах дополнительно
записывается в MongoDB и сохраняется на жестком диске. MongoDB может стоять как на отдельном хосте, так и на одном хосте с сервером TASKUROTTA.

### <div id="d-s-hzm-req">Requirements</div>

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7
5. MongoDb 2.4

### <div id="d-s-hzm-conf">Config</div>

	#Location of Spring application context:
	#Hazelcast without mongo mapstore
	contextLocation: "classpath*:spring/hz-mongo.xml, classpath*:context/console-context.xml"

	#Used for static resource serving in development mode
	assets:
	  overrides:
		/: ../../dropwizard/src/main/resources/assets/

	#Configuration of actors served by this server:
	actorConfig:
	  actorPreferences:
		- id: "default"

	#Task server common properties (will be available as placeholders in spring context):
	properties:
	  pollDelay: 10
	  pollDelayUnit: "SECONDS"
	  hz.mancenter.enabled: false
	  hz.mancenter.url: "http://localhost:8080/mancenter-2.6"
	  hz.nodes: localhost:7777
	  mongo.host: localhost
	  mongo.port: 27017

	#Http server configuration:
	logging:
		level: WARN
		loggers:
			com.hazelcast: INFO
			ru.taskurotta: INFO
			com.yammer: INFO
		file:
			enabled: true
			archive: true
			currentLogFilename: ./target/logs/service.log
			archivedLogFilenamePattern: ./target/logs/service-%d.log.gz
			logFormat: "%-4r %d [%t] %-5p %c - %m%n"

	http:
		rootPath: "/rest/*"
		gzip:
			enabled: false
		requestLog:
			file:
				enabled: false
				archive: true
				currentLogFilename: ./target/logs/requests.log
				archivedLogFilenamePattern: ./target/logs/requests-%d.log.gz

Специфичные настройки конфигурации:
- mongo.host - имя хоста на котором заупщена MongoDB
- mongo.port - номер порта MongoDB

### <div id="d-s-hzm-run">Run</div>

	java -Dcom.sun.management.jmxremote.port=<JMX_PPORT> -Dcom.sun.management.jmxremote.authenticate=false
		-Dcom.sun.management.jmxremote.ssl=false -DassetsMode=dev
		-Dts.node.custom.name=<NODE_NAME> -Ddw.http.port=<HTTP_PORT>
	 	-Ddw.http.adminPort=<ADMIN_PORT> -Ddw.logging.file.currentLogFilename="<LOG_FILE_PATH>"
	 	-jar <JAR_DIR_PATH>/assemble-0.3.0-SNAPSHOT.jar server <CONFIG_FILE_PATH>

- JMX_PPORT - порт для подключения JMX-консоли для мониторинга состояния и производительности сервера
- NODE_NAME - имя ноды для текущего сервера (актуально для кластерных решений)
- HTTP_PORT - порт, который будет использоваться для взаимодействия по протоколу HTTP
- ADMIN_PORT -  порт, на котором поднимается интерфейс администрирования и мониторинга DropWizard
- JAR_DIR_PATH - путь к каталогу, в котором размещается собранный JAR-файл сервера TASKUROTTA
- CONFIG_FILE_PATH - путь к файлу конфигурации.

## <div id="d-s-hzmo">Server with Hazelcast, MongoDB and Oracle</div>

![Схема системы] (/install/img/deployment_hz_mongo_oracle.png)

Днаая схема развертывания является дальнейшим продолжением повышения надежности [системы с использованием Hazelcast](#deployment_hz). В данном случае для хранения информации о процессах используется
СУБД Oracle 11g, а вся остальная информация хранится в Hazelcast + MongoDB ([см. предыдущую конфигурацию](#deployment_hz_mongo)). Использование Oracle позволяет повысить надежность фиксации статусов процессов,
т.к. в отличии от MongoDB данная СУБД поддерживает транзакционность и журналирование.

### <div id="d-s-hzmo-req">Requirements</div>

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7
5. MongoDb 2.4
6. Oracle 11g
7. Объем дискового пространства для Oracle 10GB+

### <div id="d-s-hzmo-assemble">Assemble</div>

При сборке инструментом Maven нужно обязательно указывать профиль oracle-env.

    mvn -P oracle-env install

### <div id="d-s-hzmo-config">Config</div>

	#Location of Spring application context:
	#Hazelcast without mongo mapstore
	contextLocation: "classpath*:spring/hz-ora-mongo.xml, classpath*:context/console-context.xml, classpath*:spring/hz-ora-schedule.xml"

	#Used for static resource serving in development mode
	assets:
	  overrides:
		/: ../dropwizard/src/main/resources/assets/

	#Configuration of actors served by this server:
	actorConfig:
	  actorPreferences:
		- id: "default"

	#Task server common properties (will be available as placeholders in spring context):
	properties:
	  pollDelay: 10
	  pollDelayUnit: "SECONDS"
	  hz.mancenter.enabled: true
	  hz.mancenter.url: "http://localhost:8080/mancenter-3.0.2"
	  hz.nodes: localhost:7777 #, localhost:7778
	  mongo.host: localhost
	  mongo.port: 27017
	  recovery.startup.run: false
	  hz.queue.restore: true
	  recovery.process.cron: "0 0 0/8 * * ?"
	  oradb.url: "jdbc:oracle:thin:@ora_server:1521:TASKUROTTA"
	  oradb.user: "taskurotta"
	  oradb.password: "taskurotta"

	#Http server configuration:
	logging:
		level: WARN
		loggers:
			com.hazelcast: INFO
			ru.taskurotta: INFO
			com.yammer: INFO
		file:
			enabled: true
			archive: true
			currentLogFilename: ./target/logs/service.log
			archivedLogFilenamePattern: ./target/logs/service-%d.log.gz
			logFormat: "%-4r %d [%t] %-5p %c - %m%n"

	http:
		rootPath: "/rest/*"
		gzip:
			enabled: false
		requestLog:
			file:
				enabled: false
				archive: true
				currentLogFilename: ./target/logs/requests.log
				archivedLogFilenamePattern: ./target/logs/requests-%d.log.gz

Специфичные настройки конфигурации:

- oradb.url - строка подключения по JDBC к Oracle
- oradb.user - имя пользователя для подключения к Oracle
- oradb.password - пароль для подключения к Oracle

### <div id="d-s-hzmo-run">Run</div>

	java -Dcom.sun.management.jmxremote.port=<JMX_PPORT> -Dcom.sun.management.jmxremote.authenticate=false
		-Dcom.sun.management.jmxremote.ssl=false -DassetsMode=dev
		-Dts.node.custom.name=<NODE_NAME> -Ddw.http.port=<HTTP_PORT>
	 	-Ddw.http.adminPort=<ADMIN_PORT> -Ddw.logging.file.currentLogFilename="<LOG_FILE_PATH>"
	 	-jar <JAR_DIR_PATH>/assemble-0.3.0-SNAPSHOT.jar server <CONFIG_FILE_PATH>

- JMX_PPORT - порт для подключения JMX-консоли для мониторинга состояния и производительности сервера
- NODE_NAME - имя ноды для текущего сервера (актуально для кластерных решений)
- HTTP_PORT - порт, который будет использоваться для взаимодействия по протоколу HTTP
- ADMIN_PORT -  порт, на котором поднимается интерфейс администрирования и мониторинга DropWizard
- JAR_DIR_PATH - путь к каталогу, в котором размещается собранный JAR-файл сервера TASKUROTTA
- CONFIG_FILE_PATH - путь к файлу конфигурации.

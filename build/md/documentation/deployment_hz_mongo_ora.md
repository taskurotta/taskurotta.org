####Вариант развертывания сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard, хранением процессов в Oracle и хранилием заданий с использованием Hazelcast и журналированием в MongoDB.

![Схема системы] (md/documentation/img/deployment_hz_mongo_oracle.png)

Днаая схема развертывания является дальнейшим продолжением повышения надежности [системы с использованием Hazelcast](#deployment_hz). В данном случае для хранения информации о процессах используется
СУБД Oracle 11g, а вся остальная информация хранится в Hazelcast + MongoDB ([см. предыдущую конфигурацию](#deployment_hz_mongo)). Использование Oracle позволяет повысить надежность фиксации статусов процессов,
т.к. в отличии от MongoDB данная СУБД поддерживает транзакционность и журналирование.

#####Требования:

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7
5. MongoDb 2.4
6. Oracle 11g
7. Объем дискового пространства для Oracle 10GB+

#####Сборка

При сборке инструментом Maven нужно обязательно указывать профиль oracle-env.

######Пример
    mvn -P oracle-env install

#####Пример файла конфигурации

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

#####Команда запуска сервера
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


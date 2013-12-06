####Вариант развертывания сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard и хранилищем заданий и процессов с использованием Hazelcast

![Схема системы] (md/documentation/img/deployment_hz.png)

Этот вариант является дальнейшим развитием [варианта развертывания с хранением информаци в памяти](#deployment_memory). Собственная реализация хранилища заменена на использование
Hazelcast 3. Это позволяет организовывать кластерное окружение из нескольких серверов TASKUROTTA (см. далее). Также как и в предыдущем способе развертывания
для старта сервера необходимо наличие JVM, другое программное обеспечение не требуется.

#####Требования:

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7

#####Пример файла конфигурации

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
####Вариант развертывания сервера TASKUROTTA с RESTfull-транспортом на основе Dropwizard и хранилищем заданий и процессов в памяти

![Схема системы] (md/documentation/img/deployment_memroy.png)

Данная конфигурация предполагает установку сервера TASKUROTTA на отдельный хост. Для хранения информации о процессах и их заданиях используется собственная реализация хранилища в памяти. Взаимодействия
клиента с сервером организованно посредством RESTfull сервиса, реализованного с использованием Dropwizard. Для запуска сервера необходимо наличие JVM, установка дополнительного програмного обеспечения не требуется.
Вариант развертывания с хранением данных о процессах и заданиях в памяти не может использоваться в кластерном окружении, т.к. хранилище не предумастривает репликацию информации. При запуске сервера с
RESTfull транспортом для мониторинга доступна консоль по адресу http://&lt;HOST\_NAME&gt;:&lt;HTTP\_PORT&gt;/index.html.

#####Требования:

1. CPU 1-2 MGz
2. RAM 512-1024 Mb
3. HDD 1Gb+
4. JVM 1.7

#####Пример файла конфигурации

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
			 ru.taskurotta: DEBUG
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
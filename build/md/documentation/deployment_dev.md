####Окружение разработчика

![Схема системы] (md/documentation/img/deployment_dev.png)

Окружение разработчика предполагает запуск и клиента и сервера на одной машине в виде общего fat-jar.
В данном случае не используется никакой промежуточный транспорт и вся информация хранится в памяти.

##### Конфигурирование проекта

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

##### Запуск окружения разработчика

java -jar <JAR_DIR_PATH>/recipes-0.3.0-SNAPSHOT.jar -r <CONFIG_FILE_PATH>

- JAR_DIR_PATH - путь к каталогу, в котором размещается собранный JAR-файл сервера TASKUROTTA
- CONFIG_FILE_PATH - путь к файлу конфигурации.

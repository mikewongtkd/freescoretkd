.PHONY: all cache rest ui
DB=/usr/local/freescore/data

all: grassroots worldclass

start:
	@echo Starting FreeScore servers for testing
	sudo hypnotoad /usr/local/freescore/bin/worldclass
	sudo hypnotoad /usr/local/freescore/bin/grassroots

stop:
	@echo Stopping FreeScore servers for testing
	ps -ef | grep -vi vim | grep 'worldclass' | grep -v grep | awk 'BEGIN { pid = 0; } { if( pid == 0 || $$2 < pid ) { pid = $$2; }} END { print pid; }' | xargs sudo kill
	ps -ef | grep -vi vim | grep 'grassroots' | grep -v grep | awk 'BEGIN { pid = 0; } { if( pid == 0 || $$2 < pid ) { pid = $$2; }} END { print pid; }' | xargs sudo kill

restart: stop start
	

grassroots: cache test-config grassroots-unit-test grassroots-rest-test restore-config

grassroots-rest:  start cache test-config grassroots-rest-test  restore-config stop
grassroots-unit:        cache test-config grassroots-unit-test  restore-config
grassroots-ui:    start cache test-config grassroots-ui-test    restore-config stop
grassroots-tb-ui:       cache test-config grassroots-tb-ui-test restore-config

grassroots-rest-test:
	./smoke/forms/grassroots/rest-api.t

grassroots-unit-test:
	./smoke/forms/grassroots/division-api.t

grassroots-ui-test:
	./ui/forms/grassroots/judges

grassroots-tb-ui-test:
	./ui/forms/grassroots/tiebreaker
	
	
worldclass: cache test-config worldclass-unit-test worldclass-rest-test restore-config

worldclass-rest:   start cache test-config worldclass-rest-test restore-config stop
worldclass-unit:         cache test-config worldclass-unit-test restore-config
worldclass-ui:     start cache test-config worldclass-ui-5-test restore-config
worldclass-ui-all: start cache test-config worldclass-ui-5-test worldclass-ui-3-test worldclass-ui-7-test restore-config

worldclass-rest-test:
	./smoke/forms/worldclass/rest-api.t

worldclass-unit-test:
	./smoke/forms/worldclass/division-api.t

worldclass-ui-3-test:
	./ui/forms/worldclass/model-view/3-judges

worldclass-ui-5-test:
	./ui/forms/worldclass/autopilot/5-judges

worldclass-ui-7-test:
	./ui/forms/worldclass/model-view/7-judges

test-config:
	test=$$(grep -c 'FreeScore Test' ../../frontend/html/include/php/config.php); \
	if [ $$test -eq 0 ]; then \
		cp ../../frontend/html/include/php/config.php config.bak; \
		cp include/php/config.php ../../frontend/html/include/php/config.php; \
	fi

restore-config:
	test=$$(grep -c 'FreeScore Test' ../../frontend/html/include/php/config.php); \
	if [ $$test -eq 1 ] && [ -e "config.bak" ]; then \
		cp config.bak ../../frontend/html/include/php/config.php; \
	fi

cache:
	mkdir -p $(DB)/test
	find $(DB)/test -type f -name \*.txt -exec rm -f {} \;
	cp -Rf data/* $(DB)/test
	find $(DB)/test -type f -exec chmod a+w {} \;
	find $(DB)/test -type d -exec chmod a+w {} \;

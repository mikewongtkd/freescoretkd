.PHONY: all cache rest ui

all: grassroots worldclass

grassroots: cache test-config grassroots-unit-test grassroots-rest-test restore-config

grassroots-rest:  cache test-config grassroots-rest-test  restore-config
grassroots-unit:  cache test-config grassroots-unit-test  restore-config
grassroots-ui:    cache test-config grassroots-ui-test    restore-config
grassroots-tb-ui: cache test-config grassroots-tb-ui-test restore-config

grassroots-rest-test:
	./smoke/forms/grassroots/rest-api.t

grassroots-unit-test:
	./smoke/forms/grassroots/division-api.t

grassroots-ui-test:
	./ui/forms/grassroots/judges

grassroots-tb-ui-test:
	./ui/forms/grassroots/tiebreaker
	
	
worldclass: cache test-config worldclass-unit-test worldclass-rest-test restore-config

worldclass-rest: cache test-config worldclass-rest-test restore-config
worldclass-unit: cache test-config worldclass-unit-test restore-config
worldclass-ui:   cache test-config worldclass-ui-test   restore-config

worldclass-rest-test:
	./smoke/forms/worldclass/rest-api.t

worldclass-unit-test:
	./smoke/forms/worldclass/division-api.t

worldclass-ui-test:
	./ui/forms/worldclass/judges

test-config:
	test=$$(grep -c 'FreeScore Test' ../../frontend/html/include/php/config.php); \
	if [ $$test -eq 0 ]; then \
		cp ../../frontend/html/include/php/config.php config.bak; \
		cp include/config.php ../../frontend/html/include/php/config.php; \
	fi

restore-config:
	test=$$(grep -c 'FreeScore Test' ../../frontend/html/include/php/config.php); \
	if [ $$test -eq 1 ]; then \
		cp config.bak ../../frontend/html/include/php/config.php; \
	fi

cache:
	mkdir -p /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -name \*.txt -exec rm -f {} \;
	cp -Rf data/* /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -exec chmod a+w {} \;
	find /Volumes/ramdisk/test -type d -exec chmod a+w {} \;

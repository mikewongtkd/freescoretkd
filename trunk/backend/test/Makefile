.PHONY: all cache rest ui

all:

grassroots-rest: cache
	./smoke/forms/grassroots/rest-api.t

worldclass-rest: cache
	./smoke/forms/worldclass/rest-api.t

worldclass-unit: cache
	./smoke/forms/worldclass/division-api.t

worldclass-ui: cache
	cp data/forms-worldclass/ring01/div.p02.txt /Volumes/ramdisk/tma-2014-fall/forms-worldclass/ring01/div.p12.txt
	./ui/forms/worldclass/judges

cache:
	mkdir -p /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -name \*.txt -exec rm -f {} \;
	cp -Rf data/* /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -exec chmod a+w {} \;
	find /Volumes/ramdisk/test -type d -exec chmod a+w {} \;

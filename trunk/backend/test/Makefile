.PHONY: all cache rest ui

all: unit rest

rest: cache
	./smoke/forms/worldclass/rest-api.t

unit: cache
	./smoke/forms/worldclass/division-api.t

cache:
	mkdir -p /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -name \*.txt -exec rm -f {} \;
	cp -Rf data/* /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -exec chmod a+w {} \;
	find /Volumes/ramdisk/test -type d -exec chmod a+w {} \;

ui:
	./ui/forms/worldclass/judges

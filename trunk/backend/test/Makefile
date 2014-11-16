.PHONY: all cache test

all: cache test

test: 
	./smoke/forms/worldclass/rest-api.t

cache:
	mkdir -p /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -name \*.txt -exec rm -f {} \;
	cp -Rf data/* /Volumes/ramdisk/test
	find /Volumes/ramdisk/test -type f -exec chmod a+w {} \;
	find /Volumes/ramdisk/test -type d -exec chmod a+w {} \;

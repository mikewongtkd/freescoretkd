CACHE=/Volumes/ramdisk

ifndef TOURNAMENT
$(error TOURNAMENT is not set)
endif

.PHONY: all test

cache:
	if [ ! -e $(CACHE) ] ; \
	then \
		ramdisk 128 MB ; \
	fi
	cp -Rf data/$(TOURNAMENT) /Volumes/ramdisk
	for i in forms-grassroots forms-worldclass; do \
		touch $(CACHE)/$(TOURNAMENT)/$$i/progress.txt; \
	done
	chmod -R a+w $(CACHE)/$(TOURNAMENT)
	
clean:
	umount $(CACHE)

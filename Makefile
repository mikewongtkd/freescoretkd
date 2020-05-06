.PHONY: all clean

all:
	mkdir -p docker/context
	git clone git@github.com:mikewongtkd/freescoretkd.git docker/context
	docker build --no-cache -t freescore -f docker/Dockerfile docker/context

clean:
	rm -rf docker/context

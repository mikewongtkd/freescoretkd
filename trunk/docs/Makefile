.PHONY: all clean frontend backend

all: frontend backend

frontend:
	jsdoc -c jsdoc-conf.json

backend:
	doxygen

clean:
	rm -rf backend/* 
	rm -rf frontend/* 

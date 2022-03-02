.PHONY: all build run clean

all: clean build run

build:
	docker build -f Dockerfile -t freescore:4.5 .

run:
	docker run -p 8073:80 -p 3088:3088 -p 3089:3089 -p 3080:3080 -p 3085:3085 -p 3082:3082 --name freescore-local -v `pwd`/../trunk/backend:/usr/local/freescore -v `pwd`/../trunk/frontend/html:/var/www/html -v `pwd`/../trunk/frontend/cgi-bin:/var/www/cgi-bin freescore:4.5

stop:
	docker stop freescore-local

clean:
	docker image rm freescore:4.5

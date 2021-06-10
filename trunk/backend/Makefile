.PHONY: all setup worldclass para grassroots freestyle sparring

all: all-start

all-start: setup-start grassroots-start worldclass-start para-start freestyle-start sparring-start

worldclass-start:
	sudo hypnotoad -f ./bin/worldclass &

para-start:
	sudo hypnotoad -f ./bin/para &

grassroots-start:
	sudo hypnotoad -f ./bin/grassroots &

freestyle-start:
	sudo hypnotoad -f ./bin/freestyle &

sparring-start:
	sudo hypnotoad -f ./bin/sparring &

setup-start:
	sudo hypnotoad -f ./bin/fswifi &

worldclass-stop:
	pkill -f 'hypnotoad -f ./bin/worldclass'

para-stop:
	pkill -f 'hypnotoad -f ./bin/para'

grassroots-stop:
	pkill -f 'hypnotoad -f ./bin/grassroots'

freestyle-stop:
	pkill -f 'hypnotoad -f ./bin/freestyle'

sparring-stop:
	pkill -f 'hypnotoad -f ./bin/sparring'

setup-stop:
	pkill -f 'hypnotoad -f ./bin/fswifi'

all-stop: setup-stop grassroots-stop worldclass-stop para-stop freestyle-stop sparring-stop

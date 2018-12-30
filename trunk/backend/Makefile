.PHONY: all setup worldclass grassroots freestyle

all: all-start

all-start: setup-start grassroots-start worldclass-start freestyle-start sparring-start

worldclass-start:
	sudo hypnotoad -f ./bin/worldclass &

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

grassroots-stop:
	pkill -f 'hypnotoad -f ./bin/grassroots'

freestyle-stop:
	pkill -f 'hypnotoad -f ./bin/freestyle'

sparring-stop:
	pkill -f 'hypnotoad -f ./bin/sparring'

setup-stop:
	pkill -f 'hypnotoad -f ./bin/setup'

all-stop: setup-stop grassroots-stop worldclass-stop freestyle-stop sparring-stop

.PHONY: all setup worldclass grassroots freestyle

all: all-start

all-start: setup-start grassroots-start worldclass-start freestyle-start sparring-start breaking-start

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

breaking-start:
	sudo hypnotoad -f ./bin/breaking &

worldclass-stop:
	sudo pkill -f 'hypnotoad -f ./bin/worldclass'

grassroots-stop:
	sudo pkill -f 'hypnotoad -f ./bin/grassroots'

freestyle-stop:
	sudo pkill -f 'hypnotoad -f ./bin/freestyle'

sparring-stop:
	sudo pkill -f 'hypnotoad -f ./bin/sparring'

setup-stop:
	sudo pkill -f 'hypnotoad -f ./bin/fswifi'

breaking-stop:
	sudo pkill -f 'hypnotoad -f ./bin/breaking'

all-stop: setup-stop grassroots-stop worldclass-stop freestyle-stop sparring-stop breaking-start

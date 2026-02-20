.PHONY: all setup worldclass para grassroots freestyle sparring

all: all-start

dep-list:
	grep -hire '^use' lib bin | awk '{ print $$2; }' | sed 's/;$$//' | sed 's/()$$//' | grep -v '^FreeScore' | grep -ve base -ve lib -ve strict | sort | uniq

all-start: setup-start grassroots-start worldclass-start freestyle-start sparring-start breaking-start

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

breaking-start:
	sudo hypnotoad -f ./bin/breaking &

worldclass-stop:
	sudo pkill -f 'hypnotoad -f ./bin/worldclass'

para-stop:
	pkill -f 'hypnotoad -f ./bin/para'

grassroots-stop:
	sudo pkill -f 'hypnotoad -f ./bin/grassroots'

freestyle-stop:
	sudo pkill -f 'hypnotoad -f ./bin/freestyle'

sparring-stop:
	sudo pkill -f 'hypnotoad -f ./bin/sparring'

setup-stop:
	sudo pkill -f 'hypnotoad -f ./bin/fswifi'

start: all-start

stop: all-stop

breaking-stop:
	sudo pkill -f 'hypnotoad -f ./bin/breaking'

all-stop: setup-stop grassroots-stop worldclass-stop freestyle-stop sparring-stop breaking-stop

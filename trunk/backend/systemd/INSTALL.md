# Installing FreeScore Services on System D

Copy all `*.service` files to `/etc/systemd/system`

	sudo su -
	cp *.service /etc/systemd/system

Enable each service, one-at-a-time

	systemctl enable worldclass
	systemctl enable grassroots
	systemctl enable freestyle
	systemctl enable vsparring

Start each service

	systemctl start worldclass
	systemctl start grassroots
	systemctl start freestyle
	systemctl start vsparring

Verify the services are running

	systemctl status worldclass
	systemctl status grassroots
	systemctl status freestyle
	systemctl status vsparring


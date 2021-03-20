# Installing FreeScore Services on System D

Copy all `*.service` files to `/etc/systemd/system`

	sudo su -
	cp *.service /etc/systemd/system

Enable each service, one-at-a-time

	systemctl enable worldclass


Start each service

	systemctl start worldclass

Verify the services are running

	systemctl status worldclass


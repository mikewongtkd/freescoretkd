all: install

install:
	@echo Installs WiFi Access Point/DNSMasq configuration files and RESTful Poomsae services
	cp etc/dnsmasq.conf /etc/dnsmasq.conf
	cp etc/init.d/worldclass /etc/init.d/worldclass
	cp etc/init.d/grassroots /etc/init.d/grassroots
	cp etc/init.d/freestyle /etc/init.d/freestyle
	cp etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf
	mkdir -p /var/run/freescore
	mkdir -p /var/log/freescore
	cd /etc/init.d && \
	for i in 2 3 5; do \
		if [ ! -e /etc/rc$$i.d/S05worldclass ]; then ln -s ../init.d/worldclass ../rc$$i.d/S05worldclass; fi; \
		if [ ! -e /etc/rc$$i.d/S05grassroots ]; then ln -s ../init.d/grassroots ../rc$$i.d/S05grassroots; fi; \
		if [ ! -e /etc/rc$$i.d/S05freestyle  ]; then ln -s ../init.d/freestyle  ../rc$$i.d/S05freestyle;  fi; \
	done && \
	for i in 0 1 6; do \
		if [ ! -e /etc/rc$$i.d/K05worldclass ]; then ln -s ../init.d/worldclass ../rc$$i.d/K05worldclass; fi; \
		if [ ! -e /etc/rc$$i.d/K05grassroots ]; then ln -s ../init.d/grassroots ../rc$$i.d/K05grassroots; fi; \
		if [ ! -e /etc/rc$$i.d/K05freestyle  ]; then ln -s ../init.d/freestyle  ../rc$$i.d/K05freestyle;  fi; \
	done;

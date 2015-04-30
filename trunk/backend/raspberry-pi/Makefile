all:
	@echo Installs WiFi Access Point/DNSMasq configuration files and RESTful Poomsae services

install:
	@echo Installing
	cp etc/dnsmasq.conf /etc/dnsmasq.conf
	cp etc/init.d/worldclass /etc/init.d/worldclass
	cp etc/init.d/grassroots /etc/init.d/grassroots
	cp etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf
	cd /etc/init.d && \
	for i in 2 3 5; do \
		if [ ! -e /etc/rc$$i.d/S05worldclass ]; then ln -s ../init.d/worldclass ../rc$$i.d/S05worldclass; fi; \
		if [ ! -e /etc/rc$$i.d/S05grassroots ]; then ln -s ../init.d/grassroots ../rc$$i.d/S05grassroots; fi; \
	done && \
	for i in 0 1 6; do \
		if [ ! -e /etc/rc$$i.d/K05worldclass ]; then ln -s ../init.d/worldclass ../rc$$i.d/K05worldclass; fi; \
		if [ ! -e /etc/rc$$i.d/K05grassroots ]; then ln -s ../init.d/grassroots ../rc$$i.d/K05grassroots; fi; \
	done;

all:
	@echo Installs WiFi Access Point/DNSMasq configuration files and RESTful Poomsae services

install:
	@echo Installing
	cp etc/dnsmasq.conf /etc/dnsmasq.conf
	cp etc/init.d/worldclass /etc/init.d/worldclass
	cp etc/init.d/grassroots /etc/init.d/grassroots
	cp etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf
	for i in 3 5; do \
		if [ ! -e /etc/rc$$i.d/S05worldclass ]; then ln -s /etc/init.d/worldclass /etc/rc$$i.d/S05worldclass; fi; \
		if [ ! -e /etc/rc$$i.d/S05grassroots ]; then ln -s /etc/init.d/grassroots /etc/rc$$i.d/S05grassroots; fi; \
	done;

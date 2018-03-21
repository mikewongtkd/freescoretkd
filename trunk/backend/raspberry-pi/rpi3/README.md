# Raspberry Pi 3

2017 August 24

The following instructions are a guide to create a FreeScoreWifi unit using Raspberry Pi 3 using the latest installation of Raspbian `2017-08-16-raspbian-stretch`

### Upgrade to the latest version of Raspbian

	sudo su -
	apt-get update
	apt-get upgrade
	
## Developer Tools and Network Services

	apt-get install -y vim-gnome git-all hostapd dnsmasq


## Apache and PHP 5

FreeScore requires a webserver and PHP 5 interpreter. They can be installed by issuing the following command:

	apt-get install -y apache2 php7.0
	a2enmod cgi
	systemctl restart apache2	
	
## Perl

This will install all the Perl libraries and the GD graphics library dependency.

	apt-get install -y cpanminus libgd-gd2-perl
	cpanm \
		YAML \
		Test::Tester \
		Test::NoWarnings \
		Test::Deep \
		Test::Warn \
		CGI \
		CGI::Carp \
		Data::Structure::Util \
		Date::Calc \
		Digest::SHA1 \
		Filesys::Notify::Simple \
		GD::Barcode \
		JSON::XS \
		List::MoreUtils \
		LWP::UserAgent \
		Mojolicious \
		Time::HiRes \
		Try::Tiny \
		Clone \
		EV	
		
## FreeScore Services

This will install the FreeScore web services to be configured to start on boot.

	sudo su -
	cd ~pi/freescore
	cp ../rpi2/etc/init.d/* /etc/init.d
	update-rc.d worldclass defaults 97 03
	update-rc.d freestyle defaults 97 03
	update-rc.d grassroots defaults 97 03
	update-rc.d fswifi defaults 97 03

	
## FreeScore CGI


### Update CGI Configuration Settings 
	cd /etc/apache2/
	sudo gvim conf-available/serve-cgi-bin.conf

This will bring up the editor. 

Change:

	ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/ 
	<Directory "/usr/lib/cgi-bin">
		AllowOverride None
		Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch

To:

	ScriptAlias /cgi-bin/ /var/www/cgi-bin/ 
	<Directory "/var/www/cgi-bin">
		AllowOverride None
		Options +ExecCGI -MultiViews +FollowSymLinks
		
Quit the Editor by typing `<escape>-wq` or going to `File > Save-Exit`


### Update Current Server to use CGI settings
Uncomment the line to `Include` the server settings we just updated.

	sudo gvim sites-enabled/000-default.conf

This will bring up the editor. 

Change:

	#Include conf-available/serve-cgi-bin.conf

To: 

	Include conf-available/serve-cgi-bin.conf
	
Quit the Editor by typing `<escape>-wq` or going to `File > Save-Exit`

### Link the CGI Directory to the FreeScore CGI Directory

	sudo mkdir /var/www/cgi-bin
	cd /var/www/cgi-bin
	sudo ln -s ~pi/freescore/trunk/frontend/cgi-bin freescore
	
### Turn Everything On

	sudo systemctl daemon-reload
	sudo systemctl start apache2

## Network Configurations

There are multiple network choices that you can use with FreeScore to get the best communication at different venues.

### 2.4 GHz

The simplest choice is a simple USB wifi dongle with 2.4 GHz 802.11 protocol. The advantages of this configuration are portability, value, and ease-of-setup. Three channels (1, 6, and 11) present no overlap; if the competing signals in these channels can be overpowered, then communication should be fairly clear and responsive.

**Recommended Hardware**

- Detroit DIY Electronics Wifi with Antenna for Raspberry Pi

**Software**

- `hostapd` service to configure the Raspberry Pi as an access point
- `dnsmasq` service to configure the Raspberry Pi as a DNS and DHCP router

### External 2.4/5.0 GHz Router

Using a separate dual band powered router might allow for even better communication reliability, however this requires reconfiguring the Raspberry Pi to **not** be configured as an access point; that is, **disable** `hostapd`. Instead, the Pi can be configured simply as a DHCP, DNS, and web server.

**Disabling hostapd**

	sudo su -
	systemctl stop hostapd
	systemctl disable hostapd
	
**Configuring Raspberry Pi for Static IP on eth0**

Edit `/etc/dnsmasq.conf`. Change the interface line

	interface=wlan0
	dhcp-range=192.168.88.100,192.168.88.200,255.255.255.0,120h
	dhcp-option=option:router,192.168.88.1
	server=192.168.88.1
	server=8.8.8.8
	
To

	interface=eth0
	...

Leave the `dhcp-range` and other options alone.

**Configuring the Router**

Please read the manufacturer's instructions on how to configure the wifi router as an access point. Use the SSID `freescore` and constrain the DHCP range to match that in the `/etc/dnsmasq.conf` as shown above.
	
**Suggested Hardware**

- TP-Link AC1200 Dual Band Wifi Router

### 2.4/5.0 GHz

Sometimes a venue has a lot of competing access points attempting to service the 2.4 GHz channel, causing a lot of interference. The 5.0 GHz band has a number of channels, each of which do *not* overlap, allowing for more channels at the cost of shorter range and reduced ability to communicate out of line-of-sight. For the purposes of FreeScore, line-of-sight and short range can safely be assumed. 

#### Panda Wireless PAU09 N600 Dual Band

**Problem:** Cannot configure `hostapd` to use 5.0 GHz channels on Raspberry Pi.




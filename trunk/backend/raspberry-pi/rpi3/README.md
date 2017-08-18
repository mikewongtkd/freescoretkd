# Raspberry Pi 3

The following instructions are a guide to create a FreeScoreWifi unit using Raspberry Pi 3.

## FreeScore WiFi Access Point

Unfortunately as of Sept. 2016, the included `hostapd` (v2.3) does not seem to work properly. Building `hostapd` 2.5 or later from source remedies this problem.

You can download the `hostapd` source tarball from https://w1.fi/hostapd

### Dependencies

The following dependencies Netlink library and SSL library (`libnl` and `libssl`) must be installed prior to building from source.

	sudo apt-get install -y libnl-dev libssl-dev
	
### Build and Installation

The following commands will accept the default configuration, build, and install `hostapd` under `/usr/local/bin/hostapd`.

	tar -xvzf hostapd-2.6.tar.gz
	cd hostapd-2.6
	cp defconfig .config
	make
	sudo make install
	
### Integration into System V Services

You must edit `/etc/init.d/hostapd` to call `/usr/local/bin/hostapd` instead of `/usr/sbin/hostapd`. You must also edit `/etc/default/hostapd` to point to `/etc/hostapd/hostapd.conf`. A properly configured `hostapd.conf` file is included in this repository under `./etc/hostapd/hostapd.conf`

## Apache and PHP 5

FreeScore requires a webserver and PHP 5 interpreter. They can be installed by issuing the following command:

	sudo su -
	apt-get install -y apache2 php5
	a2enmod cgi
	apachectl -M
	service apache2 restart	
	
## Perl

This will install all the Perl libraries and the GD graphics library dependency.

	sudo su -
	apt-get install cpanminus libgd-gd2-perl
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

	cp ../rpi2/etc/init.d/* /etc/init.d
	sudo update-rc.d worldclass defaults 97 03
	sudo update-rc.d freestyle defaults 97 03
	sudo update-rc.d grassroots defaults 97 03
	sudo update-rc.d fswifi defaults 97 03

	
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

	sudo a2enmod cgi
	sudo systemctl daemon-reload
	sudo systemctl start apache2



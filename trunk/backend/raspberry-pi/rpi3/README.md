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

	sudo systemctl daemon-reload
	sudo systemctl start apache2



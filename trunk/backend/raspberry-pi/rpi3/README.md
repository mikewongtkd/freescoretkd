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

	sudo su -
	apt-get install cpanminus
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
		GD \
		GD::Barcode \
		JSON::XS \
		List::MoreUtils \
		LWP::UserAgent \
		Mojolicious \
		Time::HiRes \
		Try::Tiny


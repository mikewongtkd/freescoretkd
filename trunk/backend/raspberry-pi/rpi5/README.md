# Raspberry Pi 5

2025 October 3

The following instructions are a guide to create a FreeScoreWifi unit using Raspberry Pi 5 using the latest installation of Raspberry Pi OS (formerly known as Raspbian)

**Raspberry Pi OS**
- 2025-09-09 Debian 12 (bookworm)

### Upgrade to the latest version of Raspberry Pi OS

	sudo su -
	apt-get update
	
## Developer Tools and Network Services

	apt-get install -y vim-gtk3 dnsmasq ifupdown openssh-server
    systemctl enable ssh
    systemctl start ssh

## Apache and PHP 5

FreeScore requires a webserver and PHP 5 interpreter. They can be installed by issuing the following command:

	apt-get install -y apache2 php
	a2enmod cgi
	a2enmod cgid
	systemctl restart apache2	

Also confirm that `conf-enabled/serve-cgi-bin.conf` is configured correctly (especially that the CGI directory has a trailing slash `/`.

## Clone the FreeScore Repository

To get the latest code for FreeScore, clone from the GitHub repository and checkout the current active branch `se-rand-draw`

    git clone https://github.com/mikewongtkd/freescoretkd.git freescore
    git checkout se-rand-draw
    chmod a+rx /home
    chmod a+rx freescore

### GitHub Access For Authorized Developers

    mkdir ~/.ssh

Copy the authorized developer's key `<authdevkey>` to `~/.ssh` and add the key to
your SSH identity for full git repository access.

    chmod 0400 ~/.ssh/<authdevkey>
    eval `ssh-agent -s`
    ssh-add -D
    ssh-add ~/.ssh/<authdevkey>
	
## Perl

This will install all the Perl libraries and the GD graphics library dependency.

	apt-get install -y cpanminus libgd-gd2-perl
	cpanm \
		CGI \
		CGI::Carp \
		Carp \
		Clone \
		Data::Structure::Util \
		Date::Calc \
		Date::Manip \
		Digest::SHA1 \
		EV \
		Filesys::Notify::Simple \
		GD::Barcode \
		JSON::XS \
		List::MoreUtils \
		LWP::UserAgent \
		Math::Round \
		Math::Utils \
		Mojolicious \
		Mojo::IOLoop::Delay \
        PHP:Session \
		Scalar::Util \
        Statistics::Descriptive \
		Test::Tester \
		Test::NoWarnings \
		Test::Deep \
		Test::Warn \
		Time::HiRes \
		Try::Tiny \
		YAML
		
## FreeScore Services

This will install the FreeScore web services to be configured to start on boot.

	sudo su -
	cd ~pi/freescore/trunk/backend
	cp rpi2/etc/init.d/* /etc/init.d
	update-rc.d worldclass defaults 97 03
	update-rc.d freestyle defaults 97 03
	update-rc.d grassroots defaults 97 03
	update-rc.d breaking defaults 97 03
	update-rc.d fswifi defaults 97 03
    sudo mkdir /var/log/freescore
	
## FreeScore CGI

Some of the simple reporting in FreeScore still uses the Common Gateway Interface (CGI).

### Update CGI Configuration Settings 
	cd /etc/apache2/
	sudo gvim conf-enabled/serve-cgi-bin.conf

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

### Link the CGI Directory to the FreeScore CGI Directory

	sudo mkdir /var/www/cgi-bin
	cd /var/www/cgi-bin
	sudo ln -s ~pi/freescore/trunk/frontend/cgi-bin freescore
	
### Install FreeScore Directories Using Links

	sudo su -
	mv /var/www/html /var/www/html.orig
	ln -s ~pi/freescore/trunk/frontend/html /var/www/html
	ln -s ~pi/freescore/trunk/backend /usr/local/freescore
	
### Assign Name IP Address to FreeScore.net

	sudo hostname freescore.net

**/etc/hosts**

Add the following line to the end of the file

	192.168.88.1	freescore.net
	
This associates the IP address `192.168.88.1` with `freescore.net`. Later we'll configure the network to use `192.168.88.1` as its IP address.
	
### Turn Everything On

	sudo systemctl daemon-reload
	sudo systemctl start apache2

## Network Configurations

There are multiple network choices that you can use with FreeScore to get the best communication at different venues. The two main configurations are with a **USB Wifi Adapter** and with a separate **Wifi Access Point**. 

| Configure|  Wifi Access Point |
| --- | --- |
| Network Services | `dnsmasq` |
| Network Hardware | `eth0` |

### External 2.4/5.0 GHz Router

Using a separate dual band powered router allows for even better communication reliability and requires the Pi to be configured simply as a DHCP, DNS, and web server.

**Switching Network from WiFi to Ethernet**

Since the access point will handle most network tasks, we'll need the ethernet port to go from DHCP to static IP. 

Edit `/etc/network/interfaces.d/eth0`:

Comment out the DHCP-on-boot for `eth0`

	# auto eth0
	# iface eth0 inet dhcp
	
Add (or uncomment) the static IP for `eth0`

	auto eth0
	iface eth0 inet static
		address 192.168.88.1
		gateway 192.168.88.1
		netmask 255.255.255.0
		network 192.168.88.0
		broadcast 192.168.88.255

We'll also need the Pi to serve proper DNS
	
Edit `/etc/dnsmasq.conf`

	interface=eth0
	listen-address=192.168.88.1
    # dhcp-range=192.168.88.100,192.168.88.200
    # dhcp-option=option:router,192.168.88.1
    # dhcp-option=option:dns-server,192.168.88.1
    # dhcp-authoritative

    address=/freescore.net/192.168.88.1
    address=/#/0.0.0.0

**Switching back to Update Mode**

If you want to use the internet, you'll need to switch `eth0` back to DHCP. To do so, comment-out the static IP lines above, and uncomment the DHCP-on-boot lines in `/etc/network/interfaces.d/eth0` and uncomment the DHCP commands in `/etc/dnsmasq.conf`.

**Configuring the Access Point**

Please read the manufacturer's instructions on how to configure the wifi access point. Use the SSID `freescore` and constrain the DHCP range to match that in the `/etc/dnsmasq.conf` as shown above. Disable the guest network, if the router provides a guest network.

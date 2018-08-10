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
		Math::Round \
		Math::Utils \
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

Some of the simple reporting in FreeScore still uses the Common Gateway Interface (CGI).

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
	
### Assign IP Address to FreeScore.net

**/etc/hosts**

Add the following line to the end of the file

	192.168.88.1	freescore.net
	
This associates the IP address `192.168.88.1` with `freescore.net`. Later we'll configure the network to use `192.168.88.1` as its IP address.
	
### Turn Everything On

	sudo systemctl daemon-reload
	sudo systemctl start apache2

## Network Configurations

There are multiple network choices that you can use with FreeScore to get the best communication at different venues. The two main configurations are with a **USB Wifi Adapter** and with a separate **Wifi Access Point**. 

| Configure| USB Wifi Adapter | Wifi Access Point |
| --- | --- | --- |
| Network Services | `hostapd` and `dnsmasq` | `dnsmasq` alone |
| Network Hardware | `wlan0` or `wlan1` | `eth0` |


### USB Wifi Adapter 2.4 GHz

The simplest choice is a simple USB wifi adapter with 2.4 GHz 802.11 protocol. The advantages of this configuration are portability, value, and ease-of-setup. Three channels (1, 6, and 11) present no overlap; if the competing signals in these channels can be overpowered, then communication should be fairly clear and responsive.

**Recommended Hardware**

- Detroit DIY Electronics Wifi with Antenna for Raspberry Pi

**Network Services**

- `hostapd` service to configure the Raspberry Pi as an access point
- `dnsmasq` service to configure the Raspberry Pi as a DNS and DHCP router

 
	sudo su -
	systemctl enable hostapd
	systemctl enable dnsmasq


**/etc/hostapd/hostapd.conf**

Depending on your model of the Raspberry Pi, the interface may be different. I do not recommend the RPi3 on-board wifi adapter as an access point, but if the wifi traffic in your area is very low, it might work, which will save you $15 from not having to buy a USB wifi adapter.

| Interface | Raspberry Pi 2 | Raspberry Pi 3 |
| --- | --- | --- |
| `wlan0` | USB Wifi Adapter | On-board Wifi Adapter |
| `wlan1` | N/A | USB Wifi Adapter |

	interface=wlan0
	driver=nl80211
	ctrl_interface=/var/run/hostapd
	ctrl_interface_group=0
	ssid=freescore
	hw_mode=g
	channel=6
	
	wpa=2
	wpa_passphrase=********
	wpa_key_mgmt=WPA-PSK
	wpa_pairwise=CCMP
	rsn_pairwise=CCMP
	beacon_int=100
	auth_algs=3
	wmm_enabled=1

### External 2.4/5.0 GHz Router

Using a separate dual band powered router might allow for even better communication reliability, however this requires reconfiguring the Raspberry Pi to **not** be configured as an access point; that is, **disable** `hostapd`. Instead, the Pi can be configured simply as a DHCP, DNS, and web server.

**Disabling hostapd**

	sudo su -
	systemctl stop hostapd
	systemctl disable hostapd
	
We'll still need DNSMasq to handle *domain name server* lookups.

**Switching Network from WiFi to Ethernet**

Since the TP Link access point will handle most network tasks, we'll need the ethernet port to go from DHCP to static IP. 

Edit `/etc/network/interfaces`:

Comment out the DHCP-on-boot for `eth0`

	# iface eth0 inet dhcp
	
Add (or uncomment) the static IP for `eth0`

	iface eth0 inet static
		address 192.168.88.1
		gateway 192.168.88.1
		netmask 255.255.255.0
		network 192.168.88.0
		broadcast 192.168.88.255
		
Enforce DHCP Client service to use a static IP

	interface eth0
	static ip_address=192.168.88.1
	static domain_name_servers=192.168.88.1
		
**Configuring the Router**

Please read the manufacturer's instructions on how to configure the wifi router as an access point. Use the SSID `freescore` and constrain the DHCP range to match that in the `/etc/dnsmasq.conf` as shown above. Disable the guest network, if the router provides a guest network.
	
**Suggested Hardware**

- TP-Link AC1200 Dual Band Wifi Router

The router acts as a bridge between a local network (LAN) and the internet (WAN). Each side of the bridge needs to be configured for the router to work. 

We will use the LAN side only, since the TP-Link won't be connected to the internet. However, the TP-Link firmware still requires that we configure the WAN as well; we place this on the 192.168.1.0 subnet.

#### WAN

| Setting | Value |
| --- | --- |
| Internet Connection Type | Static IP |
| IP Address | 192.168.1.10 |
| Subnet Mask | 255.255.255.0 |
| Default Gateway | 192.168.1.1 |
| Primary DNS | 192.168.1.1 |
| Secondary DNS | 8.8.8.8 |

#### LAN

| Setting | Value |
| --- | --- |
| IP Address | 192.168.88.10 |
| Subnet Mask | 255.255.255.0 |

#### LAN DHCP

| Setting | Value |
| --- | --- |
| Enable DHCP | Checked / DHCP Server |
| IP Address Pool | 192.168.88.100 - 192.168.88.199 |
| Address Lease Time | 1200 |
| Default Gateway | 192.168.88.1 |
| Default Domain | [Blank] |
| Primary DNS | 192.168.88.1 |
| Secondary DNS | 0.0.0.0 |

The *Default Gateway* and *Primary DNS* are critical settings here; this delegates network access and domain name resolution to the Raspberry Pi. The Raspberry Pi 

#### Guest Network

| Setting | Value |
| --- | --- |
| Allow Guests to See Each Other | Disable |

### 2.4/5.0 GHz

Sometimes a venue has a lot of competing access points attempting to service the 2.4 GHz channel, causing a lot of interference. The 5.0 GHz band has a number of channels, each of which do *not* overlap, allowing for more channels at the cost of shorter range and reduced ability to communicate out of line-of-sight. For the purposes of FreeScore, line-of-sight and short range can safely be assumed. 

#### Panda Wireless PAU09 N600 Dual Band

The 2.4GHz configuration above works for the Panda PAU09 N600 out-of-the-box, with no additional configuration. Configuring `hostapd` for 5GHz can be done by editing `/etc/hostapd/hostapd.conf` as follows:

	interface=wlan0
	driver=nl80211
	country_code=US
	ctrl_interface=/var/run/hostapd
	ctrl_interface_group=0
	ssid=freescore
	hw_mode=a
	channel=44
	ieee80211d=1
	
	wpa=3
	wpa_passphrase=********
	wpa_key_mgmt=WPA-PSK
	rsn_pairwise=CCMP
	beacon_int=100
	auth_algs=1
	wmm_enabled=1
	eap_reauth_period=360000000
	
Other supported channels include: 36, 40, 44, and 48. Channels 52, 56, 60, and 64 are evidently unsupported by the Ubuntu drivers and/or the Panda PAU09 N600 wifi adapter.
	

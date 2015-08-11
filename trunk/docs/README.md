# FreeScore

## User Documentation

This document highlights the core concepts behind the FreeScore Taekwondo tournament software and its current implementation.

### Laptops and Tablets

FreeScore is designed for physical portability; laptops and tablets. It achieves this by using software technology with relatively low computational overhead that can be run on limited hardware. Any system that can run Apache can be used as a server; any system that can run the latest version of Chrome can be used as a terminal or tablet interface for judges.

#### Front-end Architecture

The front-end architecture is currently Apache2/PHP using and Mojolicious/CGI. As of late 2014, there doesn't seem to be any SSL-ready implementation of WebSockets (and network may be too intermittent for WebSockets anyway). So the architecture uses the following technologies:

- Apache
- PHP
- Perl
  - CGI
    - Test::Warn
    - Test::Deep
      - Test::NoWarnings
      - Test::Tester
        - YAML
  - Data::Structure::Util
  - Date::Calc;
  - Filesys::Notify::Simple
  - GD::Barcode
    - GD
  - JSON::XS
  - List::MoreUtils
  - List::Util
  - LWP::UserAgent
  - Mojolicious
  - Text::CSV
  - Time::HiRes
  - Try::Tiny
- Server Sent Events (SSE)
- AJAX

This allows immediate implementation of the following technologies

- SSL/TLS for security
- mod_perl for application speed **or**
- NGINX front-end server and server proxy with Mojolicious application server

##### Application Design

Applications are grouped together by events (e.g. Grass Roots Poomsae, World Class Poomsae, Device Registration). Each application is one custom jQuery widget comprised of multiple jQuery widgets. 

###### Top-down Application Communication

The top-level widget retrieves division data from the server using the HTML 5 javascript object `EventSource`; the server responds using SSE. Currently the SSE is powered by CGI/Perl; it previously was using a PHP page. In the future, moving completely to Mojolicious may give better performance.

Each subwidget then receives a subset of the division data; just enough for the subwidget to do its job. 

The preference is to have the back-end do the heavy lifting of calculations to reduce client-side effort. This means that UI updates are handled client-side, wheras system information (judge voting, scoring, etc.) must be transmitted via AJAX and the underlying objects updated and re-broadcasted via SSE.

#### Apache Configuration
On OS X Mavericks, the following lines of `/etc/apache2/httpd.conf` need to be modified.

    LoadModule cgi_module libexec/apache2/mod_cgi.so
    ...
    <Directory "/">
        Options FollowSymLinks
        AllowOverride none
        Require all denied
    </Directory>
    ...
    <Directory "/Library/WebServer/CGI-Executables">
        Options Includes FollowSymLinks ExecCGI
        AllowOverride None
        Order allow,deny
        Allow from all
        Require all granted
    </Directory>

The `LoadModule` line is commented-out and must be uncommented to enable CGI.

The first `Directory` directive must be modified to allow symbolic links. The second `Directory` directive must be modified to allow execution of CGI and to follow symbolic links

#### Back-end Architecture

Plain text files with a ramdisk cache. This could be improved by using a filesystem with triggers on write, or some form of `fswatch`. 

#### Software Engineering

##### Documentation

We use the following toolchain for documentation:

- MoU for simple documentation using Markdown
- JSDoc for JavaScript documentation
  - Node.js (JSDoc dependency)
- Perl POD for Perl module documentation

## World Class Poomsae Scoring System

The header should store current state and initial non-athlete setup information for the division.

### Round participation

Situations:

- A large division can be split across two rings for the preliminary round
  - All athletes participate in the preliminary round
  - The top half from each ring are then merged into a semi-finals round
  
  
#### Tablet Configuration

##### Samsung Galaxy 4
Disable sleep.

    Settings > Apps > Development > Stay Awake
    Settings > Device > Display > Screen timeout

Enable Chrome Max Memory Allocation

1. Launch Chrome
2. Go to "chrome://flags/#max-tiles-for-interest-area"
3. Select 512
4. Restart Chrome

##### Apple iPad
Disable sleep.

    Settings > General > Autolock > Never
    
## Raspberry Pi

A stand-alone FreeScore system can be installed on to a Raspberry Pi. As
of May 2015, I recommend the Raspberry Pi 2 Model B, 900 MHz ARM v7 1GB RAM
(~$40), along with an RT5370 chipset USB wifi adapter with antenna (~$15).

### Current prototype

username: pi
password: freescore

### On first SSH
    
1. raspi-config
2. Install Development Tools
3. Install apache/PHP
4. Install ramdisk
5. Install perl modules
6. Install FreeScore

#### Installing Development Tools 

    sudo su -
    apt-get install vim subversion -y

#### Installing Web Tools

    sudo su -
    aptitude update
    apt-get install apache2 php5 -y

#### Set up the Database
At the terminal, type the following:

    sudo su -
    mkdir -p /Volumes
    ln -s divisions /Volumes/ramdisk
    chmod -R a+w divisions
    vim /etc/fstab

#### Install Perl Modules

	cpan
    cpan> o conf prerequisites_policy 'follow'
    cpan> o conf build_requires_install_policy yes
    cpan> o conf commit
    cpan> install YAML Test::Tester Test::NoWarnings Test::Deep Test::Warn
    cpan> install CGI CGI::Carp Data::Structure::Util Date::Calc Filesys::Notify::Simple
    cpan> install GD GD::Barcode JSON::XS Mojolicious Time::HiRes Try::Tiny

#### Get a Subversion Clone of FreeScore

    svn co https://github.com/mikewongtkd/freescoretkd/trunk freescore

#### Make Raspberry Pi a Wifi Access Point

    apt-get install hostapd dnsmasq -y

Set `/etc/hosts`

    192.168.88.1	freescore.net www.freescore.net

Edit `/etc/network/interfaces`. Comment out lines following 
`allow-hotplug wlan0` and insert the following

    iface wlan0 inet static
    address 192.168.88.1
    netmask 255.255.255.0

Edit `/etc/default/ifplugd`

    INTERFACES="eth0"
    HOTPLUG_INTERFACES="eth0"
    ARGS="-q -f -u0 -d10 -w -I"
    SUSPEND_ACTION="stop"

Edit `/etc/default/hostapd`; provide the below value for `DAEMON_CONF`.

    DAEMON_CONF="/etc/hostapd/hostapd.conf"

Edit `/etc/hostapd/hostapd.conf`

    interface=wlan0
    driver=nl80211
    ctrl_interface=/var/run/hostapd
    ctrl_interface_group=0

    ssid=freescore
    hw_mode=g
    channel=8
    wpa=2
    wpa_passphrase=3mfj1XAF
    wpa_key_mgmt=WPA-PSK
    wpa_pairwise=CCMP
    rsn_pairwise=CCMP
    beacon_int=100
    auth_algs=3
    wmm_enabled=1

Test with `hostapd /etc/hostapd/hostapd.conf`

edit `/etc/dnsmasq.conf`

#### Install Samba and NetAtalk (AppleTalk)

    apt-get install samba samba-common-bin netatalk
    smbpasswd -a pi

#### Change hostname

Edit `/etc/hosts`

    127.0.1.1 raspberrypi -> 127.0.1.1. freescore

Edit `/etc/hostname`

    raspberrypi -> freescore

#### Update Web Server

edit Apache Configuration; allow FollowSymLinks

#### Clone SD Card Image to File

    dd if=<SD card location> of=<Desired SD image file location> bs=1m

Using `rdisk` is faster, rather than any mounted volume i.e.

    dd if=/dev/rdisk<xyz> of=<path>/freescore.sd.image

You can identify the device number using `diskutil list`

#### Copy Image File to SD Card

Use `diskutil` to identify the SD card device number

    diskutil list
    diskutil unmount '/Volumes/<device name>'
    dd bs=1m if=<path>/freescore.sd.image of=/dev/rdisk<xyz>

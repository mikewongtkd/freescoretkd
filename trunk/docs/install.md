# FreeScore Administrator Guide

This document assists technology-savvy administrators to install, operate, and troubleshoot the FreeScore Taekwondo tournament software. It is a work in progress.

## Installation

### Pre-install instructions for Mac:

    ln -s /Library/WebServer/Documents       /var/www/html
    ln -s /Library/WebServer/CGI-Executables /var/www/cgi-bin

### Installation instructions
Create symbolic links for the following:

    ln -s ~/freescoretkd/trunk/frontend/html     /var/www/html/freescore
    ln -s ~/freescoretkd/trunk/frontend/cgi-bin  /var/www/cgi-bin/freescore
    ln -s ~/freescoretkd/trunk/backend           /usr/local/freescore

### Database setup

FreeScore uses simple text files for divisions and directories for rings and
staging. Tournament configuration is controlled by editing the PHP file
`config.php` under `trunk/frontend/html/include/php/config.php`. The default
database location is `/usr/local/freescore/data/test`. Examples of a starter
database can be found in `trunk/backend/test/data`. 

Division names follow the pattern `div.pNNL.txt` where N is a number from 0-9
and L is an optional letter. Ring names follow the pattern `ringNN` where N
is a number from 0-9. There is a special ring `staging` where divisions that
are not yet ready for ring assignment can be stored. To assign a division to
a ring, simply move the division text file to the appropriate ring directory.

For example:

	cd /usr/local/freescore/data/test/forms-worldclass
    mv staging/div.p01.txt ring01

If you don't have a directory `/usr/local/freescore/data/test` the first step
for database installation is to create this directory. I recommend copying the
example files from the `trunk/backend/test/data` directory, renaming and
editing the files as needed. 

The division file format is simply some header information (e.g. division
description, number of judges, etc.) and a list of athlete names. 

Be careful when editing divisions; currently the division parser is quite
persnickity on reading input and does not provide helpful error messages.
After copying, editing, and renaming a division file, reload the display
page (register a device as a display). If the page shows up, then it's likely
the parser had no problems.  If the display shows an error message, then
delete the last added file and try again.

### Laptops and Tablets

FreeScore is designed for physical portability; laptops and tablets. It
achieves this by using software technology with relatively low computational
overhead that can be run on limited hardware. Any system that can run Apache
can be used as a server; any system that can run the latest version of Chrome
can be used as a terminal or tablet interface for judges.

#### Front-end Architecture

The front-end architecture is currently Apache2/PHP with Bootstrap. So the
architecture uses the following technologies:

##### Application Design

Applications are grouped together by events (e.g. Grass Roots Poomsae, World
Class Poomsae, Device Registration). Each application is one custom jQuery
widget comprised of multiple jQuery widgets. 

###### Top-down Application Communication

The top-level widget retrieves division data from the server using the HTML 5
javascript object `EventSource`; the server responds using SSE. Currently the
SSE is powered by CGI/Perl; it previously was using a PHP page. In the future,
moving completely to Mojolicious may give better performance.

Each subwidget then receives a subset of the division data; just enough for the
subwidget to do its job. 

The preference is to have the back-end do the heavy lifting of calculations to
reduce client-side effort. This means that UI updates are handled client-side,
wheras system information (judge voting, scoring, etc.) must be transmitted via
AJAX and the underlying objects updated and re-broadcasted via SSE.

#### Apache Configuration
On OS X Mavericks, the following lines of `/etc/apache2/httpd.conf` need to be
modified.

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

The first `Directory` directive must be modified to allow symbolic links. The
second `Directory` directive must be modified to allow execution of CGI and to
follow symbolic links

#### Application Logic Architecture

The application logic architecture is Mojolicious web services using Perl.

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
  - Date::Calc
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
  - Clone
  - EV
- Server Sent Events (SSE)
- AJAX

#### Back-end Architecture

Plain text files, moving towards JSON files, and likely to end with NoSQL
with UNQLite.

#### Software Engineering

##### Documentation

We use the following toolchain for documentation:

- JSDoc for JavaScript documentation
  - Node.js (JSDoc dependency)
- Perl POD for Perl module documentation

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
(~$40), along with an RT5370 chipset USB wifi adapter with antenna (~$15). I have another build using the Raspberry Pi 3 in the prototyping phase and will release build instructions on that soon.

### Raspberry Pi 2 SSH Login

username: `pi`

password: `freescore`

### Simple Installation Instructions

    sudo su -
    apt-get install vim git-all -y
    svn co https://github.com/mikewongtkd/freescoretkd/trunk freescore
    cd freescore/backend/raspberry-pi/rpi2
    ./configure
    make
    
## Detailed Build Instructions

If the above simple instructions don't work, try the following.

### On First Login
    
1. raspi-config
2. Install Development Tools
3. Install apache/PHP
4. Install ramdisk
5. Install perl modules
6. Install FreeScore

#### Installing Development Tools 

    sudo su -
    apt-get install vim git-all -y

#### Installing Web Tools

    sudo su -
    aptitude update
    apt-get install apache2 php5 -y

#### Set up the Database
At the terminal, type the following:

    sudo su -
    chmod -R a+w /usr/local/freescore/data

#### Install Perl Modules

	cpan
    cpan> o conf prerequisites_policy 'follow'
    cpan> o conf build_requires_install_policy yes
    cpan> o conf commit
    cpan> install YAML Test::Tester Test::NoWarnings Test::Deep Test::Warn
    cpan> install CGI CGI::Carp Data::Structure::Util Date::Calc Filesys::Notify::Simple
    cpan> install GD GD::Barcode JSON::XS Mojolicious Time::HiRes Try::Tiny

#### Get a Git Clone of FreeScore

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
    driver=nl80211 # also supports the brcmfmac driver on Pi 3
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

### Using FreeScoreWifi as a Display device

    sudo apt-get install epiphany xautomation

Alternatively, you can use chromium, but I found chromium to be slow on Raspberry Pi

    sudo apt-get install chromium x11-xserver-utils unclutter

Enable autostart X with LXDE window manager (default); use `raspi-config` and
follow the on-screen menu.

    sudo raspi-config

Edit `/etc/xdg/lxsession/LXDE/autostart`

    @lxpanel --profile LXDE
    @pcmanfm --desktop --profile LXDE
    @xscreensaver -no-splash
    @xset s off
    @xset -dpms
    @xset s no blank
	@epiphany "http://freescore.net/freescore/forms/worldclass/index.php?ring=1&role=display"
    # @chromium --kiosk --ignore-certificate-errors --disable-restore-session-state --incognito "http://freescore.net/freescore/forms/worldclass/index.php?ring=1&role=display"

Switch from X-windows to command line using `<Alt>-<Ctl>-<F1>`. You can terminate
the session by identifying it's PID using

    pkill x


# Troubleshooting

## Database Errors

- 100 Database path read error
- 110 Database path/file missing
- 120 Database file unreadable
- 130 Database file unwriteable

## Division Object Errors

## Round Object Errors

./FreeScore/Forms/Division.pm:die "Database Read Error: Can't find division at '$self->{ path }' $!" if( ! -e $self->{ path } );
./FreeScore/Forms/GrassRoots/Division.pm:open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
./FreeScore/Forms/GrassRoots/Division.pm:open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
./FreeScore/Forms/WorldClass/Division/Round.pm:die "Round Object Error: Accuracy not calculated!" if not defined $accuracy;
./FreeScore/Forms/WorldClass/Division/Round.pm:die "Round Object Error: Precision not calculated!" if not defined $presentation;
./FreeScore/Forms/WorldClass/Division/Round.pm:else { die "Round Object Error: Attempting to instantiate an round object that is not an array ($ref) $!"; }
./FreeScore/Forms/WorldClass/Division.pm:die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $self->{ forms }{ $round };
./FreeScore/Forms/WorldClass/Division.pm:die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;
./FreeScore/Forms/WorldClass/Division.pm:open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
./FreeScore/Forms/WorldClass/Division.pm:die "Division Configuration Error: Number of Judges not defined before athlete information" unless $self->{ judges };
./FreeScore/Forms/WorldClass/Division.pm:die "Division Configuration Error: Forms not defined before athlete information" unless $self->{ forms };
./FreeScore/Forms/WorldClass/Division.pm:$form =~ s/f//; $form = int( $form ) - 1; die "Division Configuration Error: Invalid form index '$form' $!" unless $form >= 0;
./FreeScore/Forms/WorldClass/Division.pm:$judge =~ s/j//; $judge = $judge =~ /^r/ ? 0 : int( $judge ); die "Division Configuration Error: Invalid judge index '$judge' $!" unless $judge >= 0;
./FreeScore/Forms/WorldClass/Division.pm:die "Database Integrity Error: score recorded for $athlete->{ name } for $score_round round does not match context $round round\n" if $round ne $score_round;
./FreeScore/Forms/WorldClass/Division.pm:die "Database Read Error: Unknown line type '$_'\n";
./FreeScore/Forms/WorldClass/Division.pm:open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
./FreeScore/Forms/WorldClass/Division.pm:die "Division Object Error: Bad indices when selecting athlete $!" if( $i < 0 || $i > $#{ $self->{ athletes }} );
./FreeScore/Forms/WorldClass/Division.pm:die "Division Object Error: Forms not defined for round $round $!" unless( exists $self->{ forms }{ $round } );
./FreeScore/Forms/WorldClass/Division.pm:die "Division Configuration Error: While searching for $option athlete in '$round', found no athletes assigned to '$round'" unless( int( @athletes_in_round ));
./FreeScore/Forms/WorldClass.pm:open FILE, ">$file" or die "Database Error: Can't write '$file' $!";
./FreeScore/Forms.pm:opendir DIR, $self->{ path } or die "Database Read Error: Can't open directory '$self->{ path }' $!";
./FreeScore/Forms.pm:opendir DIR, $self->{ path } or die "Database Read Error: Can't open directory '$self->{ path }' $!";
./FreeScore/Forms.pm:opendir DIR, "$self->{ path }/staging" or die "Database Read Error: Can't open directory '$self->{ path }/staging' $!";
./FreeScore/Forms.pm:open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
./FreeScore/Test.pm:die "Network Error: Failed to get a response for command '$url'; " . $response->status_line;


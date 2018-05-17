# Raspberry Pi 2 with Jessie

## Problem: `hostapd` Doesn't Start on Boot
`/etc/defaults/hostapd` may have `$DAEMON_CONF` commented out.

Should be:

	DAEMON_CONF="/etc/hostapd/hostapd.conf"

You'll need to enable the CGI, which is a part of the Grassroots web communication system.

## Enable CGI

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
	


# FreeScore Linux Installation Guide

This guide covers installing FreeScore on a Debian/Ubuntu Linux host (tested on Debian 12 Bookworm / Ubuntu 22.04+). For Raspberry Pi-specific network setup (WiFi access point, hostapd), refer to `trunk/backend/raspberry-pi/rpi5/README.md`.

## Prerequisites

- A Debian or Ubuntu Linux system with `sudo` or root access
- Internet access for downloading packages and the repository
- A domain name or IP address clients will use to reach the server (the default is `freescore.net`)

---

## 1. System Packages

```bash
sudo apt-get update
sudo apt-get install -y \
    vim git \
    apache2 php \
    cpanminus libgd-gd2-perl \
    dnsmasq ifupdown openssh-server
```

Enable SSH so the server can be managed remotely:

```bash
sudo systemctl enable ssh
sudo systemctl start ssh
```

---

## 2. Enable Apache Modules

FreeScore needs CGI for reporting scripts and WebSocket proxying for real-time scoring:

```bash
sudo a2enmod cgi cgid
sudo a2enmod proxy proxy_http proxy_wstunnel
sudo systemctl restart apache2
```

---

## 3. Clone the Repository

```bash
git clone https://github.com/mikewongtkd/freescoretkd.git freescore
cd freescore
```

Make the repository readable by the web server:

```bash
chmod a+rx /home/$USER
chmod a+rx freescore
```

> **Note:** The active development branch is `se-rand-draw`. Run `git checkout se-rand-draw` if you want the latest code rather than `master`.

---

## 4. Install Perl Modules

```bash
sudo cpanm \
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
    "Mojo::IOLoop::Delay" \
    "PHP::Session" \
    Scalar::Util \
    Statistics::Descriptive \
    Test::Tester \
    Test::NoWarnings \
    Test::Deep \
    Test::Warn \
    Time::HiRes \
    Try::Tiny \
    YAML
```

`Mojolicious` includes Hypnotoad, the production server used to run FreeScore's backend services.

---

## 5. Configure Apache for CGI

Edit `/etc/apache2/conf-enabled/serve-cgi-bin.conf`. Change the default CGI path from `/usr/lib/cgi-bin` to `/var/www/cgi-bin` and allow symlinks:

```apache
# Change this:
ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
<Directory "/usr/lib/cgi-bin">
    AllowOverride None
    Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch

# To this:
ScriptAlias /cgi-bin/ /var/www/cgi-bin/
<Directory "/var/www/cgi-bin">
    AllowOverride None
    Options +ExecCGI -MultiViews +FollowSymLinks
```

---

## 6. Configure Apache for WebSocket Proxying

Create `/etc/apache2/sites-available/freescore.conf`:

```apache
<VirtualHost *:80>
    ServerName freescore.net
    DocumentRoot /var/www/html

    <Location /worldclass/request>
        ProxyPass ws://localhost:3088/worldclass
        ProxyPassReverse ws://localhost:3088/worldclass
        Order allow,deny
        Allow from all
    </Location>
    <Location /grassroots/request>
        ProxyPass ws://localhost:3080/grassroots
        ProxyPassReverse ws://localhost:3080/grassroots
        Order allow,deny
        Allow from all
    </Location>
    <Location /freestyle/request>
        ProxyPass ws://localhost:3082/freestyle
        ProxyPassReverse ws://localhost:3082/freestyle
        Order allow,deny
        Allow from all
    </Location>
    <Location /para/request>
        ProxyPass ws://localhost:3089/para
        ProxyPassReverse ws://localhost:3089/para
        Order allow,deny
        Allow from all
    </Location>
    <Location /vsparring/request>
        ProxyPass ws://localhost:3095/vsparring
        ProxyPassReverse ws://localhost:3095/vsparring
        Order allow,deny
        Allow from all
    </Location>
    <Location /freescore/request>
        ProxyPass ws://localhost:3085/freescore
        ProxyPassReverse ws://localhost:3085/freescore
        Order allow,deny
        Allow from all
    </Location>
</VirtualHost>
```

Enable the site and reload Apache:

```bash
sudo a2ensite freescore
sudo systemctl reload apache2
```

---

## 7. Create Directory Structure and Symlinks

Create required runtime directories:

```bash
sudo mkdir -p /var/log/freescore
sudo mkdir -p /var/run/freescore
sudo mkdir -p /var/www/cgi-bin
```

Create the CGI symlink:

```bash
cd /var/www/cgi-bin
sudo ln -s ~/freescore/trunk/frontend/cgi-bin freescore
```

Replace the default web root with FreeScore's frontend and link the backend:

```bash
sudo mv /var/www/html /var/www/html.orig
sudo ln -s ~/freescore/trunk/frontend/html /var/www/html
sudo ln -s ~/freescore/trunk/backend /usr/local/freescore
```

Make the data directory writable by the web server (www-data):

```bash
sudo mkdir -p /usr/local/freescore/data
sudo chmod -R a+w /usr/local/freescore/data
```

---

## 8. Configure the Hostname

FreeScore defaults to the hostname `freescore.net`. Set it:

```bash
sudo hostname freescore.net
```

Add the following line to `/etc/hosts`:

```
192.168.88.1    freescore.net
```

> Replace `192.168.88.1` with the server's actual IP address if it differs.

---

## 9. Create the Configuration File

Copy the default configuration and edit it:

```bash
cp /usr/local/freescore/config-default.json /usr/local/freescore/config.json
```

Edit `/usr/local/freescore/config.json` to set the correct host and tournament name:

```json
{
    "host": "freescore.net",
    "port": 80,
    "protocol": "http",
    "password": {
        "ring01": "1234",
        "ring02": "1234",
        "ring03": "5678"
    },
    "service": {
        "breaking":   { "path": "feats-breaking",   "port": 3078 },
        "freestyle":  { "path": "forms-freestyle",  "port": 3082 },
        "fswifi":     { "path": "",                 "port": 3085 },
        "grassroots": { "path": "forms-grassroots", "port": 3080 },
        "worldclass": { "path": "forms-worldclass", "port": 3088 }
    },
    "tournament": {
        "name": "My Tournament",
        "db":   "test"
    }
}
```

The `tournament.db` field is the subdirectory name under `/usr/local/freescore/data/` where division files are stored.

---

## 10. Set Up Tournament Data

FreeScore uses a flat-file database. Create the directory structure for the default tournament (`test`):

```bash
DATA=/usr/local/freescore/data/test
mkdir -p $DATA/forms-worldclass/staging
mkdir -p $DATA/forms-worldclass/ring01
mkdir -p $DATA/forms-grassroots/staging
mkdir -p $DATA/forms-grassroots/ring01
mkdir -p $DATA/forms-freestyle/staging
mkdir -p $DATA/forms-freestyle/ring01
mkdir -p $DATA/feats-breaking/staging
mkdir -p $DATA/feats-breaking/ring01
sudo chmod -R a+w $DATA
```

Example division files are in `trunk/backend/test/data/`. Copy and rename them to bootstrap a tournament:

```bash
cp trunk/backend/test/data/forms-worldclass/staging/div.p01.txt \
   $DATA/forms-worldclass/staging/div.p01.txt
```

Division file names follow the pattern `div.pNNL.txt` (e.g., `div.p01.txt`, `div.p01a.txt`). To assign a division to a ring, move its file:

```bash
mv $DATA/forms-worldclass/staging/div.p01.txt $DATA/forms-worldclass/ring01/
```

---

## 11. Start the Backend Services

From the backend directory:

```bash
cd /usr/local/freescore
make all-start
```

This starts all Hypnotoad services:

| Service    | Port |
|------------|------|
| grassroots | 3080 |
| freestyle  | 3082 |
| fswifi     | 3085 |
| worldclass | 3088 |
| breaking   | 3078 |

To start or stop individual services:

```bash
make worldclass-start
make worldclass-stop
make grassroots-start
make all-stop
```

Reload Apache to apply all configuration changes:

```bash
sudo systemctl daemon-reload
sudo systemctl restart apache2
```

---

## 12. Enable Services at Boot (systemd)

To have FreeScore services start automatically on boot, install the provided systemd unit files:

```bash
sudo cp /usr/local/freescore/raspberry-pi/rpi2/etc/init.d/worldclass  /etc/init.d/
sudo cp /usr/local/freescore/raspberry-pi/rpi2/etc/init.d/grassroots  /etc/init.d/
sudo cp /usr/local/freescore/raspberry-pi/rpi2/etc/init.d/freestyle   /etc/init.d/
sudo cp /usr/local/freescore/raspberry-pi/rpi2/etc/init.d/breaking    /etc/init.d/
sudo cp /usr/local/freescore/raspberry-pi/rpi2/etc/init.d/fswifi      /etc/init.d/

sudo update-rc.d worldclass defaults 97 03
sudo update-rc.d grassroots defaults 97 03
sudo update-rc.d freestyle  defaults 97 03
sudo update-rc.d breaking   defaults 97 03
sudo update-rc.d fswifi     defaults 97 03
```

Alternatively, use the systemd unit files in `trunk/backend/systemd/`. Copy them to `/etc/systemd/system/` and enable:

```bash
sudo cp /usr/local/freescore/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable worldclass grassroots freestyle breaking fswifi
sudo systemctl start  worldclass grassroots freestyle breaking fswifi
```

---

## 13. Verify the Installation

Check that backend services are listening on their ports:

```bash
ss -tlnp | grep -E '3078|3080|3082|3085|3088'
```

Check Apache is running and the frontend is accessible:

```bash
curl -s http://freescore.net/ | head -5
```

From a browser on a device connected to the same network, navigate to:

```
http://freescore.net/
```

You should see the FreeScore device registration page. Select a role (judge, coordinator, display) and confirm that WebSocket connections establish successfully.

---

## Troubleshooting

### Apache cannot follow symlinks

Ensure `FollowSymLinks` (not `SymLinksIfOwnerMatch`) is set in the CGI directory config and that the `Options` line in the main site allows it. Check the Apache error log:

```bash
sudo tail -f /var/log/apache2/error.log
```

### Backend service won't start

Check that `hypnotoad` is on the PATH (it is installed by the `Mojolicious` cpanm install):

```bash
which hypnotoad
```

If missing, find it and symlink or add it to PATH:

```bash
find /usr -name hypnotoad 2>/dev/null
```

Check service logs:

```bash
sudo tail -f /var/log/freescore/worldclass.log
```

### Database errors

| Code | Meaning |
|------|---------|
| 100  | Database path read error |
| 110  | Database path/file missing |
| 120  | Database file unreadable |
| 130  | Database file unwriteable |

The most common cause is permissions. Fix with:

```bash
sudo chmod -R a+w /usr/local/freescore/data
```

### Division parse errors

The division file parser is strict. After adding or editing a `div.pNN.txt` file, register a device as a **display** for that ring. If the display page loads, the file parsed correctly. If it shows an error, remove the last-added file and review its formatting against the examples in `trunk/backend/test/data/`.

### WebSocket connections fail

Confirm the proxy modules are loaded:

```bash
apache2ctl -M | grep -E 'proxy|wstunnel'
```

Expected output should include `proxy_module`, `proxy_http_module`, and `proxy_wstunnel_module`. If missing, run `sudo a2enmod proxy proxy_http proxy_wstunnel` and restart Apache.

Confirm the backend service is listening on the expected port (e.g., 3088 for worldclass):

```bash
ss -tlnp | grep 3088
```

### `config.json` not found

The PHP frontend searches for `config.json` in these paths in order:

1. `/usr/local/freescore/config.json`
2. `/usr/freescore/config.json`
3. `/home/ubuntu/freescore/config.json`
4. `/freescore/config.json`

If none exist the app will die with "No configuration file found". Ensure the symlink `/usr/local/freescore` points to `trunk/backend` and that `config.json` exists there.

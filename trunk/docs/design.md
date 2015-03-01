# FreeScore

## Design Documentation

This document highlights the core concepts behind the FreeScore Taekwondo tournament software and its current implementation.

### Laptops and Tablets

FreeScore is designed for physical portability; laptops and tablets. It achieves this by using software technology with relatively low computational overhead that can be run on limited hardware. Any system that can run Apache can be used as a server; any system that can run the latest version of Chrome can be used as a terminal or tablet interface for judges.

## Installation

### Pre-install instructions for Mac:
Create symbolic links for the following:
  - Frontend systems:
    - /Library/WebServer/Documents -> /var/www/html
    - /Library/WebServer/CGI-Executables -> /var/www/cgi-bin

### Installation instructions
Create symbolic links for the following:
  - Frontend systems:
    - ~/freescoretkd/frontend/html -> /var/www/html/freescore
    - ~/freescoretkd/frontend/cgi-bin -> /var/www/cgi-bin/freescore
  - Backend systems:
    - ~/freescoretkd/backend -> /usr/local/freescore

#### Front-end Architecture

The front-end architecture is currently Apache2/PHP using and Mojolicious/CGI. As of late 2014, there doesn't seem to be any SSL-ready implementation of WebSockets (and network may be too intermittent for WebSockets anyway). So the architecture uses the following technologies:

- Apache
- PHP
- Perl
  - CGI
  - Data::Structure::Util
  - Date::Calc;
  - Digest::MD5
  - JSON::XS
  - Mojolicious
  - Time::HiRes
  - Try::Tiny
  - YAML
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

#### Network

See setup images for configuring Open-WRT and DD-WRT access points.

Configure server host /etc/host file to resolve `freescore.net to` localhost loopback (`127.0.0.1`) and also to the DHCP static lease from the access point (e.g. `192.168.11.136`).

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

    Settings > Device > Display > Screen timeout

##### Apple iPad
Disable sleep.

    Settings > General > Autolock > Never
    

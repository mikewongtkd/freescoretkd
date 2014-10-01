# FreeScore

## Design Documentation

This document highlights the core concepts behind the FreeScore Taekwondo tournament software and its current implementation.

### Laptop Server and Tablets

FreeScore is designed for physical portability; laptops and tablets. It achieves this by using technology with relatively low overhead.

#### Front-end Architecture

The front-end architecture is currently Apache2 using and Mojolicious/CGI. As of late 2014, there doesn't seem to be any SSL-ready implementation of WebSockets (and network may be too intermittent for WebSockets anyway). So the current plan is to have a relatively stable software system using the following technologies:

- Perl/Mojolicious for RESTful applications
- CGI and/or mod_perl
- Server Sent Events
- AJAX

#### Back-end Architecture

Plain text files with a ramdisk cache
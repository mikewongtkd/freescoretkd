# FreeScore Security

The FreeScore security model is a simple form of Role-based access control.
Users authenticate themselves simply by their group membership (i.e. ring).
The special domain, *staging* has full access to all rings.

Files that implement security measures

	freescore/trunk/frontend/html/include/php/config.php
	freescore/trunk/frontend/html/session.php
	freescore/trunk/frontend/html/login.php
	freescore/trunk/backend/lib/FreeScore/Config.pm
	freescore/trunk/backend/lib/FreeScore/Security.pm
	freescore/trunk/backend/config.json
	freescore/trunk/backend/config-default.json

## Password Configuration

Passwords are configured in the `config.json` file. The `config-default.json`
file is provided in the repository as both an example for the file format, and
as a recommended default setting. Copy `config-default.json` to `config.json`
when performing a new install of FreeScore, and then edit `config.json` as
desired. 

## Login Behavior and Session Management

Login behavior is provided by `login.php`; it currently updates the session
authentication status and redirects successful authentications to the requested
target endpoint.

Session state is managed by the `session.php` file.

An improved behavior to respond to HTTP POST request shall be available in the
near future.

## Backend Security

Backend security is provided by the `FreeScore::Config` and
`FreeScore::Security` modules. `FreeScore::Config` is the analog to the
frontend `config.php` and needs to be in-sync with one another; developers must
manually ensure that requirement.

The `FreeScore::Security` module checks for client authentication and
authorization. 

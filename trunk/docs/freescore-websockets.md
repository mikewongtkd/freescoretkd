# FreeScore Websocket Services

At the heart of the FreeScore system are services that communicate with web
clients via websockets. Websockets are persistent real-time bidirectional
communication protocols that permit clients to coordinate with a server to
collaboratively update the application's data model. In the case of FreeScore,
that data model includes tournament state and progression through multiple
rings concurrently scoring for one division at-a-time.

## Protocol

### Object Types

* Division
* Ring
* Tournament

## Security

To secure the FreeScore Websockets, three proxy/reverse proxy routes must be
configured for each webservice. The webservice proxies for *worldclass* (i.e.
recognized poomsae) are shown below. These proxies are configured in a file
under `/etc/apache2/conf-enabled/freescore.conf` and included in 
`/etc/apache2/sites-enabled/000-default-le-ssl.conf` for use with LetsEncrypt
SSL/TLS certificates. 

The client uses SSL/TLS encryption to contact provided route Location. Apache
then decrypts the incoming client request and proxies it to the locally-running
webservice. The response is then reverse-proxied from the locally-running
webservice back to Apache, which then encrypts the response and sends it to the
client.

	<Location /worldclass/status>
	  ProxyPass http://localhost:3088/status
	  ProxyPassReverse http://localhost:3088/status
	  Order allow,deny
	  Allow from all
	</Location>
	<Location /worldclass/webservice>
	  ProxyPass http://localhost:3088
	  ProxyPassReverse http://localhost:3088
	  Order allow,deny
	  Allow from all
	</Location>
	<Location /worldclass/request>
	  ProxyPass ws://localhost:3088/worldclass
	  ProxyPassReverse ws://localhost:3088/worldclass
	  Order allow,deny
	  Allow from all
	</Location>

In brief, the *status* proxy allows each of the webservices to respond to a
simple HTTP request `/status`. The expected response from the server is the
string `OK`. Any other response, or no response altogether indicates that
the queried FreeScore service is down.



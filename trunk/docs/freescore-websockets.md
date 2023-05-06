# FreeScore Websocket Services

At the heart of the FreeScore system are services that communicate with web
clients via websockets. Websockets are persistent real-time bidirectional
communication protocols that permit clients to coordinate with a server to
collaboratively update the application's data model. In the case of FreeScore,
that data model includes tournament state and progression through multiple
rings concurrently scoring for one division at-a-time.

## Protocol

### Client Request Object/Action Types

* Form
  * Navigate (Goto/Next/Previous)
* Round
  * Navigate (Goto/Next/Previous)
* Athlete
  * Decision - Triggers autopilot
  * Navigate (Goto/Next/Previous)
  * Score - Can trigger autopilot
* Division
  * Display (Scoreboard/Leaderboard)
  * Navigate (Goto/Next/Previous)
  * Read/Write
* Ring
  * Read
  * Register Device
  * Transfer
* Tournament
  * Read
  * Register Device

### Server Response Object/Action Types

* Division
  * Update
* Ring
  * Update
* Tournament
  * Update

### Server Autopilot Response Object/Action Type

The server autopilot is a special server response object type where the server
acts on its own. Autopilot must be initiated by a request (e.g. athlete score).
The autopilot sequence is: (1) show the score for the current athlete; (2) show
the leaderboard after every 2 athletes; and (3) navigate to the next form,
athlete, or round and reset the display to show the (empty) scoreboard for the
new form or athlete (unless there are no more forms, athletes, or rounds). The
autopilot delays and number of athletes per leaderboard display are
configurable.

* Autopilot
  * Scoreboard
  * Leaderboard
  * Navigate

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



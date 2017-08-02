# Raspberry Pi 2 with Jessie

## Problem: `hostapd` Doesn't Start on Boot
`/etc/defaults/hostapd` may have `$DAEMON_CONF` commented out.

Should be:

	DAEMON_CONF="/etc/hostapd/hostapd.conf"

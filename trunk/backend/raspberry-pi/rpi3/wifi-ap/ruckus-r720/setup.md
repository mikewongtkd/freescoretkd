# Ruckus R720 WiFi AP

Summary:

- Device IP Address is `192.168.88.10`
- Username: `freescore`
- Password: `CO9MTHeY`

## Device Settings

	Device Name: FreeScoreAP
	Username: freescore
	Password: CO9MTHeY

## Internet

	NTP Server: freescore.net
	
	IPv4 Connection Type: Static
	Address: 192.168.88.10
	Mask: 255.255.255.0
	IPv4 DNS Mode: Manual
	Primary DNS: 192.168.88.1

## Local Subnets

### Local Subnet 1

Note that DHCP must be enabled at `/etc/dnsmasq.conf` using `dnsmasq` on the
Raspberry Pi. DHCP is **not** enabled on the Ruckus R720 (which differs from
the TP-Link configuration).

	IP Address: 192.168.88.10
	Subnet Mask: 255.255.255.0

## Radio 2.4G

### Wireless 1

Look up Packet Forwarding

	Network: FreeScore2.4G
	Availability: Enabled
	SSID: freescore
	
	Packet Forward: Bridge to WAN
	Local Subnet: Local Subnet 1
	Encryption Method: WPA
	Version: WPA2
	Authentication: PSK
	Algorithm: AES
	Passphrase: fKq5PcAV

## Radio 5G

### Wireless 9

	Network: FreeScore5G
	Availability: Enabled
	SSID: freescore-5g

	Packet Forward: Bridge to WAN
	Local Subnet: Local Subnet 1
	Encryption Method: WPA
	Version: WPA2
	Authentication: PSK
	Algorithm: AES
	Passphrase: fKq5PcAV


#! /usr/bin/sh

# ============================================================
# Devel Tools
# ============================================================
apt-get update
apt-get install -y sudo vim cpanminus

cpanm install \
	Carp \
	CGI \
	Clone \
	Data::Structure::Util \
	Date::Manip \
	Digest::SHA1 \
	Encode \
	EV \
	File::Copy \
	File::Path \
	File::Slurp \
	JSON::XS \
	LWP::UserAgent \
	List::MoreUtils \
	List::Util \
	Math::Round \
	Math::Utils \
	Mojolicious \
	PHP::Session \
	Scalar::Util \
	Statistics::Descriptive \
	Time::Piece \
	Try::Tiny

a2enmod cgi proxy proxy_http proxy_wstunnel
perl -pi -e 's|/usr/lib/cgi-bin/|/var/www/cgi-bin/|' /etc/apache2/conf-enabled/serve-cgi-bin.conf

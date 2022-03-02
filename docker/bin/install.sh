#! /usr/bin/sh

chmod a+w /freescore/trunk/backend/data

# ============================================================
# Devel Tools
# ============================================================
apt-get update
apt-get install -y sudo vim cpanminus

cpanm install \
	Carp \
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

#! /usr/bin/sh

rm -rf /var/www/html
rm -rf /var/www/cgi-bin
ln -s /freescore/trunk/frontend/html    /var/www/html
ln -s /freescore/trunk/frontend/cgi-bin /var/www/cgi-bin
ln -s /freescore/trunk/backend          /usr/local/freescore
cp /freescore/trunk/frontend/html/include/php/config.default.json /freescore/trunk/frontend/html/include/php/config.json
chmod a+w /freescore/trunk/backend/data

# ============================================================
# Devel Tools
# ============================================================
apt-get update
apt-get install vim

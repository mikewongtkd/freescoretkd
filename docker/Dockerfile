FROM php:7.2-apache
COPY bin/install.sh /freescore/docker/bin/install.sh
COPY freescore.conf /etc/apache2/conf-enabled
RUN  sh /freescore/docker/bin/install.sh
EXPOSE 3080
EXPOSE 3082
EXPOSE 3085
EXPOSE 3088
EXPOSE 3089
WORKDIR /usr/local/freescore

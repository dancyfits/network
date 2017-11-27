# update local dev library for openssl
RUN apt-get update
RUN apt-get install -y wget openssl libssl-dev coreutils

# install our essentials to build openssl
RUN apt-get install -y build-essential

# upgrade to a much newer and specific version of ssl
RUN wget -O /tmp/openssl-1.0.2h.tar.gz https://www.openssl.org/source/openssl-1.0.2h.tar.gz
RUN cd /tmp/ && tar -xf /tmp/openssl-1.0.2h.tar.gz
RUN rm /tmp/openssl-1.0.2h.tar.gz
RUN cd /tmp/openssl-1.0.2h && ./config
RUN cd /tmp/openssl-1.0.2h && make depend
RUN cd /tmp/openssl-1.0.2h && make
RUN cd /tmp/openssl-1.0.2h && make install
RUN rm -R /tmp/openssl-1.0.2h

# start and run all our services
CMD ["/usr/bin/npm", "start"]
// load modules
const _             = require('underscore');
const url           = require('url');
const zlib          = require('zlib');
const async         = require('async');
const request       = require('request');

// handle checking for the cache
module.exports = exports = function(payload, fn) {

  // last indexed line
  var last_current_line = -1;

  // get the data
  var data = payload.getData();

  // get the page content
  payload.getHAR(function(err, har) {

    // did we get a error ?
    if(err) {

      // debug
      payload.error('Got a error trying to get the HAR', err);

      // done
      return fn(null);

    }

    // sanity checck
    if(!har) return fn(null);
    if(!har.log) return fn(null);
    if(!har.log.entries) return fn(null);

    // parse the url
    var uri = url.parse(data.url);

    // loop in async
    async.eachLimit(har.log.entries || [], 10, function(entry, cb) {

      // get the content type
      var header = _.find(entry.response.headers || [], function(item) {

        // returns the item
        return item.name.toLowerCase() == 'vary';

      });

      // ok so now we check if the url that was contained a query string
      var entryUri = null;

      // handle the try/catch
      try {

        // parse the url
        entryUri = url.parse( entry.request.url );

      } catch(err) {}

      // sanity check
      if(!entryUri) 
        return cb(null);

      // should match the current host
      if((entryUri.hostname || '').toLowerCase().indexOf((uri.hostname || '').toLowerCase()) === -1) 
        return cb(null);

      // must not match 200
      if((entry.response || {}).status != 200) 
        return cb(null);

      // if not defined, configure keep alive to show
      if(header) {

        // check the header value
        if(header.value
            .toLowerCase()
              .replace(/\s+/gi, '')
                .split(',')
                  .indexOf('accept-encoding') === -1) {

          // add the rule
          payload.addRule({

              message: 'Vary header not set to enable Accept-Encoding',
              key: 'vary',
              type: 'notice'

            },{

                message: '$ did not return a $ header that contains, at a minimum $',
                identifiers: [ entry.request.url, 'Vary', 'Accept-Encoding' ],
                url: url.format(entryUri),
                type: 'url'

              })

        }

      } else {

        // add the rule
        payload.addRule({

            message: 'Vary header not set to enable Accept-Encoding',
            key: 'vary',
            type: 'notice'

          }, {

              message: 'The header $ was not returned by the server from $, which was expected to contain $',
              identifiers: [ 'Vary', entry.request.url, 'Accept-Encoding' ],
              url: url.format(entry.request.url),
              type: 'url'

            })

      }

      // done
      cb(null);

    }, function() {

      // done
      fn(null);

    });

  });

};

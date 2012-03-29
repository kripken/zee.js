
  return {
    'compress': function(data) { // TODO: Accept strings
      var gzFile = Module['ccall']('gzopen', 'number', ['string', 'string'], ['output.gz', 'wb']);
      var buffer = _malloc(data.length);
      HEAPU8.set(data, buffer);
      Module['ccall']('gzwrite', 'number', ['number', 'number', 'number'], [gzFile, buffer, data.length]);
      Module['ccall']('gzclose', 'number', ['number'], [gzFile]);
      _free(buffer);
      return new Uint8Array(FS.root.contents['output.gz'].contents);
      // TODO: Delete file
    },

    'decompress': function(data) {
      var BUFSIZE = 1024*1024;
      FS.createDataFile('/', 'input.gz', data, true, true);
      var gzFile = Module['ccall']('gzopen', 'number', ['string', 'string'], ['input.gz', 'rb']);
      var buffer = _malloc(BUFSIZE);
      var chunks = [];
      var total = 0;
      var len;
      while( (len = Module['ccall']('gzread', 'number', ['number', 'number', 'number'], [gzFile, buffer, BUFSIZE])) > 0) {
        chunks.push(new Uint8Array(len));
        chunks[chunks.length-1].set(HEAPU8.subarray(buffer, buffer+len));
        total += len;
      }
      Module['ccall']('gzclose', 'number', ['number'], [gzFile]);
      _free(buffer);
      var ret = new Uint8Array(total);
      var curr = 0;
      for (var i = 0; i < chunks.length; i++) {
        ret.set(chunks[i], curr);
        curr += chunks[i].length;
      }
      return ret;
      // TODO: Delete datafile
    }
  };
})();



Module['gzcompress'] = function(data) { // TODO: Accept strings
  var gzFile = ccall('gzopen', 'number', ['string', 'string'], ['output.gz', 'wb']);
  var buffer = _malloc(data.length);
  HEAPU8.set(data, buffer);
  ccall('gzwrite', 'number', ['number', 'number', 'number'], [gzFile, buffer, data.length]);
  ccall('gzclose', 'number', ['number'], [gzFile]);
  _free(buffer);
  var ret = FS.readFile('output.gz');
  FS.unlink('output.gz');
  return ret;
};

Module['gzdecompress'] = function(data) {
  var BUFSIZE = 1024*1024;
  FS.writeFile('input.gz', data);
  var gzFile = ccall('gzopen', 'number', ['string', 'string'], ['input.gz', 'rb']);
  var buffer = _malloc(BUFSIZE);
  var chunks = [];
  var total = 0;
  var len;
  while( (len = ccall('gzread', 'number', ['number', 'number', 'number'], [gzFile, buffer, BUFSIZE])) > 0) {
    chunks.push(new Uint8Array(len));
    chunks[chunks.length-1].set(HEAPU8.subarray(buffer, buffer+len));
    total += len;
  }
  var eof = ccall('gzeof', 'number', ['number'], [gzFile]);
  if (len != 0 || !eof) {
      var errnum = _malloc(4);
      var err = ccall('gzerror', 'string', ['int', 'int'], [gzFile, errnum]);
      console.log('Error:', err + " (" + getValue(errnum, 'i32') + ")");
  }
  ccall('gzclose', 'number', ['number'], [gzFile]);
  FS.unlink('input.gz');
  _free(buffer);
  var ret = new Uint8Array(total);
  var curr = 0;
  for (var i = 0; i < chunks.length; i++) {
    ret.set(chunks[i], curr);
    curr += chunks[i].length;
  }
  return ret;
};

  var apiTemp = Runtime.stackAlloc(4);

  return {
    'compressBound': function(size) { // not that useful to export, but why not..
      return Module['ccall']('compressBound', 'number', ['number'], [size]);
    },

    'compress': function(data) { // TODO: Accept strings
      var destSize = this['compressBound'](data.length);
      var dest = _malloc(destSize);
      setValue(apiTemp, destSize, 'i32');
      var src = _malloc(data.length);
      for (var i = 0; i < data.length; i++) {
        setValue(src+i, unSign(data[i], 8), 'i8'); // could be much more efficient with typed arrays
      }
      var ret = Module['ccall']('compress', 'number', ['number', 'number', 'number', 'number'], [dest, apiTemp, src, src.length]);
      if (ret) {
        _free(dest);
        _free(src);
        throw 'zlib exception: ' + ret;
      }
      var actualSize = getValue(apiTemp, 'i32');
      var buffer = [actualSize]; // encode the size at the beginning
      for (var i = 0; i < actualSize; i++) {
        buffer[i+1] = unSign(getValue(dest+i, 'i8'), 8); // could be much more efficient with typed arrays
      }
      _free(dest);
      _free(src);
      return buffer;
    },

    'uncompress': function(data) {
      var destSize = data[0]; // the size is encoded at the beginning
      var dest = _malloc(destSize);
      setValue(apiTemp, destSize, 'i32');
      var src = _malloc(data.length-1);
      for (var i = 0; i < data.length-1; i++) {
        setValue(src+i, unSign(data[i+1], 8), 'i8'); // could be much more efficient with typed arrays
      }
      var ret = Module['ccall']('uncompress', 'number', ['number', 'number', 'number', 'number'], [dest, apiTemp, src, data.length-1]);
      if (ret) {
        _free(dest);
        _free(src);
        throw 'zlib exception: ' + ret;
      }
      var actualSize = getValue(apiTemp, 'i32');
      assert(actualSize == destSize);
      var buffer = [];
      for (var i = 0; i < actualSize; i++) {
        buffer[i] = unSign(getValue(dest+i, 'i8'), 8); // could be much more efficient with typed arrays
      }
      _free(dest);
      _free(src);
      return buffer;
    }
  };
})();


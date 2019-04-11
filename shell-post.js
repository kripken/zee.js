
  return {
    compress: Module['gzcompress'],
    decompress: Module['gzdecompress']
  };
})();

// Export for NodeJS
if (typeof module == 'object') { module.exports = Zee; }

// js -m -n -e "load('zee.fast.js')" test.js

var data = [100, 200, 200, 200, 200, 200, 200, 100, 100, 200, 200, 200, 200, 0, 1];
print(data);

var compressed = Zee.compress(data);
print(compressed);

var uncompressed = Zee.uncompress(compressed);
print(uncompressed);


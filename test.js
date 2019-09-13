// js test.js

Zee = require('./zee');

/*
var data = [100, 200, 200, 200, 200, 200, 200, 100, 100, 200, 200, 200, 200, 0, 1, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1];
print('original: ' + data + ' : ' + data.length);

var compressed = Zee.compress(data);
print('compressed: ' + compressed.length);

var uncompressed = Zee.uncompress(compressed);
print('decompressed: ' + uncompressed.length);
*/

function assertEq(a, b) {
  if (a !== b) {
    throw 'Should have been equal: ' + a + ' : ' + b;
  }
  return false;
}

function assertNeq(a, b) {
  try {
    assertEq(a, b);
  } catch(e) {
    return;
  }
  throw 'Should have not been equal: ' + a + ' : ' + b;
}

function byteCompare(a, b) {
  assertEq(a.length, b.length);
  for (var i = 0; i < a.length; i++) {
    assertEq(a[i]&255, b[i]&255);
  }
}

function testSimple() {
  console.log('testing simple..');
  var data = [100, 200, 200, 200, 200, 200, 200, 100, 100, 200, 200, 200, 200, 0, 1];
  var compressed = Zee.compress(data);
  var decompressed = Zee.decompress(compressed);

  byteCompare(data, decompressed);
  assertNeq(data.length, compressed.length);
}

function testBig() {
  console.log('testing big..');
  var seed1 = 100;
  var seed2 = 200;
  var last = 255;
  function fakeRandom() {
    // numbers from http://triptico.com/docs/sp_random.html
    seed1 = ((seed1 * 58321) + 11113) | 0;
    var ret = (seed1 >> 16) & 255;
    seed2 = ((seed2 * 58321) + 11113) | 0;
    if (seed2 % 5) {
      return last;
    }
    last = ret;
    return last;
  }
  console.log('           ..generating data..');
  var size = 1*1024*1024;
  var data = new Array(size);
  for (var i = 0; i < size; i++) {
    data[i] = fakeRandom();
  }

  console.log('           ..compressing ' + data.length + ' bytes..');
  var t = Date.now();
  var compressed = Zee.compress(data);
  console.log('           ..took ' + ((Date.now() - t)/1000).toFixed(2) + ' secs');
  console.log('           ..decompressing ' + compressed.length + ' bytes..');
  t = Date.now();
  var decompressed = Zee.decompress(compressed);
  console.log('           ..took ' + ((Date.now() - t)/1000).toFixed(2) + ' secs');
  console.log('           ..got ' + decompressed.length + ' bytes..');

  byteCompare(data, decompressed);
  assertNeq(data.length, compressed.length);
  console.log('           ..decompressed == original');
}

function testErrorReporting() {
  console.log('testing error..');
  var output = null;

  consolebak = console;
  console.log = function() { output = arguments; }
  var decompressed = Zee.decompress(new Uint8Array([31, 139, 8, 0, 191, 28, 120, 93, 0, 3, 75, 202, 207, 203, 47, 45, 226, 2, 0, 225, 250, 205, 167, 8, 0, 0, 0]));
  console = consolebak;

  assertEq(output[0], 'Error:');
  assertEq(output[1], 'input.gz: incorrect data check (-3)');
}

testSimple();
testBig();
testErrorReporting();

console.log('ok.');


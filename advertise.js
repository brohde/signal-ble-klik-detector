var bleno = require('bleno');

var bufferRssiAck = Buffer.from('080942524f5457494c07ffa35242a44d11', 'hex');
/*
Message composition
===================
08 Length
09 Complete local name
42 B
52 R
4f O
54 T
57 W
49 I
4c L
07 Length
ff BLE Payload field
a3 RSSI
52 RSSI
42 FILTER VALUE
a4 RSSI END
4d ACK
11 ACK VAL
*/

var bufferRssiWakeup =  Buffer.from('080942524f5457494c08ffa35242a451ff05', 'hex');
/*
Message composition
===================
08 Length
09 Complete local name
42 B
52 R
4f O
54 T
57 W
49 I
4c L
08 Length
ff BLE Payload field
a3 RSSI
52 RSSI
42 FILTER VALUE
a4 RSSI END
51 WAKEUP
ff WAKEUP
05 WAKEUP
*/

var buffer = bufferRssiAck;

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertisingWithEIRData(buffer);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
});

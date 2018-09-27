require('dotenv').load();
var fetch = require('isomorphic-fetch');
var discover = require('./lib/discover');

discover.start();

discover.on('clicked', (event) => {
  console.log('Device Clicked:', event.deviceId, event.peripheral.rssi);
});

discover.on('found', async (event) => {
  console.log('Device Found:', event.deviceId, event.peripheral.rssi);

  const { deviceId } = event;
  const postUrl = process.env.ON_PRESENCE_FOUND_URL;

  if (!postUrl) {
    return;
  }

  const res = await fetch(`${postUrl}/${deviceId}`);
  const json = await res.json();

  console.log(json);
});

discover.on('lost', async (event) => {
  console.log('Device Lost:', event.deviceId);

  const { deviceId } = event;
  const postUrl = process.env.ON_PRESENCE_LOST_URL;

  if (!postUrl) {
    return;
  }

  const res = await fetch(`${postUrl}/${deviceId}`);
  const json = await res.json();

  console.log(json);
});

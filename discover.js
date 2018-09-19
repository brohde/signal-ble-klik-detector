var noble = require('noble');

const DEVICE_TIMEOUT = 4000;
const EXPIRE_CHECK_INTERVAL = 500;
const ACK_BUFFER = new Buffer('0e11', 'hex');


class Discover {

  constructor() {
    this.devices = {};
    this.expirePresenceInterval = null;

    this.start();
  }

  start() {
    noble.startScanning([], true);
    this.addEventListeners();
    this.expirePressenceInterval = setInterval(this.expireRun.bind(this),
        EXPIRE_CHECK_INTERVAL);
  }

  expireRun() {
    Object.keys(this.devices).map(deviceId => {
      const t = this.devices[deviceId].ts + DEVICE_TIMEOUT;

      if (t <= Date.now()) {
        delete this.devices[deviceId];
        this.onPresenceLost(deviceId);
      }
    })
  }

  addEventListeners() {
    noble.on('stateChange', this.onStateChange.bind(this));
    noble.on('discover', this.onDiscover.bind(this));
  }

  onStateChange(state) {
    console.log(state);
  }

  onDiscover(p) {
    const { localName } = p.advertisement;

    if (typeof localName !== 'string') {
      return;
    }

    const namePrefix = localName.slice(0, 3).toLowerCase();
    const isKlikWearable = namePrefix === 'fri' || namePrefix === 'pix';
    const time = new Date().toLocaleTimeString('en-US');

    if (isKlikWearable) {

      const data = p.advertisement.manufacturerData;
      const deviceId = localName.slice(3); //strip PIX or FRI

      if (!data) {
        return;
      }

      const alreadySeen = typeof this.devices[deviceId] !== 'undefined';

      // Ensure we're receiving ACK data, or if the device is already seen
      // (and hasn't expired), but it transmitting other data (i.e. user
      // is pressing Klik button), still mark the device as seen.

      if (!ACK_BUFFER.equals(data) && !alreadySeen) {
        return;
      }

      this.seen(deviceId, { rssi: p.rssi, advertisement: p.advertisement });

    }
  }

  seen(deviceId, data) {
    if (!this.devices[deviceId]) {
      // Newly seen
      this.onPresenceDetected(deviceId, data);
    }

    this.devices[deviceId] = {
      ts: Date.now(),
      data
    };
  }

  onPresenceDetected(deviceId, data) {
    console.log('onPresenceDetected', deviceId, data.rssi);
  }

  onPresenceLost(deviceId) {
    console.log('onPresenceLost', deviceId);
  }
}

new Discover();

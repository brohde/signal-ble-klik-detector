var noble = require('noble');
var throttle = require('lodash').throttle;
var EventEmitter = require('events');

const DEVICE_TIMEOUT = 4000;
const CLICKED_TIMEOUT = 8000;
const EXPIRE_CHECK_INTERVAL = 500;

const ACK_BUFFER = new Buffer('0e11', 'hex');
const CLICKED_BUFFER = new Buffer('522df2', 'hex');

class Discover extends EventEmitter {

  constructor() {
    super();

    this.devices = {};
    this.expirePresenceInterval = null;
    this.throttledClickFns = {};
  }

  start() {
    noble.startScanning([], true);
    this.addEventListeners();
    this.expirePresenceInterval = setInterval(this.expireRun.bind(this),
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

  onClicked(deviceId, peripheral) {
    this.throttledClickFns[deviceId] = this.throttledClickFns[deviceId] || throttle(() => {
      this.emit('clicked', { deviceId, peripheral });
    }, CLICKED_TIMEOUT, { trailing: false });

    return this.throttledClickFns[deviceId];
  }

  onDiscover(p) {
    const { localName } = p.advertisement;

    if (typeof localName !== 'string') {
      return;
    }

    const namePrefix = localName.slice(0, 3).toLowerCase();
    const isKlikWearable = ['fri', 'pix'].includes(namePrefix);
    const time = new Date().toLocaleTimeString('en-US');

    if (isKlikWearable) {

      const data = p.advertisement.manufacturerData;
      const deviceId = localName.slice(3); //strip PIX or FRI

      if (!data) {
        return;
      }

      // Detect a click first.
      //if (CLICKED_BUFFER.equals(data)) {
      if (data[2] === CLICKED_BUFFER[2]) {
        this.onClicked(deviceId, p)();
      }

      const alreadySeen = typeof this.devices[deviceId] !== 'undefined';

      // Ensure we're receiving ACK data, or if the device is already seen
      // (and hasn't expired), but it transmitting other data (i.e. user
      // is pressing Klik button), still mark the device as seen.

      if (!ACK_BUFFER.equals(data) && !alreadySeen) {
        return;
      }

      this.seen(deviceId, p);

    }
  }

  seen(deviceId, peripheral) {
    if (!this.devices[deviceId]) {
      // Newly seen
      this.onPresenceDetected(deviceId, peripheral);
    }

    this.devices[deviceId] = {
      ts: Date.now(),
      peripheral
    };
  }

  async onPresenceDetected(deviceId, peripheral) {
    this.emit('found', { deviceId, peripheral });
  }

  async onPresenceLost(deviceId) {
    this.emit('lost', { deviceId });
  }
}

module.exports = new Discover();

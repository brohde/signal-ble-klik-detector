#signal-ble-klik-detector

Bluetooth Low Energy Presence Detection for Klik Wearable Devices

## Overview
There are two components to detect Klik wearables. First, (1) we must advertise a message to Klik devices within range to ask them to respond to us quickly. Then, (2) we must listen for the response to detect the device(s).

### Advertise

The [__advertise.js__](advertise.js) script will broadcast an "ack" command and an "RSSI" filter. The RSSI filter instructs the wearable to only respond if the filter is within the specifed value (ensuring that only devices within a certain range will respond). Klik wearables respond very quickly to "ack" commands.

### Discover

The [__discover.js__](discover.js) script will listen for "ack" replies that the Klik wearables will send. When a Klik wearable sends the ack reply, we know that the device is within range. The discover script will store device IDs that are within range, only triggering the `onPresenceDetected` event once. If any seen device does not transmit another ack within `DEVICE_TIMEOUT` ms, the `onPresenceLost` event will be triggered.

## Requirements

### System
* __Linux OS__ (not Mac OS) – For testing, I have been using Ubuntu 18.04.1 LTS through a VirtualBox instance on my Macbook Pro. A Raspberry Pi and any Linux OS should also work.
* __BlueZ__ — Bluetooth drivers [http://www.bluez.org/](http://www.bluez.org/)
* node & npm


### Hardware
* A USB Bluetooth 4.0 USB dongle. E.g.: [https://www.amazon.com/Bluetooth-Version-Wireless-Adapter-Compatible/dp/B01HRZCDEG](https://www.amazon.com/Bluetooth-Version-Wireless-Adapter-Compatible/dp/B01HRZCDEG)



## Installation
1. Clone repository
1. `npm i`

## Usage

These scripts should be run in parallel (e.g., use two terminal windows). If we want to set up multiple "hot spots", we can the advertise script

### Advertise

$ `node advertise.js`

Expected output:

```
on -> stateChange: poweredOn
on -> advertisingStart: success
```

### Detect

$ `node discover.js`

Expected output:

```
poweredOn
```

## Helpful commands
* `hcitool dev` _(BlueZ)_ — Lists available Bluetooth devices.

## Reference

* [Bluetooth 4.0 Specification (pdf)](docs/Bluetooth_Core_V4.0.pdf)
* [Klik BLE Protocol (html)](docs/klikbleproto.html)
* [Noble](https://github.com/noble/noble) – Node library used for listening to Bluetooth devices _(requires BlueZ)_
* [Bleno](https://github.com/noble/bleno) – Node library used for advertising Bluetooth messages _(requires BlueZ)_

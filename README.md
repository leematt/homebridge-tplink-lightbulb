# homebridge-tplink-lightbulb

[![npm Version](https://img.shields.io/npm/v/homebridge-tplink-lightbulb.svg)](https://www.npmjs.com/package/homebridge-tplink-lightbulb)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

TP-Link LB100/110/120/130 Smart Bulb plugin for [Homebridge](https://github.com/nfarina/homebridge). ***Please read [deprecation note](#deprecation) below before installing!***

# Deprecation

Due to a number of issues with the current version, and the integration of smart bulb support in the [homebridge-tplink-smarthome](https://github.com/plasticrake/homebridge-tplink-smarthome) plugin, this plugin has been deprecated and it is recommended that you install [homebridge-tplink-smarthome](https://github.com/plasticrake/homebridge-tplink-smarthome) instead.

# Installation

1. Install Homebridge: `npm install -g homebridge`
2. Install this plugin: `npm install -g homebridge-tplink-lightbulb`
3. Update Homebridge configuration (`.homebridge/config.json`) and add `{ "platform": "TplinkLightbulb" }` to `platforms`:

```json
"platforms": [
  {
    "platform": "TplinkLightbulb"
  }
]
```

# Troubleshooting

Ensure that you've followed the [Homebridge installation and configuration instructions](https://github.com/nfarina/homebridge/blob/master/README.md), and [configured your TP-Link lightbulbs with the Kasa app](http://www.tp-link.com/us/faq-946.html).

# Thanks

Thanks to Patrick Seal for example and inspiration with [homebridge-hs100](https://github.com/plasticrake/homebridge-hs100), and to David Konsumer for providing the bulb interface with [tplink-lightbulb](https://github.com/konsumer/tplink-lightbulb).

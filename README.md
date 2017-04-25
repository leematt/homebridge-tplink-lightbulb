# homebridge-tplink-lightbulb

[![npm Version](https://img.shields.io/npm/v/homebridge-tplink-lightbulb.svg)](https://www.npmjs.com/package/homebridge-tplink-lightbulb)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)
[![Code Climate](https://codeclimate.com/github/leematt/homebridge-tplink-lightbulb/badges/gpa.svg)](https://codeclimate.com/github/leematt/homebridge-tplink-lightbulb)

TP-Link LB100/110/120/130 Smart Bulb plugin for [Homebridge](https://github.com/nfarina/homebridge).

It has only been tested with [LB120](http://www.tp-link.com/us/products/details/cat-5609_LB120.html) so far, so support for color has not yet been added, and there may be issues with other models.

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

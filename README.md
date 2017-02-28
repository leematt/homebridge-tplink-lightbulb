# homebridge-tplink-lightbulb

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

TP-Link LB100/110/120/130 Smart Bulb plugin for [Homebridge](https://github.com/nfarina/homebridge).

It has only been tested with LB120 so far, so support for color has not yet been added, and there may be issues with other models.

# Installation

1. Install Homebridge: `npm install -g homebridge`
2. Install this plugin: `npm install -g homebridge-tplink-lightbulb`
3. Update Homebridge configuration with:

```json
"platforms": [{
    "platform": "TplinkLightbulb"
}]
```

# Thanks

Thanks to Patrick Seal for example and inspiration with [homebridge-hs100](https://github.com/plasticrake/homebridge-hs100), and to David Konsumer for providing the bulb interface with [tplink-lightbulb](https://github.com/konsumer/tplink-lightbulb).

'use strict'
const Bulb = require('tplink-lightbulb')
const promiseTimeout = require('promise-timeout')
const promiseRetry = require('promise-retry')

var PlatformAccessory, Service, Characteristic, UUIDGen

module.exports = function (homebridge) {
  PlatformAccessory = homebridge.platformAccessory
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerPlatform('homebridge-tplink-lightbulb', 'TplinkLightbulb', TplinkLightbulbPlatform, true)
}

class TplinkLightbulbPlatform {
  constructor (log, config, api) {
    this.log = log
    this.config = config || {}
    this.accessories = new Map()

    if (api) {
      this.api = api

      // Scan for bulbs after cached bulbs have been restored
      this.api.on('didFinishLaunching', this.scan.bind(this))
    }
  }

  scan () {
    Bulb.scan('IOT.SMARTBULB').on('light', (light) => {
      var accessory = this.accessories.get(light.deviceId)
      if (accessory === undefined) {
        this.addAccessory(light)
      } else {
        this.log('Lightbulb online: %s [%s]', accessory.displayName, light.deviceId)
        accessory = new TplinkLightbulbAccessory(this.log, accessory)
        this.accessories.set(light.deviceId, accessory)
        accessory.configure(light)
      }
    })
  }

  configureAccessory (light) {
    this.accessories.set(light.context.deviceId, light)
  }

  addAccessory (light) {
    var platform = this
    const name = light.name
    platform.log('Lightbulb added: %s [%s]', name, light.deviceId)

    // 5 == Accessory.Categories.LIGHTBULB
    const platformAccessory = new PlatformAccessory(name, UUIDGen.generate(light.deviceId + light.name), 5)

    const lightService = platformAccessory.addService(Service.Lightbulb, name)
    lightService.addCharacteristic(Characteristic.Brightness)
    
    // to listen to color
    lightService.addCharacteristic(Characteristic.Hue)
    lightService.addCharacteristic(Characteristic.Saturation)

    const infoService = platformAccessory.getService(Service.AccessoryInformation)
    infoService.addCharacteristic(Characteristic.FirmwareRevision)
    infoService.addCharacteristic(Characteristic.HardwareRevision)

    platformAccessory.context.deviceId = light.deviceId
    platformAccessory.context.host = light.host
    platformAccessory.context.port = light.port || 9999

    const accessory = new TplinkLightbulbAccessory(this.log, platformAccessory)

    accessory.configure(light)
    platform.accessories.set(light.deviceId, accessory)
    platform.api.registerPlatformAccessories('homebridge-tplink-lightbulb', 'TplinkLightbulb', [platformAccessory])
  }
}

class TplinkLightbulbAccessory {
  constructor (log, platformAccessory) {
    this.log = log
    this.platformAccessory = platformAccessory
    this.deviceId = platformAccessory.context.deviceId
  }

  // Request info from bulb, retrying if the request times out
  getInfo (light) {
    let self = this

    return promiseRetry(function (retry, number) {
      if (number > 1) {
        self.log.debug('Unable to contact bulb, trying again (attempt #%s)', number)
      }

      return promiseTimeout.timeout(light.info(), 2000)
        .catch(function (err) {
          if (err instanceof promiseTimeout.TimeoutError) {
            retry(err)
          }

          throw err
        })
    })
  }

  configure (light) {
    this.light = light
    this.log('Configuring:', this.platformAccessory.displayName)

    const lightService = this.platformAccessory.getService(Service.Lightbulb)

    const powerCharacteristic = lightService.getCharacteristic(Characteristic.On)
    powerCharacteristic
      .on('get', (callback) => {
        this.getInfo(this.light).then((info) => {
          this.refresh(info)
          this.powerState = info.light_state.on_off
          callback(null, info.light_state.on_off === 1)
        }).catch((reason) => {
          this.log(reason)
        })
      })
      .on('set', (value, callback) => {
        if (value === this.powerState) {
          callback()
          return
        }

        light.set(value).then((status) => {
          this.powerState = value
          this.log('Set %s light to %s', light.name, value ? 'on' : 'off')
          callback()
        }).catch((reason) => {
          this.log(reason)
        })
      })

    const brightnessCharacteristic = lightService.getCharacteristic(Characteristic.Brightness)
    brightnessCharacteristic
      .on('get', (callback) => {
        this.getInfo(this.light).then((info) => {
          this.refresh(info)

          const brightness = info.light_state.brightness || 100

          callback(null, brightness)
        }).catch((reason) => {
          this.log(reason)
        })
      })
      .on('set', (value, callback) => {
        if (value === brightnessCharacteristic.value) {
          callback()
          return
        }

        light.set(true, 0, { brightness: value }).then((status) => {
          this.log('Changed %s brightness from %s% to %s%', light.name, brightnessCharacteristic.value, value)
          callback()
        }).catch((reason) => {
          this.log(reason)
        })
      })
    
    // hue characterstic
    const hueCharacteristic = lightService.getCharacteristic(Characteristic.Hue)
    hueCharacteristic
      .on('get', (callback) => {
        this.getInfo(this.light).then((info) => {
          this.refresh(info)

          const hue = info.light_state.hue || 360

          callback(null, hue)
        }).catch((reason) => {
          this.log(reason)
        })
      })
      .on('set', (value, callback) => {
        if (value === hueCharacteristic.value) {
          callback()
          return
        }

        light.set(true, 0, { hue: value }).then((status) => {
          this.log('Changed %s hue from %s to %s', light.name, hueCharacteristic.value, value);
          callback()
        }).catch((reason) => {
          this.log(reason)
        })
      })

    // saturation characterstic
    const saturationCharacteristic = lightService.getCharacteristic(Characteristic.Saturation)
    saturationCharacteristic
      .on('get', (callback) => {
        this.getInfo(this.light).then((info) => {
          this.refresh(info)

          const hue = info.light_state.saturation || 100

          callback(null, hue)
        }).catch((reason) => {
          this.log(reason)
        })
      })
      .on('set', (value, callback) => {
        if (value === saturationCharacteristic.value) {
          callback()
          return
        }

        light.set(true, 0, { hue: value }).then((status) => {
          this.log('Changed %s saturation from %s to %s', light.name, saturationCharacteristic.value, value);
          callback()
        }).catch((reason) => {
          this.log(reason)
        })
      })
  }

  refresh (info) {
    info = info ? Promise.resolve(info) : this.light.info()

    return info.then((info) => {
      this.platformAccessory.updateReachability(true)

      const name = info.alias || this.platformAccessory.context.host
      this.platformAccessory.displayName = name

      this.platformAccessory.getService(Service.Lightbulb)
        .setCharacteristic(Characteristic.Name, name)

      this.platformAccessory.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Name, name)
        .setCharacteristic(Characteristic.Manufacturer, 'TP-Link')
        .setCharacteristic(Characteristic.Model, info.model)
        .setCharacteristic(Characteristic.SerialNumber, info.deviceId)
        .setCharacteristic(Characteristic.FirmwareRevision, info.sw_ver)
        .setCharacteristic(Characteristic.HardwareRevision, info.hw_ver)

      this.platformAccessory.context.lastRefreshed = new Date()

      return this
    }).catch((reason) => {
      this.log(reason)
    })
  }
}

const TPLink = require('tplink-lightbulb')

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
    TPLink.scan().on('light', (light) => {
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
    const platformAccessory = new PlatformAccessory(name, UUIDGen.generate(light.deviceId), 5)

    platformAccessory.addService(Service.Lightbulb, name)
      .addCharacteristic(Characteristic.Brightness)

    platformAccessory.getService(Service.AccessoryInformation)
      .addCharacteristic(Characteristic.FirmwareRevision)
      .addCharacteristic(Characteristic.HardwareRevision)

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

  configure (light) {
    this.light = light
    this.log('Configuring:', this.platformAccessory.displayName)

    const lightService = this.platformAccessory.getService(Service.Lightbulb)

    const powerCharacteristic = lightService.getCharacteristic(Characteristic.On)
    powerCharacteristic
      .on('get', (callback) => {
        light.info().then((info) => {
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
        light.info().then((info) => {
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

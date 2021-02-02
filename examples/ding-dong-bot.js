/**
 * Wechaty - WeChat Bot SDK for Personal Account, Powered by TypeScript, Docker, and 💖
 *  - https://github.com/chatie/wechaty
 */
const {
  Wechaty,
  ScanStatus,
  log,
}               = require('wechaty')
const {PuppetPadlocal }=require('wechaty-puppet-padlocal')
/**
 * You can ignore the next line becasue it is using for CodeSandbox
 */
require('./.code-sandbox.js')

function onScan (qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console

    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')

    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage (msg) {
  log.info('StarterBot', msg.toString())

  if (msg.text() === 'ding') {
    await msg.say('dong')
  }
}

const bot = new Wechaty({
  name: 'ding-dong-bot',
  /**
   * Specify a puppet for a specific protocol (Web/Pad/Mac/Windows, etc).
   *
   * You can use the following providers:
   *  - wechaty-puppet-service
   *  - wechaty-puppet-puppeteer
   *  - etc.
   *
   * Learn more about Wechaty Puppet Providers at:
   *  https://github.com/wechaty/puppet-service-providers
   *
   * Learn more about Wechaty Puppet at:
   *  https://github.com/wechaty/wechaty-puppet/wiki/Directory
   */
  puppet: new PuppetPadlocal = ({
      token: puppet_paimon_0806bfcae0fa44a6526b055fb1f289e8
  })
  // Set as above, or set using environment variable WECHATY_PUPPET
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))

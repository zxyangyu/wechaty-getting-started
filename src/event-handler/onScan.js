/*
 * @Author: isboyjc
 * @Date: 2020-02-18 16:26:41
 * @LastEditors: isboyjc
 * @LastEditTime: 2020-02-18 16:26:42
 * @Description: 机器人需要扫描二维码时监听
 */
const Qrterminal = require("qrcode-terminal")
const { ScanStatus }=require('wechaty')
module.exports = function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    Qrterminal.generate(qrcode, { small: true })

    // Generate a QR Code online via
  // http://goqr.me/api/doc/create-qr-code/
  const qrcodeImageUrl = [
    'https://wechaty.js.org/qrcode/',
    encodeURIComponent(qrcode),
  ].join('')
    console.log(`onScan ${ScanStatus[status]}[${status}] - ${qrcodeImageUrl}\nScan QR Code above to log in: `)
  } else {
    console.log(`onScan ${ScanStatus[status]}[${status}] `)
  }

}

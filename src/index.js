/*
 * @Author: isboyjc
 * @Date: 2020-02-14 13:01:46
 * @LastEditors: zxyangyu
 * @LastEditTime: 2021-02-02
 * @Description: wechaty入口程序
 */

const { Wechaty } = require("wechaty") // Wechaty核心包
// const { hotImport} =require('hot-import')
// const { PuppetPadlocal} = require('wechaty-puppet-padlocal')
const config = require("./config") // 配置文件
const onScan = require("./event-handler/onScan") // 机器人需要扫描二维码时监听回调
const onRoomJoin = require("./event-handler/onRoomJoin") // 加入房间监听回调
const onMessage = require("./event-handler/onMessage") // 消息监听回调
const onFriendShip = require("./event-handler/onFriendShip") // 好友添加监听回调

// 初始化
const bot = new Wechaty({
  name: config.name,
  // puppet: new PuppetPadlocal({
  //   token: config.token
  // })

})

bot
  .on("scan", onScan) // 机器人需要扫描二维码时监听
  .on("room-join", onRoomJoin) // 加入房间监听
  .on("message", onMessage(bot)) // 消息监听
  .on("friendship", onFriendShip) // 好友添加监听
  .start()

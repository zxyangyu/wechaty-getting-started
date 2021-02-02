/*
 * @Author: isboyjc
 * @Date: 2020-02-18 16:31:25
 * @LastEditors: isboyjc
 * @LastEditTime: 2020-03-01 02:16:17
 * @Description: 消息监听回调
 */
const { Message,UrlLink } = require("wechaty")
// node-request请求模块包
const request = require("request")
// 请求参数解码
const urlencode = require("urlencode")
// 配置文件
const config = require("../config")
const rssParser = require('./rss')
// 机器人名字
const name = config.name
// 管理群组列表
const roomList = config.room.roomList

// 消息监听回调
module.exports = bot => {
  return async function onMessage(msg) {
    const contact = msg.talker()
    const room = msg.room()
    const reciver = msg.to()
    const text = msg.text()

    // 判断消息来自自己，直接return
    if (msg.self() || contact.name() === '微信团队' || contact.name() === '腾讯新闻' || msg.type() !== Message.Type.Text) return

    console.log("=============================")
    console.log(`msg : ${msg}`)
    console.log(
      `from: ${contact ? contact.name() : null}: ${
        contact ? contact.id : null
      }`
    )
    console.log(`to: ${reciver}`)
    console.log(`text: ${text}`)
    console.log(`isRoom: ${room}`)
    console.log("=============================")

    // 判断消息类型来自群聊
    if (room) {
      // 收到消息，提到自己
      if (!await msg.mentionSelf()){
        // 获取提到自己的名字
        let self = "@" + name
        // 获取消息内容，拿到整个消息文本，去掉 @+名字
        let getText = msg.text().replace(self, "").trim()

        // 请求机器人接口回复
        let res = await requestRobot(getText, contact)

        room.say(res)
        return
      }
    // 私聊信息处理
    } else {
      if (/^link$/i.test(text)) {
        const urlLink = new UrlLink({
          description: 'Wechaty is a Bot SDK for Wechat Individual Account which can help you create a bot in 6 lines of javascript, with cross-platform support including Linux, Windows, Darwin(OSX/Mac) and Docker.',
          // 缩略图
          thumbnailUrl: '',
          title: 'Wechaty',
          url: 'https://github.com/wechaty/wechaty',
        });
        await msg.say(urlLink);
        return
      }
      if (/^news$/i.test(text)){
        rssParser('gg').then((res) => {
          console.log(res)
          var item;
          var request=[];
          while (item = res.read()) {
            //一般我们在这里获取数据，在上面提到的，feedparser一共会输出两种信息，一种是规范化后的RSS2.0，另一种是原有的。
            //原有信息的获取：(推荐这种)
            let one_news = item.title + '\n' + item.description
            request.push(one_news)
          }
          msg.say(request.join('\n'));
          return
        }).catch((err)=>{
          console.log(err);
          return
          });
      }

      // 回复信息是关键字 “加群”
      if (await isAddRoom(msg)) return

      // 回复信息是所管理的群聊名
      if (await isRoomName(bot, msg)) return

      // 请求机器人聊天接口
      let res = await requestRobot(text,contact)
      // 返回聊天接口内容
      await msg.say(res)
    }
    }
}

/**
 * @description 群消息提到了自己
 * @param {Object} msg 消息对象
 * @return {Promise} true-是 false-不是
 */
async function mention(msg) {
  // 关键字 加群 处理
  if (msg.mentionSelf()) {
    return true
  }
  return false
}

/**
 * @description 回复信息是关键字 “加群” 处理函数
 * @param {Object} msg 消息对象
 * @return {Promise} true-是 false-不是
 */
async function isAddRoom(msg) {
  // 关键字 加群 处理
  if (msg.text() == "加群") {
    let roomListName = Object.keys(roomList)
    let info = `${name}当前管理群聊有${roomListName.length}个，回复群聊名即可加入哦\n\n`
    roomListName.map(v => {
      info += "【" + v + "】" + "\n"
    })
    msg.say(info)
    return true
  }
  return false
}

/**
 * @description 回复信息是所管理的群聊名 处理函数
 * @param {Object} bot 实例对象
 * @param {Object} msg 消息对象
 * @return {Promise} true-是群聊 false-不是群聊
 */
async function isRoomName(bot, msg) {
  // 回复信息为管理的群聊名
  if (Object.keys(roomList).some(v => v == msg.text())) {
    // 通过群聊id获取到该群聊实例
    const room = await bot.Room.find({ id: roomList[msg.text()] })

    // 判断是否在房间中 在-提示并结束
    if (await room.has(msg.talker())) {
      await msg.say("您已经在房间中了")
      return true
    }

    // 发送群邀请
    await room.add(msg.talker())
    await msg.say("已发送群邀请")
    return true
  }
  return false
}

/**
 * @description 机器人请求接口 处理函数
 * @param {String} info 接受到的消息
 * @return {Promise} 相应内容
 */
function requestRobot(info,contact) {
  return new Promise((resolve, reject) => {
    let url =`${config.chatApi}?q=${urlencode(info)}&app_key=${config.chatKey}&user_id=${urlencode(contact.name())}-${contact.id}`
    // let url = `https://open.drea.cc/bbsapi/chat/get?keyWord=${urlencode(info)}`
    console.log(url)
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body)
        let send = res.result.intents[0].outputs[0].property.text
        if ((res.code == 0 || res.code == 200) && send) {
          // 免费的接口，所以需要把机器人名字替换成为自己设置的机器人名字
          // send = send.replace(/Smile/g, name)
          resolve(send)
        } else {
          if (res.code == 429) {
            resolve("没事别老艾特我，我还以为爱情来了")
          } else {
            resolve("你在说什么，我听不懂")
          }
        }
      } else {
        resolve("你在说什么，我脑子有点短路诶！")
      }
    })
  })
}

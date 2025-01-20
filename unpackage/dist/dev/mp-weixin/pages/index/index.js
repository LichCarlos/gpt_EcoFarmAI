"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_MenuButton = require("../../api/MenuButton.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "051b65ec": common_vendor.unref(api_MenuButton.MenuButton)().seViewHeight,
      "aa7ce072": common_vendor.unref(api_MenuButton.MenuButton)().top,
      "041c5516": common_vendor.unref(api_MenuButton.MenuButton)().height
    }));
    const name = common_vendor.ref("EcoFarmAI");
    const greetSb = common_vendor.ref("你好，我是您的智慧农业助手，人工智能EcoFarmAI，您可以叫我小E，现在我可以为您提供智慧农业解决方案。");
    const problemDate = common_vendor.ref([
      "小E，帮我介绍一下什么是智慧农业",
      "小E，智慧农业可以给我们的生活提供什么帮助",
      "小E，帮我推荐几家农业庄园",
      "小E，帮我推荐些，好玩的智慧农业体验项目"
    ]);
    const text = common_vendor.ref("");
    const SocketTask = common_vendor.ref(null);
    const historyTestList = common_vendor.ref([]);
    const sparResult = common_vendor.ref("");
    const messageData = common_vendor.ref([]);
    const sendIngState = common_vendor.ref(false);
    async function sendMessage() {
      if (text.value.trim().length > 0) {
        text.value = text.value.trim();
      } else {
        common_vendor.wx$1.showToast({ title: "请输入询问内容", icon: "none" });
        return false;
      }
      if (sendIngState.value) {
        common_vendor.wx$1.showToast({ title: "ai正在回复中", icon: "none" });
        return false;
      }
      messageData.value.push({
        "role": "user",
        "content": text.value
      });
      messageData.value.push({
        "role": "assistant",
        "content": "",
        "loadShow": true,
        "copyIcon": false
      });
      sparResult.value = "";
      sendIngState.value = true;
      const wssUrl = await common_vendor.wx$1.cloud.callFunction({ name: "gpt-wx" });
      SocketTask.value = common_vendor.index.connectSocket({
        url: wssUrl.result.url,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:121", res, "ws连接成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:124", err, "ws连接失败");
          common_vendor.wx$1.showToast({ title: "出现异常", icon: "none" });
          messageData.value = [];
          sendIngState.value = false;
        }
      });
      SocketTask.value.onError((res) => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:132", "错误", res);
        common_vendor.wx$1.showToast({ title: "出现异常", icon: "none" });
        messageData.value = [];
        sendIngState.value = false;
      });
      SocketTask.value.onOpen((data) => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:139", "成功，可以发送消息了", data);
        historyTestList.value.push({
          "role": "user",
          "content": text.value
        });
        text.value = "";
        let parms = {
          "header": {
            "app_id": wssUrl.result.APPID
            // "app_id": appid	
          },
          "parameter": {
            "chat": {
              "domain": "4.0Ultra",
              //核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
              "temperature": 0.5
            }
          },
          "payload": {
            "message": {
              "text": historyTestList.value
            }
          }
        };
        SocketTask.value.send({
          data: JSON.stringify(parms),
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/index/index.vue:167", "消息发送成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/index/index.vue:170", "消息发送失败");
            common_vendor.wx$1.showToast({ title: "出现异常", icon: "none" });
            messageData.value = [];
            sendIngState.value = false;
          }
        });
      });
      returnMessage();
    }
    function returnMessage() {
      SocketTask.value.onMessage((res) => {
        messageData.value[messageData.value.length - 1].loadShow = false;
        const obj = JSON.parse(res.data);
        common_vendor.index.__f__("log", "at pages/index/index.vue:184", obj);
        if (obj.header.code !== 0) {
          sparResult.value += obj.header.message;
          messageData.value[messageData.value.length - 1].content = sparResult.value;
          sendIngState.value = false;
          messageData.value[messageData.value.length - 1].copyIcon = true;
          return false;
        }
        const dataArry = obj.payload.choices.text;
        dataArry.forEach((item) => {
          sparResult.value += item.content;
          messageData.value[messageData.value.length - 1].content = sparResult.value;
        });
        common_vendor.wx$1.pageScrollTo({
          scrollTop: 3e3
        });
        if (obj.header.code === 0 && obj.header.status === 2) {
          historyTestList.value.push({
            "role": "assistant",
            "content": sparResult.value
          });
          messageData.value[messageData.value.length - 1].copyIcon = true;
          sendIngState.value = false;
        }
      });
    }
    function copyData(val) {
      common_vendor.wx$1.setClipboardData({ data: val });
    }
    function clearMessage() {
      if (sendIngState.value) {
        common_vendor.wx$1.showToast({ title: "ai正在回复中", icon: "none" });
        return false;
      }
      sparResult.value = "";
      historyTestList.value = [];
      messageData.value = [];
    }
    function selectText(val) {
      text.value = val;
      sendMessage();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.t(name.value),
        c: common_vendor.s(_ctx.__cssVars()),
        d: common_vendor.s({
          height: common_vendor.unref(api_MenuButton.MenuButton)().seViewHeight
        }),
        e: common_vendor.s(_ctx.__cssVars()),
        f: messageData.value.length <= 0
      }, messageData.value.length <= 0 ? {
        g: common_vendor.t(greetSb.value),
        h: common_vendor.s(_ctx.__cssVars())
      } : {}, {
        i: messageData.value.length <= 0
      }, messageData.value.length <= 0 ? {
        j: common_assets._imports_1,
        k: common_vendor.f(problemDate.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.o(($event) => selectText(item), index)
          };
        }),
        l: common_vendor.s(_ctx.__cssVars())
      } : {}, {
        m: common_vendor.f(messageData.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.role == "user"
          }, item.role == "user" ? {
            b: common_assets._imports_2,
            c: common_vendor.t(item.content)
          } : common_vendor.e({
            d: item.loadShow
          }, item.loadShow ? {} : {}, {
            e: item.content != ""
          }, item.content != "" ? common_vendor.e({
            f: common_vendor.t(item.content),
            g: item.copyIcon
          }, item.copyIcon ? {
            h: common_vendor.o(($event) => copyData(item.content), index),
            i: common_assets._imports_3
          } : {}) : {}), {
            j: index
          });
        }),
        n: common_vendor.s(_ctx.__cssVars()),
        o: common_vendor.o(clearMessage),
        p: common_assets._imports_4,
        q: common_vendor.o(sendMessage),
        r: sendIngState.value,
        s: text.value,
        t: common_vendor.o(($event) => text.value = $event.detail.value),
        v: common_assets._imports_5,
        w: common_vendor.o(sendMessage),
        x: common_vendor.s(_ctx.__cssVars()),
        y: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map

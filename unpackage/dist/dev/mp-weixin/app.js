"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      let menuButtonInfo = common_vendor.index.getStorageSync("MenuButton");
      if (!menuButtonInfo) {
        const menuButtonInfo2 = common_vendor.index.getMenuButtonBoundingClientRect();
        common_vendor.index.setStorageSync("MenuButton", menuButtonInfo2);
      }
      common_vendor.wx$1.cloud.init({
        env: "nygot-7gxsby4r865963df"
      });
    });
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map

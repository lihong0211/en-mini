"use strict";
const common_vendor = require("../../common/vendor.js");
const common_request = require("../../common/request.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      list: [],
      mastered: 2
    };
  },
  onLoad() {
    this.getList();
  },
  onShareAppMessage() {
    return {
      title: "欢迎体验悄咪记单词",
      path: "/pages/words"
    };
  },
  onNavigationBarButtonTap(e) {
    common_vendor.index.navigateTo({
      url: "/pages/words"
    });
  },
  methods: {
    getList() {
      common_request.request({
        url: "words/list",
        data: {
          page: 1,
          size: 1e4,
          query: {
            mastered: this.mastered
          }
        }
      }).then((res) => {
        var _a, _b, _c;
        const ret = [];
        for (let i = 0; i < Math.min(20, (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.length); i++) {
          let idx = Math.floor(Math.random() * ((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.length));
          ret.push(res == null ? void 0 : res.data[idx]);
          (_c = res == null ? void 0 : res.data) == null ? void 0 : _c.splice(idx, 1);
        }
        this.list = ret;
      });
    },
    changePage({ type, current }) {
      this.page = type === "next" ? Math.min(current, Math.round(this.total / 20)) : Math.max(current, 1);
      this.getList();
    },
    playAudio(word) {
      const innerAudioContext = common_vendor.index.createInnerAudioContext();
      innerAudioContext.autoplay = true;
      innerAudioContext.src = `http://dict.youdao.com/dictvoice?audio=${word}`;
      innerAudioContext.onPlay(() => {
      });
      innerAudioContext.onError((res) => {
        console.log(res.errMsg);
      });
    },
    handleInput(e, idx) {
      this.list[idx].test = e.target.value;
    },
    changeType(e) {
      this.mastered = e.target.value ? 1 : 2;
    },
    help(idx) {
      this.list[idx].test = this.list[idx].word;
    },
    cancelHelp(idx) {
      this.list[idx].test = "";
    }
  }
};
if (!Array) {
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  _easycom_uni_card2();
}
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  _easycom_uni_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.list, (item, idx, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.meaning),
        b: !item.test
      }, !item.test ? {
        c: common_assets._imports_0
      } : {}, {
        d: item.test && item.test !== item.word
      }, item.test && item.test !== item.word ? {
        e: common_assets._imports_1
      } : {}, {
        f: item.test && item.test === item.word
      }, item.test && item.test === item.word ? {
        g: common_assets._imports_2
      } : {}, {
        h: !idx
      }, !idx ? {
        i: item.test,
        j: common_vendor.o((e) => $options.handleInput(e, idx), item.word)
      } : {
        k: item.test,
        l: common_vendor.o((e) => $options.handleInput(e, idx), item.word)
      }, {
        m: item.test && item.test === item.word
      }, item.test && item.test === item.word ? {
        n: common_assets._imports_3,
        o: common_vendor.o(($event) => $options.cancelHelp(idx), item.word)
      } : {
        p: common_vendor.o(($event) => $options.help(idx), item.word)
      }, {
        q: item.word,
        r: "74209e7a-0-" + i0
      });
    }),
    b: $data.mastered === 1,
    c: common_vendor.o((...args) => $options.changeType && $options.changeType(...args)),
    d: common_vendor.o((...args) => $options.getList && $options.getList(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/lihong/Desktop/en/hello-uniapp/pages/test/test.vue"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);

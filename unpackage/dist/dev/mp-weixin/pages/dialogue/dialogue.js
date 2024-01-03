"use strict";
const common_vendor = require("../../common/vendor.js");
const common_request = require("../../common/request.js");
const _sfc_main = {
  data() {
    return {
      total: 0,
      page: 1,
      list: []
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
        url: "dialogue/list",
        method: "GET",
        data: {
          page: this.page,
          size: 20
        }
      }).then((res) => {
        this.list = res.data;
        this.total = res.total;
        this.page = res.page;
      });
    },
    changePage({ type, current }) {
      this.page = type === "next" ? Math.min(current, Math.round(this.total / 20)) : Math.max(current, 1);
      this.getList();
    }
  }
};
if (!Array) {
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_pagination2 = common_vendor.resolveComponent("uni-pagination");
  (_easycom_uni_card2 + _easycom_uni_pagination2)();
}
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_pagination = () => "../../uni_modules/uni-pagination/components/uni-pagination/uni-pagination.js";
if (!Math) {
  (_easycom_uni_card + _easycom_uni_pagination)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: common_vendor.f(item.dialogue, (it, k1, i1) => {
          return {
            a: common_vendor.t(it.dialogue),
            b: "4c90f3ba-0-" + i0 + "-" + i1,
            c: common_vendor.t(it.meaning),
            d: "4c90f3ba-1-" + i0 + "-" + i1,
            e: it.dialogue
          };
        }),
        b: common_vendor.f(item.words, (it, k1, i1) => {
          return {
            a: common_vendor.t(it.word),
            b: common_vendor.t(it.meaning),
            c: it.dialogue,
            d: "4c90f3ba-2-" + i0 + "-" + i1
          };
        }),
        c: item.url
      };
    }),
    b: $data.list.length
  }, $data.list.length ? {
    c: common_vendor.o($options.changePage),
    d: common_vendor.p({
      ["show-icon"]: "true",
      total: $data.total,
      pageSize: "20",
      current: $data.page
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/lihong/Desktop/en/hello-uniapp/pages/dialogue/dialogue.vue"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);

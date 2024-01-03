"use strict";
const common_vendor = require("./vendor.js");
const baseUrl = "http://8.137.107.171/api/";
async function request({ url, method = "POST", data }) {
  return common_vendor.index.request({
    url: baseUrl + url,
    method,
    data
  }).then((res) => {
    var _a;
    return (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data;
  });
}
exports.request = request;

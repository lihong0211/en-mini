export const isDev = process.env.NODE_ENV === "development";

// #ifdef MP-WEIXIN
// 真机跟手机不在同一台电脑上，localhost 连不到本地开发服务器；
// 开发环境走 frp 域名穿透到本地 service-ali，正式环境走线上部署的接口
export const apiHost = isDev ? "https://home.doctor-dog.com/ali" : "https://api.doctor-dog.com";
// #endif

// #ifndef MP-WEIXIN
export const apiHost = isDev ? "http://localhost:3000" : "https://api.doctor-dog.com";
// #endif

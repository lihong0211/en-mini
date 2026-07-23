import { apiHost } from "./env";

const baseUrl = apiHost + "/en-desktop/";
const TOKEN_KEY = "en_desktop_token";

export function getToken() {
	return uni.getStorageSync(TOKEN_KEY);
}

export function setToken(token) {
	uni.setStorageSync(TOKEN_KEY, token);
}

function rawRequest(url, method, data) {
	const token = uni.getStorageSync(TOKEN_KEY);
	const header = token ? { Authorization: `Bearer ${token}` } : {};
	return uni.request({ url: baseUrl + url, method, data, header }).then((res) => res.data);
}

// 同一时刻可能有多个 request() 并发触发登录（比如 onShow 里几个接口一起发）。
// 后端 token 是单设备在线、每次登录都会覆盖上一个：如果不去重，并发的每个 login()
// 各自换一个新 token，互相覆盖，输的那个请求会拿着已经失效的 token 再次 401。
// 用同一个 in-flight Promise 让并发调用共享同一次登录，从根上消除这个竞态。
let loginPromise = null;

function login() {
	if (loginPromise) return loginPromise;
	loginPromise = new Promise((resolve, reject) => {
		uni.login({
			success: (loginRes) => {
				rawRequest("auth/wechat/mini-login", "POST", { code: loginRes.code })
					.then((res) => {
						if (res.code !== 200) return reject(new Error(res.msg || "登录失败"));
						uni.setStorageSync(TOKEN_KEY, res.data.token);
						resolve(res.data.token);
					})
					.catch(reject);
			},
			fail: reject,
		});
	}).finally(() => {
		loginPromise = null;
	});
	return loginPromise;
}

export default async function request({ url, method = "POST", data }) {
	if (!uni.getStorageSync(TOKEN_KEY)) {
		await login().catch(() => {});
	}
	let res = await rawRequest(url, method, data);
	if (res.code === 401) {
		await login();
		res = await rawRequest(url, method, data);
	}
	if (res.code !== 200) {
		uni.showToast({ title: res.msg || "请求失败", icon: "none", duration: 2000 });
		throw new Error(res.msg || "请求失败");
	}
	return res.data;
}

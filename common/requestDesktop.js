import { apiHost } from "./env";

const baseUrl = apiHost + "/en-desktop/";
const TOKEN_KEY = "en_desktop_token";

function rawRequest(url, method, data) {
	const token = uni.getStorageSync(TOKEN_KEY);
	const header = token ? { Authorization: `Bearer ${token}` } : {};
	return uni.request({ url: baseUrl + url, method, data, header }).then((res) => res.data);
}

function login() {
	return new Promise((resolve, reject) => {
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
	});
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

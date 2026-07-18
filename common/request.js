import { apiHost } from "./env";

const baseUrl = apiHost + "/english/";
export default async function ({ url, method = "POST", data }) {
	return uni
		.request({
			url: baseUrl + url,
			method,
			data,
		})
		.then((res) => {
			if (res.statusCode < 200 || res.statusCode >= 300) {
				throw new Error(res?.data?.message || `请求失败(${res.statusCode})`);
			}
			return res?.data?.data;
		})
		.catch((err) => {
			uni.showToast({
				title: err?.message || err?.errMsg || "网络请求失败",
				icon: "none",
				duration: 2000,
			});
			throw err;
		});
}

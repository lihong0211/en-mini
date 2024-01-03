const baseUrl = "http://8.137.107.171/api/";
export default async function ({ url, method = "POST", data }) {
	return uni
		.request({
			url: baseUrl + url,
			method,
			data,
		})
		.then((res) => res?.data?.data);
}

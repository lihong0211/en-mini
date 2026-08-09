import { apiHost } from './env'

// 面试题复习是私人功能，/english/* 系列接口不鉴权，不需要 requestDesktop.js 那套
// wechat 静默登录 + token 逻辑
const baseUrl = apiHost + '/english/'

export default function request({ url, method = 'POST', data }) {
	return uni.request({ url: baseUrl + url, method, data }).then((res) => res.data).then((body) => {
		if (body.code !== 200) {
			uni.showToast({ title: body.msg || '请求失败', icon: 'none', duration: 2000 })
			throw new Error(body.msg || '请求失败')
		}
		return body.data
	})
}

export function uploadFile(url, filePath, formData) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: baseUrl + url,
			filePath,
			name: 'file',
			formData,
			success: (res) => {
				let body
				try {
					body = JSON.parse(res.data)
				} catch (e) {
					uni.showToast({ title: '上传响应解析失败', icon: 'none' })
					reject(e)
					return
				}
				if (body.code !== 200) {
					uni.showToast({ title: body.msg || '上传失败', icon: 'none' })
					reject(new Error(body.msg || '上传失败'))
					return
				}
				resolve(body.data)
			},
			fail: (err) => {
				uni.showToast({ title: '上传失败', icon: 'none' })
				reject(err)
			}
		})
	})
}

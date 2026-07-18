export default {
	data() {
		return {
			total: 0,
			page: 1
		};
	},
	onShareAppMessage() {
		return {
			title: '欢迎体验悄咪学英语',
			path: '/pages/words'
		}
	},
	onNavigationBarButtonTap(e) {
		uni.navigateTo({
			url: '/pages/words'
		});
	},
	methods: {
		changePage({ type, current }) {
			this.page = type === 'next' ? (Math.min(current, Math.round(this.total / 20))) : (Math.max(current, 1))
			this.getList()
		}
	}
}

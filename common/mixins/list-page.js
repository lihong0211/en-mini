import { getNavBarInfo } from '~@/common/util'

export default {
	data() {
		return {
			total: 0,
			page: 1,
			safeTop: 0
		};
	},
	onLoad() {
		this.safeTop = getNavBarInfo().top
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
		goToPage(page) {
			this.page = page
			this.getList()
		}
	}
}

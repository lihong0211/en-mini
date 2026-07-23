<template>
	<view class="nb-back-btn" :style="{ top: top + 'px' }" @click="goBack">
		<text class="nb-back-icon">‹</text>
	</view>
</template>
<script>
import { getNavBarInfo } from '~@/common/util'

export default {
	data() {
		return {
			top: 20
		}
	},
	created() {
		const info = getNavBarInfo()
		this.top = info.statusBarHeight + (info.navBarHeight - 32) / 2
	},
	methods: {
		goBack() {
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack()
			} else {
				uni.switchTab({ url: '/pages/words/words' })
			}
		}
	}
}
</script>
<style>
.nb-back-btn {
	position: fixed;
	left: 12px;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.nb-back-icon {
	color: #fff;
	font-size: 22px;
	line-height: 1;
}
</style>

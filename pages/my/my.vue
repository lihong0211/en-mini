<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="nb-scroll">
			<view class="section" v-if="ownLibraries.length">
				<view class="section-title">自建词库</view>
				<view class="lib-card" v-for="lib in ownLibraries" :key="lib.id" @click="openLibrary(lib)">
					<text class="lib-name">{{ lib.name }}</text>
					<text class="lib-count">{{ lib.word_count }} 词</text>
				</view>
			</view>

			<view class="section" v-if="favoriteLibraries.length">
				<view class="section-title">收藏词库</view>
				<view class="lib-card" v-for="lib in favoriteLibraries" :key="lib.id" @click="openLibrary(lib)">
					<text class="lib-name">{{ lib.name }}</text>
					<text class="lib-count">{{ lib.word_count }} 词</text>
				</view>
			</view>

			<view v-if="!ownLibraries.length && !favoriteLibraries.length" class="nb-empty">
				还没有词库，去词库列表收藏几个吧
			</view>
		</view>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import { getNavBarInfo } from '~@/common/util'
import bgImage from '~@/common/bg-image.vue'

export default {
	components: { bgImage },
	data() {
		return {
			ownLibraries: [],
			favoriteLibraries: [],
			safeTop: 0
		};
	},
	onShow() {
		this.safeTop = getNavBarInfo().top
		this.getLibraries()
	},
	methods: {
		getLibraries() {
			request({
				url: 'libraries/list',
				method: 'GET'
			}).then((data) => {
				this.ownLibraries = data
			}).catch(() => {})

			request({
				url: 'libraries/favorites',
				method: 'GET'
			}).then((data) => {
				this.favoriteLibraries = data
			}).catch(() => {})
		},
		openLibrary(lib) {
			uni.navigateTo({
				url: `/pages/library-detail/library-detail?id=${lib.id}&name=${encodeURIComponent(lib.name)}`
			});
		}
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/notebook-theme.css';

.section {
	margin-top: 22px;
}

.section:first-child {
	margin-top: 0;
}

.section-title {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 15px;
	font-weight: 700;
	color: var(--ink-soft);
	padding: 0 16px;
	margin-bottom: 8px;
}

.lib-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border-radius: 6px;
	margin: 10px 16px 0;
	padding: 14px 16px;
}

.lib-name {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 16px;
	font-weight: 700;
	color: var(--ink);
}

.lib-count {
	color: var(--ink-soft);
	font-size: 12px;
	font-family: "Courier New", monospace;
}
</style>

<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="nb-scroll">
			<view class="catalog-card" v-for="item in list" :key="item.id" @click="openLibrary(item)">
				<view class="catalog-head">
					<text class="catalog-name">{{ item.name }}</text>
					<view class="catalog-meta">
						<text class="catalog-count">{{ item.word_count }} 词</text>
						<view class="favorite-btn" :class="{ on: item.favorited }" @click.stop="toggleFavorite(item)">
							<text class="favorite-icon">{{ item.favorited ? '★' : '☆' }}</text>
						</view>
					</view>
				</view>
				<text class="catalog-desc" v-if="item.description">{{ item.description }}</text>
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
			list: [],
			safeTop: 0
		};
	},
	onLoad() {
		this.safeTop = getNavBarInfo().top
		this.getList()
	},
	onShareAppMessage() {
		return {
			title: '欢迎体验悄咪学英语',
			path: '/pages/libraries/libraries'
		}
	},
	methods: {
		getList() {
			request({
				url: 'libraries/public',
				method: 'GET'
			}).then((data) => {
				this.list = data
			}).catch(() => {})
		},
		toggleFavorite(item) {
			request({
				url: item.favorited ? 'libraries/unfavorite' : 'libraries/favorite',
				data: { library_id: item.id }
			}).then(() => {
				item.favorited = !item.favorited
			}).catch(() => {})
		},
		openLibrary(item) {
			getApp().globalData.activeLibrary = { id: item.id, name: item.name }
			uni.switchTab({ url: '/pages/words/words' })
		}
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/notebook-theme.css';

.catalog-card {
	position: relative;
	background-color: var(--paper);
	border-radius: 6px;
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	margin: 22px 16px 0;
	padding: 18px 16px 14px;
}

.catalog-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.catalog-meta {
	display: flex;
	align-items: center;
	gap: 8px;
}

.favorite-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	margin: -4px;
}

.favorite-icon {
	font-size: 18px;
	line-height: 1;
	color: var(--ink-soft);
	/* ★ 字形在字号内偏下沉，视觉上跟旁边文字对不齐，往上提一点 */
	transform: translateY(-1px);
}

.favorite-btn.on .favorite-icon {
	color: var(--highlight-ink);
}

.catalog-name {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 18px;
	font-weight: 700;
	color: var(--ink);
}

.catalog-count {
	color: var(--ink-soft);
	font-size: 12px;
	font-family: "Courier New", monospace;
	line-height: 18px;
}

.catalog-desc {
	display: block;
	color: var(--ink-soft);
	font-size: 13px;
	margin-top: 6px;
	line-height: 1.5;
}

</style>

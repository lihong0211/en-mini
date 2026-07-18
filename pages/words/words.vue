<template>
	<view class="nb-page">
		<view class="nb-scroll">
			<view class="catalog-card" v-for="item in list" :key="item.id" @click="openLibrary(item)">
				<view class="catalog-tab">{{ item.name.charAt(0) }}</view>
				<view class="catalog-head">
					<text class="catalog-name">{{ item.name }}</text>
					<text class="catalog-count">{{ item.word_count }} 词</text>
				</view>
				<text class="catalog-desc" v-if="item.description">{{ item.description }}</text>
				<view class="catalog-foot" @click.stop="toggleFavorite(item)">
					<text class="star" :class="{ active: item.favorited }">{{ item.favorited ? '★' : '☆' }}</text>
					<text class="favorite-label">{{ item.favorited ? '已收藏' : '收藏' }}</text>
				</view>
			</view>
			<view v-if="!list.length" class="nb-empty">词库柜暂时是空的，稍后再来看看</view>
		</view>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'

export default {
	data() {
		return {
			list: []
		};
	},
	onLoad() {
		this.getList()
	},
	onShareAppMessage() {
		return {
			title: '欢迎体验悄咪学英语',
			path: '/pages/words'
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
			uni.navigateTo({
				url: `/pages/library-detail/library-detail?id=${item.id}&name=${encodeURIComponent(item.name)}`
			});
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
	background-image: repeating-linear-gradient(var(--paper) 0px, var(--paper) 27px, var(--rule) 28px);
	border-radius: 6px;
	border-left: 3px solid var(--margin);
	box-shadow: 0 2px 8px rgba(30, 42, 68, 0.10);
	margin: 22px 16px 0;
	padding: 18px 16px 14px;
}

.catalog-tab {
	position: absolute;
	top: -11px;
	left: 22px;
	width: 26px;
	height: 20px;
	background: var(--ink);
	color: var(--paper);
	font-size: 13px;
	font-weight: 600;
	text-align: center;
	line-height: 20px;
	border-radius: 3px 3px 0 0;
}

.catalog-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
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
}

.catalog-desc {
	display: block;
	color: var(--ink-soft);
	font-size: 13px;
	margin-top: 6px;
	line-height: 1.5;
}

.catalog-foot {
	display: flex;
	align-items: center;
	margin-top: 14px;
	padding-top: 10px;
	border-top: 1px dashed var(--rule);
}

.star {
	font-size: 16px;
	color: var(--ink-soft);
	margin-right: 4px;
}

.star.active {
	color: var(--highlight-ink);
}

.favorite-label {
	font-size: 13px;
	color: var(--ink-soft);
}
</style>

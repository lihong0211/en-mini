<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="nb-scroll">
			<view class="catalog-card" v-for="item in list" :key="item.id" @click="openLibrary(item)">
				<view class="favorite-btn" @click.stop="toggleFavorite(item)">
					<image class="favorite-icon" :src="item.favorited ? likeOnSrc : likeSrc" mode="aspectFit" />
				</view>
				<view class="catalog-head">
					<text class="catalog-name">{{ item.name }}</text>
					<text class="catalog-count">{{ item.word_count }} 词</text>
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
import likeSrc from '~@/static/like.png'
import likeOnSrc from '~@/static/like-on.png'

export default {
	components: { bgImage },
	data() {
		return {
			list: [],
			safeTop: 0,
			likeSrc,
			likeOnSrc
		};
	},
	onLoad() {
		this.safeTop = getNavBarInfo().top
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
	border-radius: 6px;
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	margin: 22px 16px 0;
	padding: 18px 16px 14px;
}

.catalog-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	padding-right: 30px;
}

.favorite-btn {
	position: absolute;
	top: 14px;
	right: 14px;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.favorite-icon {
	width: 20px;
	height: 20px;
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

</style>

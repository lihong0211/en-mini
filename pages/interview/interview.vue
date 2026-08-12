<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="nb-scroll">
			<view class="filter-bar">
				<picker :range="categoryPickerRange" :value="categoryPickerIndex" @change="onCategoryChange">
					<view class="filter-item">{{ categoryPickerRange[categoryPickerIndex] }}</view>
				</picker>
				<picker :range="masteryPickerRange" :value="masteryPickerIndex" @change="onMasteryChange">
					<view class="filter-item">{{ masteryPickerRange[masteryPickerIndex] }}</view>
				</picker>
			</view>

			<view v-if="loading" class="nb-empty">加载中…</view>

			<template v-else>
				<view class="q-row" v-for="item in filteredList" :key="item.id" @click="goDetail(item)">
					<view class="q-row-main">
						<text class="q-row-title">{{ item.question }}</text>
						<text v-if="item.category" class="q-row-category">{{ mainCategory(item.category) }}</text>
					</view>
					<text class="q-row-mastery" @click.stop="onChangeMastery(item)">{{ item.mastery }}</text>
				</view>

				<view v-if="!filteredList.length" class="nb-empty">还没有题目</view>
			</template>
		</view>
	</view>
</template>

<script>
import request from '~@/common/requestEnglish'
import { getNavBarInfo } from '~@/common/util'
import bgImage from '~@/common/bg-image.vue'

const MASTERY_LEVELS = ['未复习', '需加强', '基本掌握', '已掌握']

export default {
	components: { bgImage },
	data() {
		return {
			list: [],
			loading: false,
			safeTop: 0,
			categoryFilter: '全部',
			masteryFilter: '全部'
		}
	},
	onShow() {
		this.safeTop = getNavBarInfo().top
		this.fetchList()
	},
	computed: {
		categoryPickerRange() {
			const categories = [...new Set(this.list.map((item) => this.mainCategory(item.category)).filter(Boolean))]
			return ['全部', ...categories]
		},
		categoryPickerIndex() {
			return this.categoryPickerRange.indexOf(this.categoryFilter)
		},
		masteryPickerRange() {
			return ['全部', '未复习', '需加强', '基本掌握', '已掌握']
		},
		masteryPickerIndex() {
			return this.masteryPickerRange.indexOf(this.masteryFilter)
		},
		filteredList() {
			return this.list.filter((item) => {
				if (this.categoryFilter !== '全部' && this.mainCategory(item.category) !== this.categoryFilter) return false
				if (this.masteryFilter !== '全部' && item.mastery !== this.masteryFilter) return false
				return true
			})
		}
	},
	methods: {
		fetchList() {
			this.loading = true
			request({ url: 'interview/list' }).then((data) => {
				this.list = data
			}).catch(() => {}).finally(() => {
				this.loading = false
			})
		},
		mainCategory(category) {
			return category ? category.split('/')[0] : category
		},
		goDetail(item) {
			uni.navigateTo({ url: '/pages/interview/detail?id=' + item.id })
		},
		onCategoryChange(e) {
			this.categoryFilter = this.categoryPickerRange[e.detail.value]
		},
		onMasteryChange(e) {
			this.masteryFilter = this.masteryPickerRange[e.detail.value]
		},
		onChangeMastery(item) {
			uni.showActionSheet({
				itemList: MASTERY_LEVELS,
				success: (res) => {
					const mastery = MASTERY_LEVELS[res.tapIndex]
					if (mastery === item.mastery) return
					request({
						url: 'interview/mastery/update',
						data: { id: item.id, mastery }
					}).then(() => {
						item.mastery = mastery
					}).catch(() => {})
				}
			})
		},
	}
}
</script>

<style>
@import '~@/common/notebook-theme.css';

.filter-bar {
	display: flex;
	gap: 10px;
	margin: 0 16px 16px;
}

.filter-item {
	color: var(--ink);
	font-size: 13px;
	padding: 6px 12px;
	border-radius: 8px;
	background-color: var(--paper-deep);
	border: 1px solid var(--rule);
}

.q-row {
	margin: 0 16px 10px;
	padding: 14px 16px;
	border-radius: 12px;
	background-color: var(--paper);
	border: 1px solid var(--rule);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.q-row-main {
	flex: 1;
	margin-right: 12px;
	min-width: 0;
}

.q-row-title {
	display: block;
	color: var(--ink);
	font-size: 15px;
	font-weight: 600;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.q-row-category {
	display: inline-block;
	margin-top: 6px;
	color: var(--ink-soft);
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 8px;
	border: 1px solid var(--rule);
}

.q-row-mastery {
	color: var(--margin);
	font-size: 13px;
	white-space: nowrap;
}
</style>

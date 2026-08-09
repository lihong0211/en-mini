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
				<view class="q-card" v-for="item in filteredList" :key="item.id">
					<view class="q-header">
						<text class="q-title">{{ item.question }}</text>
						<text class="q-mastery" @click="onChangeMastery(item)">{{ item.mastery }}</text>
					</view>
					<text v-if="item.category" class="q-category">{{ item.category }}</text>
					<view class="q-key-points">
						<text class="q-chip" v-for="(kp, i) in splitKeyPoints(item.key_points)" :key="i">{{ kp }}</text>
					</view>
					<text class="q-spoken-desc">{{ item.spoken_desc }}</text>
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
			const categories = [...new Set(this.list.map((item) => item.category).filter(Boolean))]
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
				if (this.categoryFilter !== '全部' && item.category !== this.categoryFilter) return false
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
		splitKeyPoints(keyPoints) {
			return (keyPoints || '').split(',').map((s) => s.trim()).filter(Boolean)
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
		}
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

.q-card {
	margin: 0 16px 16px;
	padding: 16px;
	border-radius: 12px;
	background-color: var(--paper);
	border: 1px solid var(--rule);
}

.q-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.q-title {
	flex: 1;
	color: var(--ink);
	font-size: 16px;
	font-weight: 600;
	margin-right: 12px;
}

.q-mastery {
	color: var(--margin);
	font-size: 13px;
	white-space: nowrap;
}

.q-category {
	display: inline-block;
	margin-top: 8px;
	color: var(--ink-soft);
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 8px;
	border: 1px solid var(--rule);
}

.q-key-points {
	margin-top: 10px;
	display: flex;
	flex-wrap: wrap;
}

.q-chip {
	color: var(--highlight-ink);
	font-size: 12px;
	background-color: rgba(245, 185, 64, 0.12);
	border-radius: 6px;
	padding: 3px 8px;
	margin: 0 6px 6px 0;
}

.q-spoken-desc {
	display: block;
	margin-top: 10px;
	color: var(--ink-soft);
	font-size: 14px;
	line-height: 1.6;
}
</style>

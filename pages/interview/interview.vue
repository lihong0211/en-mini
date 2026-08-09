<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="nb-scroll">
			<view v-if="loading" class="nb-empty">加载中…</view>

			<template v-else>
				<view class="q-card" v-for="item in list" :key="item.id">
					<view class="q-header">
						<text class="q-title">{{ item.question }}</text>
						<text class="q-mastery">{{ item.mastery }}</text>
					</view>
					<text v-if="item.category" class="q-category">{{ item.category }}</text>
					<view class="q-key-points">
						<text class="q-chip" v-for="(kp, i) in splitKeyPoints(item.key_points)" :key="i">{{ kp }}</text>
					</view>
					<text class="q-spoken-desc">{{ item.spoken_desc }}</text>
				</view>

				<view v-if="!list.length" class="nb-empty">还没有题目</view>
			</template>
		</view>
	</view>
</template>

<script>
import request from '~@/common/requestEnglish'
import { getNavBarInfo } from '~@/common/util'
import bgImage from '~@/common/bg-image.vue'

export default {
	components: { bgImage },
	data() {
		return {
			list: [],
			loading: false,
			safeTop: 0
		}
	},
	onShow() {
		this.safeTop = getNavBarInfo().top
		this.fetchList()
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
		}
	}
}
</script>

<style>
@import '~@/common/notebook-theme.css';

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

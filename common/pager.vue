<template>
	<view class="pager">
		<view class="pager-btn" :class="{ disabled: current <= 1 }" @click="prev">上一页</view>
		<text class="pager-info"><text class="pager-current">{{ current }}</text> / {{ totalPages }}</text>
		<view class="pager-btn" :class="{ disabled: current >= totalPages }" @click="next">下一页</view>
	</view>
</template>
<script>
export default {
	props: {
		current: {
			type: Number,
			default: 1
		},
		total: {
			type: Number,
			default: 0
		},
		pageSize: {
			type: Number,
			default: 20
		}
	},
	computed: {
		totalPages() {
			return Math.max(1, Math.ceil(this.total / this.pageSize))
		}
	},
	methods: {
		prev() {
			if (this.current <= 1) return
			this.$emit('change', this.current - 1)
		},
		next() {
			if (this.current >= this.totalPages) return
			this.$emit('change', this.current + 1)
		}
	}
}
</script>
<style>
.pager {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	background: var(--paper-deep);
	border-top: 1px solid rgba(232, 121, 249, 0.25);
}

.pager-btn {
	margin: 0 14px;
	padding: 6px 18px;
	border-radius: 20px;
	font-size: 13px;
	color: var(--ink);
	background: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.35);
}

.pager-btn.disabled {
	opacity: 0.35;
}

.pager-info {
	font-size: 13px;
	color: var(--ink-soft);
	font-family: "Courier New", monospace;
}

.pager-current {
	color: var(--margin);
	font-weight: 700;
}
</style>

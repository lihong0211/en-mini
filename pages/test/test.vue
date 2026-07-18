<template>
	<view class="nb-page">
		<view class="nb-scroll quiz-scroll">
			<view class="quiz-card" v-for="(item, idx) in list" :key="item.word">
				<view class="quiz-num">{{ idx + 1 }}</view>
				<view class="quiz-body">
					<text class="quiz-meaning">{{ item.meaningText }}</text>
					<view class="answer-row">
						<input class="answer-input" :value="item.test" @input="e => handleInput(e, idx)"
							:focus="!idx" placeholder="写下这个单词…">
						<view class="answer-mark" :class="markClass(item)">
							<text v-if="item.test && item.test === item.word">✓</text>
						</view>
					</view>
					<view class="quiz-actions">
						<text v-if="item.test && item.test === item.word" class="clear-btn" @click="cancelHelp(idx)">重写</text>
						<text v-else class="hint-btn" @click="help(idx)">提示</text>
					</view>
				</view>
			</view>
			<view v-if="!list.length" class="nb-empty">这个词库还没有单词，去别的词库看看吧</view>
		</view>
		<view v-if="list.length" class="footer-bar">
			<text class="footer-label">{{ name }}</text>
			<view class="refresh-btn" @click="getList">换一批</view>
		</view>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import { playAudio } from '~@/common/util'

export default {
	data() {
		return {
			libraryId: null,
			name: '',
			list: []
		};
	},
	onLoad(query) {
		this.libraryId = query.library_id
		this.name = decodeURIComponent(query.name || '')
		this.getList()
	},
	methods: {
		getList() {
			request({
				url: `libraries/${this.libraryId}/words`,
				method: 'GET',
				data: { page: 1, page_size: 10000 }
			}).then((res) => {
				const data = (res?.list || []).map((item) => ({
					...item,
					meaningText: (item.meaning || []).map((m) => m.content).join('; ')
				}));
				const count = Math.min(20, data.length);
				const ret = [];
				for (let i = 0; i < count; i++) {
					let idx = Math.floor(Math.random() * data.length);
					ret.push(data[idx]);
					data.splice(idx, 1)
				}
				this.list = ret
			}).catch(() => {})
		},

		markClass(item) {
			if (item.test && item.test === item.word) return 'done'
			if (item.test) return 'writing'
			return 'blank'
		},

		playAudio,
		handleInput(e, idx) {
			this.list[idx].test = e.target.value
		},
		help(idx) {
			this.list[idx].test = this.list[idx].word
		},
		cancelHelp(idx) {
			this.list[idx].test = ''
		}
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/notebook-theme.css';

.quiz-scroll {
	height: calc(100vh - 70px);
	padding: 16px 18px 24px;
}

.quiz-card {
	display: flex;
	padding: 14px 0;
	border-bottom: 1px dashed var(--rule);
}

.quiz-num {
	width: 22px;
	flex-shrink: 0;
	font-family: "Courier New", monospace;
	font-size: 13px;
	color: var(--ink-soft);
	padding-top: 2px;
}

.quiz-body {
	flex: 1;
}

.quiz-meaning {
	font-size: 15px;
	color: var(--ink);
	line-height: 1.5;
}

.answer-row {
	display: flex;
	align-items: center;
	margin-top: 10px;
}

.answer-input {
	flex: 1;
	height: 32px;
	font-size: 16px;
	font-family: Georgia, "Times New Roman", serif;
	color: var(--ink);
	letter-spacing: 1px;
	border-bottom: 1px solid var(--ink-soft);
}

.answer-mark {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	margin-left: 10px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	box-sizing: border-box;
}

.answer-mark.blank {
	border: 1px dashed var(--rule);
}

.answer-mark.writing {
	border: 1px solid var(--ink-soft);
	background: var(--paper);
}

.answer-mark.done {
	border: 1px solid var(--margin);
	color: var(--margin);
	font-weight: 700;
}

.quiz-actions {
	margin-top: 6px;
	text-align: right;
}

.hint-btn {
	font-size: 12px;
	color: var(--ink-soft);
}

.clear-btn {
	font-size: 12px;
	color: var(--margin);
}

.footer-bar {
	height: 70px;
	width: 100%;
	position: absolute;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 18px;
	box-sizing: border-box;
	background: var(--paper-deep);
	border-top: 1px solid var(--rule);
}

.footer-label {
	font-family: Georgia, "Times New Roman", serif;
	color: var(--ink);
	font-size: 14px;
}

.refresh-btn {
	width: 100px;
	height: 36px;
	line-height: 36px;
	background-color: var(--highlight);
	border-radius: 4px;
	color: var(--highlight-ink);
	font-size: 15px;
	font-weight: 600;
	text-align: center;
}
</style>

<template>
	<view class="nb-page">
		<view class="deck-progress" v-if="list.length">{{ current + 1 }} / {{ total }}</view>

		<swiper class="deck" v-if="list.length" :current="current" @change="onSwipe">
			<swiper-item v-for="item in list" :key="item.id">
				<view class="card-wrap">
					<view class="card">
						<text class="card-word">{{ item.word }}</text>
						<view class="entry-phon">
							<text class="phon-chip">英 [{{ item.en_pronunciation }}]</text>
							<text class="phon-chip">美 [{{ item.us_pronunciation }}]</text>
							<view class="say-btn" @click="playAudio(item.word)">
								<text class="say-icon">🔊</text>
							</view>
						</view>
						<view class="meaning-list">
							<view class="entry-meaning" v-for="(m, i) in item.meaning" :key="i">
								<text class="pos-tag">{{ m.type }}</text>
								<text class="meaning-text">{{ m.content }}</text>
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<view v-if="!list.length" class="nb-empty">这个词库还没有单词，去别的词库看看吧</view>

		<view class="footer">
			<view class="test-entry" @click="goTest">去测试</view>
		</view>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import { playAudio } from '~@/common/util'

export default {
	data() {
		return {
			id: null,
			name: '',
			total: 0,
			page: 1,
			hasMore: true,
			list: [],
			current: 0
		};
	},
	onLoad(query) {
		this.id = query.id
		this.name = decodeURIComponent(query.name || '')
		uni.setNavigationBarTitle({ title: this.name })
		this.getList()
	},
	methods: {
		getList() {
			request({
				url: `libraries/${this.id}/words`,
				method: 'GET',
				data: { page: this.page, page_size: 20 }
			}).then((data) => {
				this.list = this.list.concat(data.list)
				this.total = data.total
				this.hasMore = this.list.length < data.total
			}).catch(() => {})
		},
		onSwipe(e) {
			const idx = e.detail.current
			this.current = idx
			if (this.hasMore && idx >= this.list.length - 3) {
				this.page += 1
				this.getList()
			}
		},
		goTest() {
			uni.navigateTo({
				url: `/pages/test/test?library_id=${this.id}&name=${encodeURIComponent(this.name)}`
			});
		},
		playAudio
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/notebook-theme.css';

.deck-progress {
	height: 40px;
	line-height: 40px;
	text-align: center;
	font-family: "Courier New", monospace;
	font-size: 13px;
	color: var(--ink-soft);
}

.deck {
	height: calc(100vh - 110px);
}

.card-wrap {
	height: 100%;
	box-sizing: border-box;
	padding: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.card {
	width: 100%;
	max-height: 48%;
	box-sizing: border-box;
	border-radius: 10px;
	border-left: 4px solid var(--margin);
	background-color: var(--paper);
	background-image: repeating-linear-gradient(var(--paper) 0px, var(--paper) 27px, var(--rule) 28px);
	box-shadow: 0 4px 16px rgba(30, 42, 68, 0.14);
	padding: 22px 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow-y: auto;
}

.card-word {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 28px;
	font-weight: 700;
	color: var(--ink);
	letter-spacing: 0.5px;
}

.entry-phon {
	display: flex;
	align-items: center;
	margin-top: 10px;
}

.phon-chip {
	font-family: "Courier New", monospace;
	font-size: 12px;
	color: var(--ink-soft);
	background: var(--paper-deep);
	border: 1px solid var(--rule);
	border-radius: 3px;
	padding: 2px 8px;
	margin: 0 4px;
}

.say-btn {
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background: var(--paper-deep);
	border: 1px solid var(--rule);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 4px;
}

.say-icon {
	font-size: 13px;
}

.meaning-list {
	width: 100%;
	margin-top: 14px;
	padding-top: 12px;
	border-top: 1px dashed var(--rule);
}

.entry-meaning {
	display: flex;
	align-items: baseline;
	margin-top: 6px;
	width: 100%;
}

.pos-tag {
	font-family: "Courier New", monospace;
	font-size: 12px;
	color: var(--margin);
	border: 1px solid var(--margin);
	border-radius: 3px;
	padding: 0 4px;
	margin-right: 8px;
	flex-shrink: 0;
}

.meaning-text {
	font-size: 14px;
	color: var(--ink);
	line-height: 1.5;
}

.footer {
	height: 70px;
	width: 100%;
	position: absolute;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	background: var(--paper-deep);
	border-top: 1px solid var(--rule);
}

.test-entry {
	width: 140px;
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

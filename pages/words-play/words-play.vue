<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<back-button />
		<swiper class="deck" v-if="list.length" :current="current" @change="onSwipe">
			<swiper-item v-for="item in list" :key="item.id">
				<view class="card-wrap">
					<view class="card">
						<view class="word-actions">
							<view class="word-star-btn" :class="{ on: item.favorited }" @click.stop="favoriteWord(item)">
								<text class="word-star-icon">{{ item.favorited ? '★' : '☆' }}</text>
							</view>
							<view class="word-favorite-btn" @click.stop="toggleReview(item)">
								<image class="word-favorite-icon" :src="reviewWordIds.has(item.id) ? likeOnSrc : likeSrc"
									mode="aspectFit" />
							</view>
						</view>
						<text class="card-word">{{ item.word }}</text>
						<view class="entry-phon">
							<text class="phon-chip">英 [{{ stripPhoneticBrackets(item.en_pronunciation) }}]</text>
							<text class="phon-chip">美 [{{ stripPhoneticBrackets(item.us_pronunciation) }}]</text>
							<view class="say-btn" @click="playAudio(item.word)">
								<text class="say-icon">🔊</text>
							</view>
						</view>
						<view class="meaning-list">
							<view class="entry-meaning" v-for="(m, i) in item.meaning" :key="i">
								<view class="meaning-row">
									<text class="pos-tag">{{ m.type }}</text>
									<text class="meaning-text">{{ m.content }}</text>
								</view>
								<view class="sentence" v-if="m.sentence">
									<view class="sentence-row">
										<text class="sentence-en">{{ m.sentence.en_text }}</text>
										<view class="sentence-say" v-if="m.sentence.audio_url"
											@click.stop="playAudioUrl(m.sentence.audio_url)">
											<text class="say-icon">🔊</text>
										</view>
									</view>
									<text class="sentence-zh" v-if="m.sentence.zh_text">{{ m.sentence.zh_text }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<text class="card-progress" v-if="list.length && playMode !== 'shuffle'">{{ current + 1 }} / {{ total }}</text>

		<view class="sentence-toggle" :class="{ active: sentenceAutoPlay }" v-if="list.length"
			@click="toggleSentenceAutoPlay">
			<image class="order-icon" :src="sentenceAutoPlay ? sentenceReadOnSrc : sentenceReadSrc" mode="aspectFit" />
		</view>

		<view class="advance-toggle" :class="{ active: autoAdvance }" v-if="list.length" @click="toggleAutoAdvance">
			<image class="order-icon" :src="autoAdvance ? autoAdvanceOnSrc : autoAdvanceSrc" mode="aspectFit" />
		</view>

		<view class="order-toggle" v-if="list.length" @click="cycleMode">
			<image class="order-icon" :src="modeIconSrc" mode="aspectFit" />
		</view>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import { playAudio, playAudioUrl, stripPhoneticBrackets, getNavBarInfo, WORD_VOLUME } from '~@/common/util'
import backButton from '~@/common/back-button.vue'
import bgImage from '~@/common/bg-image.vue'
import likeSrc from '~@/static/like.png'
import likeOnSrc from '~@/static/like-on.png'
import modeOrderSrc from '~@/static/mode-order.png'
import modeShuffleSrc from '~@/static/mode-shuffle.png'
import modeSingleSrc from '~@/static/mode-single.png'
import sentenceReadSrc from '~@/static/sentence-read.png'
import sentenceReadOnSrc from '~@/static/sentence-read-on.png'
import autoAdvanceSrc from '~@/static/auto-advance.png'
import autoAdvanceOnSrc from '~@/static/auto-advance-on.png'

const PLAY_MODES = ['order', 'shuffle', 'single']
const SINGLE_REPEAT_DELAY = 1500
const MODE_ICONS = {
	order: modeOrderSrc,
	shuffle: modeShuffleSrc,
	single: modeSingleSrc
}

export default {
	components: { backButton, bgImage },
	data() {
		return {
			id: null,
			name: '',
			total: 0,
			page: 1,
			hasMore: true,
			likeSrc,
			likeOnSrc,
			sentenceReadSrc,
			sentenceReadOnSrc,
			autoAdvanceSrc,
			autoAdvanceOnSrc,
			autoAdvance: false,
			orderedList: [],
			list: [],
			current: 0,
			safeTop: 0,
			playMode: 'order',
			orderIndex: 0,
			defaultLibraryId: null,
			reviewLibraryId: null,
			reviewWordIds: new Set(),
			sentenceAudioCtx: null,
			wordAudioCtx: null,
			advanceTimer: null,
			sentenceAutoPlay: false
		};
	},
	computed: {
		modeIconSrc() {
			return MODE_ICONS[this.playMode]
		},
		currentSentenceAudioUrls() {
			const item = this.list[this.current]
			if (!item) return []
			return (item.meaning || [])
				.filter((m) => m.sentence && m.sentence.audio_url)
				.map((m) => m.sentence.audio_url)
		}
	},
	onLoad(query) {
		this.id = query.id || null
		this.name = decodeURIComponent(query.name || '') || '全部单词'
		uni.setNavigationBarTitle({ title: this.name })
		this.safeTop = getNavBarInfo().top
		this.getList()
		this.getSystemLibraryIds()
	},
	onUnload() {
		this.stopSentenceAudio()
		this.stopWordAudio()
		this.clearAdvanceTimer()
	},
	methods: {
		getList() {
			// 从"单词"tab 带库进来就播那个库；没带（播的是"全部单词"）就查全站词库
			request({
				url: this.id ? `libraries/${this.id}/words` : 'words/list',
				method: 'GET',
				data: { page: this.page, page_size: 20 }
			}).then((data) => {
				const wasEmpty = !this.orderedList.length
				this.orderedList = this.orderedList.concat(data.list)
				this.list = this.playMode === 'shuffle' ? this.shuffleArray(this.orderedList) : this.orderedList.slice()
				this.total = data.total
				this.hasMore = this.orderedList.length < data.total
				if (wasEmpty && this.list.length) {
					this.playForWord(this.list[0].word)
				}
			}).catch(() => { })
		},
		onSwipe(e) {
			const idx = e.detail.current
			this.current = idx
			this.playForWord(this.list[idx].word)
			if (this.hasMore && idx >= this.list.length - 3) {
				this.page += 1
				this.getList()
			}
		},
		cycleMode() {
			// 顺序播放、单词循环用的是同一个（未打乱的）列表，两者共享同一个"播到哪了"
			// 的位置：离开其中一个时记下来，进入另一个（或切回顺序播放）时接着播，不用
			// 从头开始。只有随机播放每次都是全新打乱，没有"续播位置"这一说。
			if (this.playMode !== 'shuffle') {
				this.orderIndex = this.current
			}

			const idx = PLAY_MODES.indexOf(this.playMode)
			this.playMode = PLAY_MODES[(idx + 1) % PLAY_MODES.length]

			if (this.playMode === 'shuffle') {
				this.list = this.shuffleArray(this.orderedList)
				this.current = 0
			} else {
				this.list = this.orderedList.slice()
				this.current = Math.min(this.orderIndex, Math.max(this.list.length - 1, 0))
			}

			if (this.list.length) {
				this.playForWord(this.list[this.current].word)
			}
		},
		toggleAutoAdvance() {
			this.autoAdvance = !this.autoAdvance
			if (this.autoAdvance && this.list.length) {
				this.playForWord(this.list[this.current].word)
			}
		},
		toggleSentenceAutoPlay() {
			this.sentenceAutoPlay = !this.sentenceAutoPlay
			if (!this.sentenceAutoPlay) {
				this.stopSentenceAudio()
			} else if (this.list.length) {
				this.playForWord(this.list[this.current].word)
			}
		},
		playForWord(word) {
			this.stopWordAudio()
			this.stopSentenceAudio()
			this.clearAdvanceTimer()

			if (this.playMode === 'single') {
				this.playSingleWordCycle(word)
				return
			}

			if (this.sentenceAutoPlay) {
				this.playWordThenSentencesThenAdvance(word)
			} else if (this.autoAdvance) {
				playAudio(word)
				this.scheduleAdvance(4000)
			} else {
				playAudio(word)
			}
		},
		playWordThenSentencesThenAdvance(word) {
			const ctx = uni.createInnerAudioContext()
			ctx.volume = WORD_VOLUME
			ctx.src = `https://dict.youdao.com/dictvoice?audio=${word}`
			const proceed = () => {
				this.stopWordAudio()
				if (this.currentSentenceAudioUrls.length) {
					this.playSentenceQueue(0, () => this.advanceIfEnabled())
				} else {
					this.advanceIfEnabled()
				}
			}
			ctx.onEnded(proceed)
			ctx.onError(proceed)
			ctx.play()
			this.wordAudioCtx = ctx
		},
		playSentenceQueue(index, onDone) {
			this.stopSentenceAudio()
			const urls = this.currentSentenceAudioUrls
			if (index >= urls.length) {
				onDone()
				return
			}
			const ctx = uni.createInnerAudioContext()
			ctx.src = urls[index]
			const proceed = () => this.playSentenceQueue(index + 1, onDone)
			ctx.onEnded(proceed)
			ctx.onError(proceed)
			ctx.play()
			this.sentenceAudioCtx = ctx
		},
		playSingleWordCycle(word) {
			const ctx = uni.createInnerAudioContext()
			ctx.volume = WORD_VOLUME
			ctx.src = `https://dict.youdao.com/dictvoice?audio=${word}`
			const afterWord = () => {
				this.stopWordAudio()
				if (this.sentenceAutoPlay && this.currentSentenceAudioUrls.length) {
					this.playSentenceQueue(0, () => this.scheduleSingleRepeat(word))
				} else {
					this.scheduleSingleRepeat(word)
				}
			}
			ctx.onEnded(afterWord)
			ctx.onError(afterWord)
			ctx.play()
			this.wordAudioCtx = ctx
		},
		scheduleSingleRepeat(word) {
			this.clearAdvanceTimer()
			this.advanceTimer = setTimeout(() => {
				if (this.playMode === 'single') {
					this.playSingleWordCycle(word)
				}
			}, SINGLE_REPEAT_DELAY)
		},
		advanceIfEnabled() {
			if (!this.autoAdvance) return
			const next = this.current + 1
			if (next >= this.list.length) return
			this.current = next
		},
		scheduleAdvance(delay) {
			this.clearAdvanceTimer()
			this.advanceTimer = setTimeout(() => {
				this.advanceIfEnabled()
			}, delay)
		},
		clearAdvanceTimer() {
			if (this.advanceTimer) {
				clearTimeout(this.advanceTimer)
				this.advanceTimer = null
			}
		},
		stopSentenceAudio() {
			if (this.sentenceAudioCtx) {
				this.sentenceAudioCtx.stop()
				this.sentenceAudioCtx.destroy()
				this.sentenceAudioCtx = null
			}
		},
		stopWordAudio() {
			if (this.wordAudioCtx) {
				this.wordAudioCtx.stop()
				this.wordAudioCtx.destroy()
				this.wordAudioCtx = null
			}
		},
		shuffleArray(arr) {
			const a = arr.slice()
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1))
				const tmp = a[i]
				a[i] = a[j]
				a[j] = tmp
			}
			return a
		},
		getSystemLibraryIds() {
			request({
				url: 'libraries/list',
				method: 'GET'
			}).then((libs) => {
				const defaultLib = libs.find((lib) => lib.name === '默认收藏')
				if (defaultLib) {
					this.defaultLibraryId = defaultLib.id
				}
				const reviewLib = libs.find((lib) => lib.name === '生词本')
				if (reviewLib) {
					this.reviewLibraryId = reviewLib.id
					this.getReviewWordIds()
				}
			}).catch(() => { })
		},
		getReviewWordIds() {
			request({
				url: `libraries/${this.reviewLibraryId}/words`,
				method: 'GET',
				data: { page: 1, page_size: 10000 }
			}).then((data) => {
				this.reviewWordIds = new Set(data.list.map((w) => w.id))
			}).catch(() => { })
		},
		favoriteWord(item) {
			if (!this.defaultLibraryId) return
			const wasFavorited = item.favorited
			request({
				url: wasFavorited ? 'libraries/remove-word' : 'libraries/add-word',
				data: { library_id: this.defaultLibraryId, word_id: item.id }
			}).then(() => {
				item.favorited = !wasFavorited
			}).catch(() => {
				if (!wasFavorited) {
					item.favorited = true
				}
			})
		},
		toggleReview(item) {
			if (!this.reviewLibraryId) return
			const wasIn = this.reviewWordIds.has(item.id)
			request({
				url: wasIn ? 'libraries/remove-word' : 'libraries/add-word',
				data: { library_id: this.reviewLibraryId, word_id: item.id }
			}).then(() => {
				const next = new Set(this.reviewWordIds)
				wasIn ? next.delete(item.id) : next.add(item.id)
				this.reviewWordIds = next
			}).catch(() => { })
		},
		playAudio,
		playAudioUrl,
		stripPhoneticBrackets
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/notebook-theme.css';

.card-progress {
	position: fixed;
	bottom: 90px;
	right: 20px;
	font-family: "Courier New", monospace;
	font-size: 12px;
	color: var(--ink-soft);
	z-index: 10;
}

.order-toggle,
.sentence-toggle,
.advance-toggle {
	position: fixed;
	bottom: 30px;
	width: 38px;
	height: 38px;
	border-radius: 50%;
	background: var(--paper-deep);
	border: 1px solid rgba(232, 121, 249, 0.35);
	box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.order-toggle {
	left: 20px;
}

.sentence-toggle {
	right: 20px;
}

.advance-toggle {
	left: 50%;
	transform: translateX(-50%);
}

.sentence-toggle.active,
.advance-toggle.active {
	background: var(--margin);
	border-color: var(--margin);
}

.order-icon {
	width: 18px;
	height: 18px;
}

.advance-toggle .order-icon {
	width: 26px;
	height: 26px;
}

.deck {
	height: calc(100vh - var(--safe-top, 0px));
}

.card-wrap {
	height: 100%;
	box-sizing: border-box;
	padding: 20px 20px 110px;
	display: flex;
	align-items: flex-end;
	justify-content: center;
}

.card {
	position: relative;
	width: 100%;
	box-sizing: border-box;
	border-radius: 10px;
	background-color: var(--paper);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border: 1px solid rgba(232, 121, 249, 0.25);
	padding: 22px 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.word-actions {
	position: absolute;
	top: 8px;
	right: 8px;
	display: flex;
	align-items: center;
	gap: 2px;
}

.word-star-btn,
.word-favorite-btn {
	width: 26px;
	height: 26px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.word-star-icon {
	font-size: 18px;
	line-height: 1;
	color: var(--ink-soft);
	/* ★ 字形在字号内偏下沉，跟旁边的心形图标对不齐，往上提一点 */
	transform: translateY(-1px);
}

.word-star-btn.on .word-star-icon {
	color: var(--highlight-ink);
}

.word-favorite-icon {
	width: 20px;
	height: 20px;
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
	flex-wrap: wrap;
	gap: 6px 0;
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
	white-space: nowrap;
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
	margin-top: 6px;
	width: 100%;
}

.meaning-row {
	display: flex;
	align-items: baseline;
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

.sentence {
	margin-top: 6px;
	margin-left: 30px;
	padding: 8px 10px;
	background: var(--paper-deep);
	border-left: 2px solid rgba(232, 121, 249, 0.4);
	border-radius: 4px;
}

.sentence-row {
	display: flex;
	align-items: center;
}

.sentence-en {
	flex: 1;
	font-size: 13px;
	color: var(--ink);
}

.sentence-zh {
	display: block;
	margin-top: 4px;
	font-size: 12px;
	color: var(--ink-soft);
}

.sentence-say {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: var(--paper);
	border: 1px solid var(--rule);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 6px;
	flex-shrink: 0;
}
</style>

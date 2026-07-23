<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<back-button />
		<view class="deck-progress" v-if="list.length">{{ Math.min(stackIndex + 1, total) }} / {{ total }}</view>

		<view class="stack-wrap" v-if="visibleCards.length">
			<view
				v-for="(item, pos) in visibleCards"
				:key="item.id"
				class="stack-card"
				:class="'pos-' + pos"
				:style="pos === 0 ? frontStyle : {}"
				@touchstart="onTouchStart($event, pos)"
				@touchmove="onTouchMove($event, pos)"
				@touchend="onTouchEnd($event, pos)"
			>
				<text class="card-word">{{ item.word }}</text>
				<view class="entry-phon">
					<text class="phon-chip">英 [{{ item.en_pronunciation }}]</text>
					<text class="phon-chip">美 [{{ item.us_pronunciation }}]</text>
					<view class="say-btn" @click.stop="playAudio(item.word)">
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

		<view v-if="!list.length" class="nb-empty">这个词库还没有单词，去别的词库看看吧</view>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import { playAudio, getNavBarInfo } from '~@/common/util'
import backButton from '~@/common/back-button.vue'
import bgImage from '~@/common/bg-image.vue'

const SWIPE_THRESHOLD = 80

export default {
	components: { backButton, bgImage },
	data() {
		return {
			id: null,
			name: '',
			total: 0,
			page: 1,
			hasMore: true,
			list: [],
			stackIndex: 0,
			safeTop: 0,
			dragging: false,
			dragX: 0,
			startX: 0,
			startY: 0,
			axisLocked: '',
			flying: false,
			flyDirection: 1
		};
	},
	computed: {
		visibleCards() {
			return this.list.slice(this.stackIndex, this.stackIndex + 3)
		},
		frontStyle() {
			if (this.flying) {
				const targetX = this.flyDirection > 0 ? 600 : -600
				return {
					transform: `translateX(${targetX}px) rotate(${this.flyDirection * 24}deg)`,
					opacity: '0',
					transition: 'transform 0.25s ease-in, opacity 0.25s ease-in'
				}
			}
			if (this.dragging) {
				return {
					transform: `translateX(${this.dragX}px) rotate(${this.dragX / 20}deg)`,
					transition: 'none'
				}
			}
			return {
				transform: 'translateX(0) rotate(0deg)',
				transition: 'transform 0.2s ease-out, top 0.38s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.3s ease-in'
			}
		}
	},
	onLoad(query) {
		this.id = query.id
		this.name = decodeURIComponent(query.name || '')
		uni.setNavigationBarTitle({ title: this.name })
		// #ifdef MP-WEIXIN
		this.safeTop = getNavBarInfo().top
		// #endif
		this.getList()
	},
	methods: {
		getList() {
			request({
				url: `libraries/${this.id}/words`,
				method: 'GET',
				data: { page: this.page, page_size: 20 }
			}).then((data) => {
				const wasEmpty = !this.list.length
				this.list = this.list.concat(data.list)
				this.total = data.total
				this.hasMore = this.list.length < data.total
				if (wasEmpty && this.list.length) {
					playAudio(this.list[0].word)
				}
			}).catch(() => {})
		},
		onTouchStart(e, pos) {
			if (pos !== 0 || this.flying) return
			this.dragging = true
			this.axisLocked = ''
			this.startX = e.touches[0].clientX
			this.startY = e.touches[0].clientY
			this.dragX = 0
		},
		onTouchMove(e, pos) {
			if (pos !== 0 || !this.dragging) return
			const dx = e.touches[0].clientX - this.startX
			const dy = e.touches[0].clientY - this.startY
			if (!this.axisLocked) {
				if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
				this.axisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
			}
			if (this.axisLocked === 'x') {
				this.dragX = dx
			}
		},
		onTouchEnd(e, pos) {
			if (pos !== 0 || !this.dragging) return
			this.dragging = false
			if (this.axisLocked === 'x' && Math.abs(this.dragX) > SWIPE_THRESHOLD) {
				this.flyDirection = this.dragX > 0 ? 1 : -1
				this.flying = true
				setTimeout(() => {
					this.advanceStack()
				}, 260)
			} else {
				this.dragX = 0
			}
		},
		advanceStack() {
			this.stackIndex += 1
			this.flying = false
			this.dragX = 0
			const front = this.list[this.stackIndex]
			if (front) {
				playAudio(front.word)
			}
			if (this.hasMore && this.stackIndex >= this.list.length - 3) {
				this.page += 1
				this.getList()
			}
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

.stack-wrap {
	position: relative;
	height: calc(100vh - 40px - var(--safe-top, 0px));
	padding: 20px;
	box-sizing: border-box;
}

.stack-card {
	position: absolute;
	left: 20px;
	right: 20px;
	height: 30%;
	box-sizing: border-box;
	border-radius: 10px;
	background-color: var(--paper);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	padding: 22px 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow-y: auto;
	will-change: transform, top;
	transition: top 0.38s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.3s ease-in;
}

/* #ifdef MP-WEIXIN */
.stack-card {
	border: 1px solid rgba(232, 121, 249, 0.25);
}
/* #endif */

/* #ifndef MP-WEIXIN */
.stack-card {
	border-left: 4px solid var(--margin);
}
/* #endif */

/* pos-0 = 页面最下面一条，当前激活、可左右滑动 */
.stack-card.pos-0 {
	top: 70%;
	z-index: 3;
	opacity: 1;
}

/* pos-1 = 页面中间一条，下一个词 */
.stack-card.pos-1 {
	top: 35%;
	z-index: 2;
	opacity: 0.65;
}

/* pos-2 = 页面最上面一条，再下一个词 */
.stack-card.pos-2 {
	top: 0%;
	z-index: 1;
	opacity: 0.4;
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

</style>

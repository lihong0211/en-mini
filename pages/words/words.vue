<template>
	<view class="uni-container" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="content">
			<view class="scope-row">
				<text class="scope-name">{{ libraryName }}</text>
				<view class="play-entry" @click="goPlay">
					<text class="play-icon">▶</text>
					<text class="play-text">播放</text>
				</view>
			</view>

			<view class="search-bar">
				<input
					class="search-input"
					v-model="searchText"
					placeholder="搜索单词…"
					confirm-type="search"
					@confirm="onSearchConfirm"
				/>
				<text class="search-btn" @click="onSearchConfirm">搜索</text>
				<text v-if="searchResult" class="search-clear" @click="clearSearch">清空</text>
			</view>

			<view v-if="searchLoading" class="nb-empty">查询中…</view>

			<view v-else-if="searchResult" class="result-card">
				<view class="word-actions">
					<view class="word-star-btn" :class="{ on: searchResult.saved }" @click.stop="toggleSearchDefault">
						<text class="word-star-icon">{{ searchResult.saved ? '★' : '☆' }}</text>
					</view>
					<view class="word-favorite-btn" @click.stop="toggleSearchReview">
						<image class="word-favorite-icon" :src="searchResult.saved_vocab ? likeOnSrc : likeSrc"
							mode="aspectFit" />
					</view>
				</view>
				<text class="card-word">{{ searchResult.word }}</text>
				<view class="entry-phon">
					<text class="phon-chip">英 [{{ stripPhoneticBrackets(searchResult.en_pronunciation) }}]</text>
					<text class="phon-chip">美 [{{ stripPhoneticBrackets(searchResult.us_pronunciation) }}]</text>
					<view class="say-btn" @click="playAudio(searchResult.word)">
						<text class="say-icon">🔊</text>
					</view>
				</view>
				<view class="meaning-list">
					<view class="entry-meaning" v-for="(m, i) in searchResult.meaning" :key="i">
						<view class="meaning-row">
							<text class="pos-tag">{{ m.type }}</text>
							<text class="meaning-text">{{ m.content }}</text>
						</view>
					</view>
				</view>
			</view>

			<template v-else>
				<view class="word-row" v-for="item in list" :key="item.id">
					<view class="word-row-main">
						<text class="word-row-word">{{ item.word }}</text>
						<text class="word-row-meaning" v-if="item.meaning && item.meaning.length">{{ item.meaning[0].content }}</text>
					</view>
					<view class="say-btn" @click="playAudio(item.word)">
						<text class="say-icon">🔊</text>
					</view>
				</view>
				<view v-if="!list.length" class="nb-empty">还没有单词</view>
			</template>
		</view>

		<pager v-if="!searchResult && !searchLoading" :current="page" :total="total" @change="goToPage" />
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import listPage from '~@/common/mixins/list-page'
import { playAudio, stripPhoneticBrackets } from '~@/common/util'
import bgImage from '~@/common/bg-image.vue'
import pager from '~@/common/pager.vue'
import likeSrc from '~@/static/like.png'
import likeOnSrc from '~@/static/like-on.png'

export default {
	mixins: [listPage],
	components: { bgImage, pager },
	data() {
		return {
			list: [],
			libraryId: null,
			libraryName: '全部单词',
			searchText: '',
			searchResult: null,
			searchLoading: false,
			likeSrc,
			likeOnSrc
		};
	},
	onShow() {
		// 词库 tab 点了词库卡片就会写 activeLibrary；没有就一直显示"全部单词"
		const active = getApp().globalData.activeLibrary
		const nextId = active ? active.id : null
		if (nextId !== this.libraryId) {
			this.libraryId = nextId
			this.libraryName = active ? active.name : '全部单词'
			this.page = 1
			this.getList()
		} else if (!this.list.length) {
			this.getList()
		}
	},
	methods: {
		getList() {
			request({
				url: this.libraryId ? `libraries/${this.libraryId}/words` : 'words/list',
				method: 'GET',
				data: { page: this.page, page_size: 20 }
			}).then((data) => {
				this.list = data.list
				this.total = data.total
				this.page = data.page
			}).catch(() => {})
		},
		onSearchConfirm() {
			const word = this.searchText.trim()
			if (!word) return
			this.searchLoading = true
			request({
				url: 'words/lookup',
				data: { word }
			}).then((data) => {
				this.searchResult = data
			}).catch(() => {
				this.searchResult = null
			}).finally(() => {
				this.searchLoading = false
			})
		},
		clearSearch() {
			this.searchText = ''
			this.searchResult = null
		},
		toggleSearchDefault() {
			this.toggleSearchLibrary('default', 'saved')
		},
		toggleSearchReview() {
			this.toggleSearchLibrary('review', 'saved_vocab')
		},
		toggleSearchLibrary(libraryId, flagKey) {
			const wasIn = this.searchResult[flagKey]
			const url = wasIn ? 'words/remove-from-library' : 'words/add'
			const data = wasIn
				? { word: this.searchResult.word, library_id: libraryId }
				: {
					word: this.searchResult.word,
					en_pronunciation: this.searchResult.en_pronunciation,
					us_pronunciation: this.searchResult.us_pronunciation,
					meaning: this.searchResult.meaning,
					library_id: libraryId
				}
			request({ url, data }).then(() => {
				this.searchResult[flagKey] = !wasIn
			}).catch(() => {})
		},
		goPlay() {
			const query = this.libraryId
				? `?id=${this.libraryId}&name=${encodeURIComponent(this.libraryName)}`
				: ''
			uni.navigateTo({ url: `/pages/words-play/words-play${query}` })
		},
		playAudio,
		stripPhoneticBrackets
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/list-page.css';
@import '~@/common/notebook-theme.css';

.scope-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 16px 0;
}

.scope-name {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 16px;
	font-weight: 700;
	color: var(--ink);
}

.play-entry {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 6px 14px;
	border-radius: 20px;
	background: var(--paper-deep);
	border: 1px solid rgba(232, 121, 249, 0.35);
}

.play-icon {
	color: var(--margin);
	font-size: 12px;
}

.play-text {
	color: var(--ink);
	font-size: 13px;
}

.search-bar {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 10px 16px 0;
}

.search-input {
	flex: 1;
	background: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	border-radius: 20px;
	padding: 8px 14px;
	color: var(--ink);
	font-size: 14px;
}

.search-btn {
	color: var(--highlight-ink);
	font-size: 14px;
	font-weight: 700;
}

.search-clear {
	color: var(--ink-soft);
	font-size: 13px;
}

.word-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border-radius: 4px;
	margin: 10px;
	padding: 10px;
}

.word-row-main {
	flex: 1;
	min-width: 0;
}

.word-row-word {
	display: block;
	font-family: Georgia, "Times New Roman", serif;
	font-size: 16px;
	font-weight: 700;
	color: var(--ink);
}

.word-row-meaning {
	display: block;
	margin-top: 3px;
	font-size: 13px;
	color: var(--ink-soft);
	overflow: hidden;
	text-overflow: ellipsis;
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
	margin-left: 8px;
	flex-shrink: 0;
}

.say-icon {
	font-size: 13px;
}

.result-card {
	position: relative;
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border-radius: 10px;
	margin: 10px 16px 0;
	padding: 18px 16px;
}

.word-actions {
	position: absolute;
	top: 10px;
	right: 10px;
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
	display: block;
	font-family: Georgia, "Times New Roman", serif;
	font-size: 24px;
	font-weight: 700;
	color: var(--ink);
	letter-spacing: 0.5px;
}

.entry-phon {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px 0;
	margin-top: 8px;
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

.meaning-list {
	width: 100%;
	margin-top: 12px;
	padding-top: 10px;
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
</style>

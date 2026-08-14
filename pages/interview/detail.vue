<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<back-button />
		<view class="nb-scroll">
			<view v-if="loading" class="nb-empty">加载中…</view>
			<view v-else-if="!question" class="nb-empty">题目不存在</view>
			<view v-else class="q-card">
				<view class="q-header">
					<text class="q-title">{{ question.question }}</text>
					<text class="q-mastery" @click="onChangeMastery">{{ question.mastery }}</text>
				</view>
				<text v-if="question.category" class="q-category">{{ question.category }}</text>
				<view class="q-key-points">
					<view class="q-kp-item" v-for="(kp, i) in splitKeyPoints(question.key_points)" :key="i">
						<text v-if="kp.label" class="q-kp-label">{{ kp.label }}</text>
						<text class="q-kp-content">{{ kp.content }}</text>
					</view>
				</view>
				<text class="q-spoken-desc">{{ question.spoken_desc }}</text>

				<view class="q-audio-list">
					<view class="q-audio-row" v-for="audio in question.audios" :key="audio.id">
						<text class="q-audio-name" :class="{ playing: playingAudioId === audio.id }" @click="playAudio(audio)">{{ playingAudioId === audio.id ? '❚❚' : '▶' }} {{ audio.display_name }}</text>
						<text class="q-audio-delete" @click="onDeleteAudio(audio)">删除</text>
					</view>
				</view>
				<view class="q-record-btn" :class="{ recording: recording }" @click="onToggleRecord">
					{{ recording ? '● 停止录音' : '录音' }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import request, { uploadFile } from '~@/common/requestEnglish'
import { getNavBarInfo } from '~@/common/util'
import bgImage from '~@/common/bg-image.vue'
import backButton from '~@/common/back-button.vue'

const MASTERY_LEVELS = ['未复习', '需加强', '基本掌握', '已掌握']

export default {
	components: { bgImage, backButton },
	data() {
		return {
			questionId: null,
			question: null,
			loading: false,
			safeTop: 0,
			recording: false,
			recorderManager: null,
			audioContext: null,
			playingAudioId: null
		}
	},
	onLoad(query) {
		this.questionId = Number(query.id)
		this.safeTop = getNavBarInfo().top
		this.recorderManager = uni.getRecorderManager()
		this.audioContext = uni.createInnerAudioContext()
		this.audioContext.onEnded(() => {
			this.playingAudioId = null
		})
		this.audioContext.onStop(() => {
			this.playingAudioId = null
		})
		this.audioContext.onError((err) => {
			console.error('[interview-detail] 播放失败', err)
			uni.showToast({ title: `播放失败: ${err.errMsg || err.errCode}`, icon: 'none' })
			this.playingAudioId = null
		})
		this.recorderManager.onStop((res) => {
			this.recording = false
			uploadFile('interview/audio/upload', res.tempFilePath, { question_id: String(this.questionId) })
				.then((audio) => {
					if (this.question) this.question.audios.push(audio)
				})
				.catch(() => {})
		})
	},
	onShow() {
		this.fetchQuestion()
	},
	methods: {
		fetchQuestion() {
			this.loading = true
			request({ url: 'interview/list' }).then((data) => {
				console.log('[interview-detail] questionId=', this.questionId, '返回的id列表=', data.map((q) => q.id))
				this.question = data.find((q) => q.id === this.questionId) || null
			}).catch((err) => {
				console.error('[interview-detail] 拉取题目列表失败', err)
				uni.showToast({ title: '加载失败: ' + (err.message || err.errMsg || ''), icon: 'none' })
			}).finally(() => {
				this.loading = false
			})
		},
		splitKeyPoints(keyPoints) {
			return (keyPoints || '')
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
				.map((line) => {
					const idx = line.indexOf('——')
					const label = idx === -1 ? '' : line.slice(0, idx)
					const content = (idx === -1 ? line : line.slice(idx + 2)).replace(/。$/, '')
					return { label, content }
				})
		},
		onChangeMastery() {
			uni.showActionSheet({
				itemList: MASTERY_LEVELS,
				success: (res) => {
					const mastery = MASTERY_LEVELS[res.tapIndex]
					if (mastery === this.question.mastery) return
					request({
						url: 'interview/mastery/update',
						data: { id: this.question.id, mastery }
					}).then(() => {
						this.question.mastery = mastery
					}).catch(() => {})
				}
			})
		},
		onToggleRecord() {
			if (this.recording) {
				this.recorderManager.stop()
				return
			}
			uni.authorize({
				scope: 'scope.record',
				success: () => {
					this.recording = true
					this.recorderManager.start({ format: 'mp3', duration: 600000 })
				},
				fail: () => {
					uni.showModal({
						title: '需要麦克风权限',
						content: '请在设置中开启录音权限',
						showCancel: false
					})
				}
			})
		},
		playAudio(audio) {
			if (this.playingAudioId === audio.id) {
				this.audioContext.stop()
				return
			}
			if (this.playingAudioId) {
				this.audioContext.stop()
			}
			this.audioContext.src = audio.url
			this.audioContext.play()
			this.playingAudioId = audio.id
		},
		onDeleteAudio(audio) {
			uni.showModal({
				title: '删除录音',
				content: `确定删除「${audio.display_name}」？`,
				success: (res) => {
					if (!res.confirm) return
					request({ url: 'interview/audio/delete', data: { id: audio.id } }).then(() => {
						this.question.audios = this.question.audios.filter((a) => a.id !== audio.id)
					}).catch(() => {})
				}
			})
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
}

.q-kp-item {
	font-size: 13px;
	line-height: 1.6;
	background-color: rgba(245, 185, 64, 0.12);
	border-radius: 8px;
	padding: 8px 10px;
	margin-bottom: 6px;
}

.q-kp-label {
	color: var(--highlight-ink);
	font-weight: 600;
	margin-right: 4px;
}

.q-kp-content {
	color: var(--ink-soft);
}

.q-spoken-desc {
	display: block;
	margin-top: 10px;
	color: var(--ink-soft);
	font-size: 14px;
	line-height: 1.6;
}

.q-audio-list {
	margin-top: 10px;
}

.q-audio-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px 0;
}

.q-audio-name {
	color: var(--ink);
	font-size: 13px;
}

.q-audio-name.playing {
	color: var(--margin);
	font-weight: 600;
}

.q-audio-delete {
	color: var(--ink-soft);
	font-size: 12px;
}

.q-record-btn {
	margin-top: 10px;
	display: inline-block;
	color: var(--margin);
	font-size: 13px;
	padding: 6px 14px;
	border-radius: 8px;
	border: 1px solid var(--margin);
}

.q-record-btn.recording {
	color: #fff;
	background-color: var(--margin);
}
</style>

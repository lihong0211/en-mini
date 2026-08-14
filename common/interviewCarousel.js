export function splitIntoChunks(text, maxLen = 200) {
	const parts = (text || '').split(/([。！？；\n])/).filter(Boolean)
	const sentences = []
	for (let i = 0; i < parts.length; i += 2) {
		sentences.push(parts[i] + (parts[i + 1] || ''))
	}
	if (!sentences.length) return []

	const chunks = []
	let current = ''
	for (const sentence of sentences) {
		if (current && current.length + sentence.length > maxLen) {
			chunks.push(current)
			current = sentence
		} else {
			current += sentence
		}
	}
	if (current) chunks.push(current)
	return chunks
}

const MODE_TTS = 'tts'
const MODE_RECORDING = 'recording'

function buildQueue(questions, mode) {
	if (mode === MODE_TTS) {
		return questions.map((q) => ({
			id: q.id,
			title: q.question,
			text: `${q.question}。${q.spoken_desc}`
		}))
	}
	return questions
		.filter((q) => q.audios && q.audios.length)
		.map((q) => ({
			id: q.id,
			title: q.question,
			url: q.audios[q.audios.length - 1].url
		}))
}

const state = {
	mode: null,
	queue: [],
	index: -1,
	chunks: [],
	chunkIndex: 0,
	playing: false
}

const listeners = new Set()
function notify() {
	const snapshot = { mode: state.mode, queue: state.queue, index: state.index, playing: state.playing }
	listeners.forEach((fn) => fn(snapshot))
}
function onStateChange(fn) {
	listeners.add(fn)
	return () => listeners.delete(fn)
}

let audioManager = null
// #ifdef MP-WEIXIN
function getAudioManager() {
	if (!audioManager) {
		audioManager = uni.getBackgroundAudioManager()
		audioManager.onEnded(() => advance())
		audioManager.onError((err) => {
			console.error('[interviewCarousel] 播放出错', err)
			advance()
		})
	}
	return audioManager
}
// #endif

function playCurrentChunk() {
	const item = state.queue[state.index]
	const chunk = state.chunks[state.chunkIndex]
	if (!item || !chunk) {
		advance()
		return
	}
	// #ifdef MP-WEIXIN
	const plugin = requirePlugin('WechatSI')
	plugin.textToSpeech({
		lang: 'zh_CN',
		tts: true,
		content: chunk,
		success: (res) => {
			const manager = getAudioManager()
			manager.title = item.title
			manager.epname = item.title
			manager.src = res.filename
			state.playing = true
			notify()
		},
		fail: (err) => {
			console.error('[interviewCarousel] TTS合成失败，跳过这一段', err)
			state.chunkIndex += 1
			playCurrentChunk()
		}
	})
	// #endif
}

function playCurrentItem() {
	const item = state.queue[state.index]
	if (!item) {
		stop()
		return
	}
	if (state.mode === MODE_RECORDING) {
		// #ifdef MP-WEIXIN
		const manager = getAudioManager()
		manager.title = item.title
		manager.epname = item.title
		manager.src = item.url
		// #endif
		state.playing = true
		notify()
		return
	}
	state.chunks = splitIntoChunks(item.text)
	state.chunkIndex = 0
	playCurrentChunk()
}

function advance() {
	if (state.mode === MODE_TTS) {
		state.chunkIndex += 1
		if (state.chunkIndex < state.chunks.length) {
			playCurrentChunk()
			return
		}
	}
	state.index += 1
	if (state.index >= state.queue.length) {
		stop()
		uni.showToast({ title: '播完啦', icon: 'none' })
		return
	}
	playCurrentItem()
	notify()
}

function start(questions, mode) {
	const queue = buildQueue(questions, mode)
	if (!queue.length) {
		uni.showToast({
			title: mode === MODE_TTS ? '没有可朗读的题目' : '还没有录音',
			icon: 'none'
		})
		return false
	}
	state.mode = mode
	state.queue = queue
	state.index = 0
	playCurrentItem()
	notify()
	return true
}

function pause() {
	if (!state.playing) return
	// #ifdef MP-WEIXIN
	if (audioManager) audioManager.pause()
	// #endif
	state.playing = false
	notify()
}

function resume() {
	if (state.playing || state.index < 0) return
	// #ifdef MP-WEIXIN
	if (audioManager) audioManager.play()
	// #endif
	state.playing = true
	notify()
}

function next() {
	if (state.index < 0 || state.index >= state.queue.length - 1) return
	state.index += 1
	playCurrentItem()
	notify()
}

function prev() {
	if (state.index <= 0) return
	state.index -= 1
	playCurrentItem()
	notify()
}

function stop() {
	// #ifdef MP-WEIXIN
	if (audioManager) audioManager.stop()
	// #endif
	state.mode = null
	state.queue = []
	state.index = -1
	state.chunks = []
	state.chunkIndex = 0
	state.playing = false
	notify()
}

export default {
	MODE_TTS,
	MODE_RECORDING,
	start,
	pause,
	resume,
	next,
	prev,
	stop,
	onStateChange
}

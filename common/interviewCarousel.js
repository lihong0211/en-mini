function buildQueue(questions) {
	return questions
		.filter((q) => q.audios && q.audios.length)
		.map((q) => ({
			id: q.id,
			title: q.question,
			url: q.audios[q.audios.length - 1].url
		}))
}

const state = {
	queue: [],
	index: -1,
	playing: false
}

const listeners = new Set()
function notify() {
	const snapshot = { queue: state.queue, index: state.index, playing: state.playing }
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

function playCurrentItem() {
	const item = state.queue[state.index]
	if (!item) {
		stop()
		return
	}
	// #ifdef MP-WEIXIN
	const manager = getAudioManager()
	manager.title = item.title
	manager.epname = item.title
	manager.src = item.url
	// #endif
	state.playing = true
	notify()
}

function advance() {
	state.index += 1
	if (state.index >= state.queue.length) {
		stop()
		uni.showToast({ title: '播完啦', icon: 'none' })
		return
	}
	playCurrentItem()
	notify()
}

function start(questions) {
	const queue = buildQueue(questions)
	if (!queue.length) {
		uni.showToast({ title: '还没有录音', icon: 'none' })
		return false
	}
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
	state.queue = []
	state.index = -1
	state.playing = false
	notify()
}

export default {
	start,
	pause,
	resume,
	next,
	prev,
	stop,
	onStateChange
}

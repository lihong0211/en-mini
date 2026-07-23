function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}

	var hour = parseInt(time / 3600)
	time = time % 3600
	var minute = parseInt(time / 60)
	time = time % 60
	var second = time

	return ([hour, minute, second]).map(function(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}).join(':')
}

const PLAY_DEBOUNCE_MS = 800
let lastPlaySrc = null
let lastPlayTime = 0

function shouldSkipPlay(src) {
	const now = Date.now()
	if (lastPlaySrc === src && now - lastPlayTime < PLAY_DEBOUNCE_MS) {
		return true
	}
	lastPlaySrc = src
	lastPlayTime = now
	return false
}

// 单词发音源响度比例句音频高一截，统一调低一点，听感上跟例句差不多大声
const WORD_VOLUME = 0.7

function playAudio(word) {
	if (shouldSkipPlay(word)) return
	const innerAudioContext = uni.createInnerAudioContext();
	innerAudioContext.autoplay = true;
	innerAudioContext.volume = WORD_VOLUME;
	innerAudioContext.src = `https://dict.youdao.com/dictvoice?audio=${word}`;
	innerAudioContext.onError((res) => {
		console.log(res.errMsg);
	});
}

function playAudioUrl(url) {
	if (shouldSkipPlay(url)) return
	const innerAudioContext = uni.createInnerAudioContext();
	innerAudioContext.autoplay = true;
	innerAudioContext.src = url;
	innerAudioContext.onError((res) => {
		console.log(res.errMsg);
	});
}

function stripPhoneticBrackets(text) {
	if (!text) return ''
	return text.replace(/^[\[\/]+|[\]\/]+$/g, '')
}

function getNavBarInfo() {
	const sys = uni.getSystemInfoSync()
	const statusBarHeight = sys.statusBarHeight || 0
	let menu = { top: statusBarHeight, height: 32 }
	try {
		menu = uni.getMenuButtonBoundingClientRect()
	} catch (e) {}
	const navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height
	return {
		statusBarHeight,
		navBarHeight,
		top: statusBarHeight + navBarHeight
	}
}

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDate()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

export {
	formatTime,
	formatLocation,
	dateUtils,
	playAudio,
	playAudioUrl,
	stripPhoneticBrackets,
	getNavBarInfo,
	WORD_VOLUME
}

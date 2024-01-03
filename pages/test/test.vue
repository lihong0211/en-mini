<template>
	<view class="uni-container">
		<view class="content">
			<uni-card class="item" v-for="(item, idx) in list" :key="item.word">
				<view class="meaning">
					{{ item.meaning }}
				</view>
				<view class="status">
					<view class="prefix">
						<image class="status-init" v-if="!item.test" src="~@/static/write.png" />
						<image class="status-loading" v-if="item.test && item.test !== item.word" src="~@/static/loading.png" />
						<image class="status-done" v-if="item.test && item.test === item.word" src="~@/static/done.png" />
					</view>

					<input v-if="!idx" focus class="input" :value="item.test" @input="e => handleInput(e, idx)"
						placeholder="请输入...">
					<input v-else class="input" :value="item.test" @input="e => handleInput(e, idx)" placeholder="请输入...">
					<image class="help-cancel" src="~@/static/cancel.png" v-if="item.test && item.test === item.word"
						@click="cancelHelp(idx)" />
					<text v-else class="help" @click="help(idx)">提示</text>
				</view>

			</uni-card>
		</view>
		<view class="pagination">
			<view>
				<text class="mastered">已掌握</text>
				<switch class="switch" color="#FFCC33" style="transform:scale(0.7)" :checked="mastered === 1"
					@change="changeType" />
			</view>

			<view class="refresh" @click="getList">换一批</view>
		</view>
	</view>
</template>
<script>
import request from '~@/common/request'
export default {
	data() {
		return {
			list: [],
			mastered: 2
		};
	},
	onLoad() {
		this.getList()
	},
	onShareAppMessage() {
		return {
			title: '欢迎体验悄咪记单词',
			path: '/pages/words'
		}
	},
	onNavigationBarButtonTap(e) {
		uni.navigateTo({
			url: '/pages/words'
		});
	},
	methods: {
		getList() {
			request({
				url: 'words/list',
				data: {
					page: 1,
					size: 10000,
					query: {
						mastered: this.mastered,
					},
				},
			}).then((res) => {
				const ret = [];
				for (let i = 0; i < Math.min(20, res?.data?.length); i++) {
					let idx = Math.floor(Math.random() * res?.data?.length);
					ret.push(res?.data[idx]);
					res?.data?.splice(idx, 1)
				}
				this.list = ret
			})
		},
		changePage({ type, current }) {
			this.page = type === 'next' ? (Math.min(current, Math.round(this.total / 20))) : (Math.max(current, 1))
			this.getList()
		},

		playAudio(word) {
			const innerAudioContext = uni.createInnerAudioContext();
			innerAudioContext.autoplay = true;
			innerAudioContext.src = `http://dict.youdao.com/dictvoice?audio=${word}`;
			innerAudioContext.onPlay(() => {
				// console.log('开始播放');
			});
			innerAudioContext.onError((res) => {
				console.log(res.errMsg);
			});
		},
		handleInput(e, idx) {
			this.list[idx].test = e.target.value
		},
		changeType(e) {
			this.mastered = e.target.value ? 1 : 2
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

.uni-container {
	position: relative;
	height: 100vh;
	box-sizing: border-box;
}

.content {
	height: calc(100vh - 80px);
	overflow: scroll;
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	flex-wrap: wrap;
}

.item {
	width: 100%;
}

.meaning {
	border-bottom: 1px dashed #ddd;
	padding-bottom: 8px;
	margin-bottom: 10px;
}

.pagination {
	height: 70px;
	width: calc(100% - 30px);
	position: absolute !important;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.mastered {
	color: #0073ff;
	font-size: 14px;
}

.switch {
	filter: drop-shadow(#0073ff 3px 3px 3px);
	transform: translateX(10px);
}

.refresh {
	width: 100px;
	height: 30px;
	line-height: 30px;
	background-color: #FFCC33;
	border-radius: 15px;
	color: #fff;
	font-size: 16px;
	text-align: center
}

.status {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	border-bottom: 1px dashed #0073ff;
	padding-bottom: 7px;
	position: relative;
}

.prefix {
	width: 17px;
	height: 17px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.input {
	margin-left: 10px;
	letter-spacing: 1px;
}

.help {
	font-size: 12px;
	color: #0073ff;
	position: absolute;
	right: 5px;
	bottom: 7px;
}

.help-cancel {
	width: 17px;
	height: 17px;
	position: absolute;
	right: 5px;
	bottom: 7px;
}

.status-init {
	width: 17px;
	height: 17px;
}

.status-loading {
	width: 13px;
	height: 13px;
	transform: translateY(16px);
	vertical-align: middle;
	display: inline-block;
	animation: loading 1.5s ease-in-out 10000;
}

.status-done {
	width: 13px;
	height: 13px;
}

@keyframes loading {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>

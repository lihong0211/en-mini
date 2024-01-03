<template>
	<view class="uni-container">
		<view class="content">
			<uni-card class="item" v-for="item in list" :key="item.url">
				<view class="row word">
					单词：{{ item.word }}
					<image src="http://fanyi-cdn.cdn.bcebos.com/webStatic/translation/asset/sound-normal.e3538f1c.png"
						class="pronunciation" @click="playAudio(item.word)"></image>
				</view>
				<view class="row meaning">
					释义：{{ item.meaning }}
				</view>
				<view v-if="item.type" class="row type">
					类型：{{ item.type.join('、') }}
				</view>
				<view class="row" v-if="item.collocation">
					搭配：{{ item.collocation }}
				</view>
				<view class="row" v-if="item.collocation">搭配释义：{{ item.collocation_meaning }}</view>
				<view class="row mastered">
					<text>是否掌握</text>
					<switch class="switch" color="#FFCC33" style="transform:scale(0.7)" :checked="item.mastered === 1" />
				</view>


			</uni-card>
		</view>

		<uni-pagination key="words" class="pagination" v-if="list.length" show-icon="true" @change="changePage" :total="total"
			pageSize="20" :current="page">
		</uni-pagination>

	</view>
</template>
<script>
import request from '~@/common/request'
export default {
	data() {
		return {
			total: 0,
			page: 1,
			list: []
		};
	},
	onLoad() {
		this.getList()
		// this.translate()
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
					page: this.page,
					size: 20
				},
			}).then((res) => {
				this.list = res.data
				this.total = res.total
				this.page = res.page
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
		}
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';

.uni-container {
	padding-bottom: 40px;
	position: relative;
	height: 100vh;
	box-sizing: border-box;
}

.content {
	height: calc(100vh - 70px);
	overflow: scroll;
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	flex-wrap: wrap;
}

.item {
	width: 100%;
}

.pagination {
	width: 180px;
	height: 40px;
	position: absolute !important;
	bottom: 0;
	left: 50%;
	transform: translateX(-90px);
}

.row {
	border-bottom: 1px dashed #eee;
	padding-bottom: 3px;
	margin-bottom: 5px;
}

.word {
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.pronunciation {
	width: 25px;
	height: 25px;
	margin-left: 10px;
	border-radius: 50%;
	filter: drop-shadow(blue 3px 3px 3px);
	background-image: url('http://fanyi-cdn.cdn.bcebos.com/webStatic/translation/asset/sound-normal.e3538f1c.png');
}

.mastered {
	width: 100%;
	align-items: center;
	justify-content: space-between;
	display: flex;
	/* color: #59bff1; */
	color: transparent;
	background-image: linear-gradient(45deg, #0073ff, purple, cyan, deeppink);
	-webkit-background-clip: text;
	background-clip: text;

	/* filter: drop-shadow(#0ff 3px 3px 3px); */
}

.switch {
	filter: drop-shadow(blue 3px 3px 3px);
	transform: translateX(10px);
}
</style>

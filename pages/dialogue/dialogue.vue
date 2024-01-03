<template>
	<view class="uni-container">
		<view class="content">
			<view class="dialogue" v-for="item in list" :key="item.url">
				<view class="dialogue-item" v-for="it in item.dialogue" :key="it.dialogue">
					<uni-card class="">{{ it.dialogue }}</uni-card>
					<uni-card class="dialogue-item">{{ it.meaning }}</uni-card>
				</view>
				<uni-card class="words" v-for="it in item.words" :key="it.dialogue">
					<text>{{ it.word }}: {{ it.meaning }}</text>
				</uni-card>
			</view>
		</view>

		<uni-pagination key="dialogue" class="pagination" v-if="list.length" show-icon="true" @change="changePage"
			:total="total" pageSize="20" :current="page">
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
				url: 'dialogue/list',
				method: 'GET',
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
		}
	}
}
</script>

<style >
@import '~@/common/uni-nvue.css';

.dialogue {
	border: 1px dashed #ddd;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.08);
	margin-bottom: 20px;
}

.uni-container {
	padding-bottom: 40px;
	position: relative;
	height: 100vh;
	box-sizing: border-box;
}

.content {
	height: calc(100vh - 70px);
	overflow: scroll;
}

.pagination {
	width: 180px;
	height: 40px;
	position: absolute !important;
	bottom: 0;
	left: 50%;
	transform: translateX(-90px);
}
</style>

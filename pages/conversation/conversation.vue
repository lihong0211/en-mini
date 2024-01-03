<template>
	<view class="uni-container">
		<view class="content">
			<uni-card class="conversation" v-for="item in list" :key="item.url">
				<view class="speech">{{ item.speech }}</view>
				<view class="uni-panel-text">{{ item.meaning }}</view>
			</uni-card>
		</view>

		<uni-pagination key="conversation" class="pagination" v-if="list.length" show-icon="true" @change="changePage"
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
				url: 'living-speech/list',
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
}

.conversation {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.speech {
	width: auto;
	border-bottom: 1px dashed #ddd;
	padding-bottom: 3px;
	margin-bottom: 5px;
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

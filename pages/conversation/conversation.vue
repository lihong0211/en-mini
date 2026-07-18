<template>
	<view class="uni-container">
		<view class="content">
			<uni-card class="conversation" v-for="item in list" :key="item.id">
				<view class="speech">{{ item.phrase }}</view>
				<view class="uni-panel-text">{{ item.meaning }}</view>
			</uni-card>
		</view>

		<uni-pagination 
			:total="total"
			key="words" 
			class="pagination"
			title="标题文字" 
			prev-text="上一页" 
			next-text="下一页" 
			:current="page" 
			pageSize="20" 
			@change="changePage"
		/>
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import listPage from '~@/common/mixins/list-page'
export default {
	mixins: [listPage],
	data() {
		return {
			list: []
		};
	},
	onLoad() {
		this.getList()
	},
	methods: {
		getList() {
			request({
				url: 'daily-expressions/list',
				method: 'GET',
				data: {
					page: this.page,
					page_size: 20
				},
			}).then((data) => {
				this.list = data.list
				this.total = data.total
				this.page = data.page
			}).catch(() => {})
		}
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/list-page.css';

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
</style>

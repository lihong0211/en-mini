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
import request from '~@/common/request'
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
			}).catch(() => {})
		}
	}
}
</script>

<style >
@import '~@/common/uni-nvue.css';
@import '~@/common/list-page.css';

.dialogue {
	border: 1px dashed #ddd;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.08);
	margin-bottom: 20px;
}
</style>

<template>
	<view class="uni-container" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="content">
			<view class="conversation" v-for="item in list" :key="item.id">
				<view class="speech-row">
					<view class="speech">{{ item.phrase }}</view>
					<view class="say-btn" v-if="item.audio_url" @click="playAudioUrl(item.audio_url)">
						<text class="say-icon">🔊</text>
					</view>
				</view>
				<view class="meaning">{{ item.meaning }}</view>
			</view>
		</view>

		<pager :current="page" :total="total" @change="goToPage" />
	</view>
</template>
<script>
import request from '~@/common/requestDesktop'
import listPage from '~@/common/mixins/list-page'
import bgImage from '~@/common/bg-image.vue'
import pager from '~@/common/pager.vue'
import { playAudioUrl } from '~@/common/util'
export default {
	mixins: [listPage],
	components: { bgImage, pager },
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
		},
		playAudioUrl
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/list-page.css';
@import '~@/common/notebook-theme.css';

.conversation {
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border-radius: 4px;
	margin: 10px;
	padding: 10px;
}

.speech-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px dashed var(--rule);
	padding-bottom: 3px;
	margin-bottom: 5px;
}

.speech {
	flex: 1;
	color: var(--ink);
}

.say-btn {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: var(--paper-deep);
	border: 1px solid var(--rule);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 8px;
	flex-shrink: 0;
}

.say-icon {
	font-size: 12px;
}

.meaning {
	color: var(--ink-soft);
	font-size: 14px;
}
</style>

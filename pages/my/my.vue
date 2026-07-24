<template>
	<view class="nb-page" :style="{ '--safe-top': safeTop + 'px' }">
		<bg-image />
		<view class="nb-scroll">
			<view class="profile-card" v-if="user">
				<!-- #ifdef MP-WEIXIN -->
				<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image class="avatar" :src="user.avatar || '/static/my.png'" mode="aspectFill" />
				</button>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<image class="avatar" :src="user.avatar || '/static/my.png'" mode="aspectFill" />
				<!-- #endif -->

				<view class="nickname-area">
					<!-- #ifdef MP-WEIXIN -->
					<input
						v-if="editingNickname"
						class="nickname-input"
						type="nickname"
						:value="nicknameDraft"
						@blur="onNicknameConfirm"
						focus
					/>
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN -->
					<input
						v-if="editingNickname"
						class="nickname-input"
						:value="nicknameDraft"
						@blur="onNicknameConfirm"
						focus
					/>
					<!-- #endif -->
					<text v-if="!editingNickname" class="nickname" @click="startEditNickname">{{ user.nickname || '点击设置昵称' }}</text>
				</view>
			</view>

			<view class="account-row" v-if="user">
				<text v-if="user.username" class="account-bound">已绑定桌面端账号：{{ user.username }}</text>
				<template v-else>
					<text class="account-link" @click="openCredentialForm('set')">设置账号密码</text>
					<text class="account-link" @click="openCredentialForm('bind')">绑定已有桌面账号</text>
				</template>
			</view>

			<view class="section">
				<view class="section-title-row">
					<text class="section-title">自建词库</text>
					<text class="section-action" @click="openCreateLibrary">＋ 新建</text>
				</view>
				<view class="lib-card" v-for="lib in ownLibraries" :key="lib.id" @click="openLibrary(lib)">
					<text class="lib-name">{{ lib.name }}</text>
					<text class="lib-count">{{ lib.word_count }} 词</text>
				</view>
			</view>

			<view class="section" v-if="favoriteLibraries.length">
				<view class="section-title">收藏词库</view>
				<view class="lib-card" v-for="lib in favoriteLibraries" :key="lib.id" @click="openLibrary(lib)">
					<text class="lib-name">{{ lib.name }}</text>
					<text class="lib-count">{{ lib.word_count }} 词</text>
				</view>
			</view>

			<view v-if="!ownLibraries.length && !favoriteLibraries.length" class="nb-empty">
				还没有词库，去词库列表收藏几个吧
			</view>
		</view>

		<view class="modal-mask" v-if="credentialMode" @click="closeCredentialForm">
			<view class="modal-box" @click.stop>
				<text class="modal-title">{{ credentialMode === 'bind' ? '绑定已有桌面账号' : '设置账号密码' }}</text>
				<input class="modal-input" v-model="credentialUsername" placeholder="用户名" />
				<input class="modal-input" v-model="credentialPassword" placeholder="密码" password />
				<view class="modal-actions">
					<text class="modal-cancel" @click="closeCredentialForm">取消</text>
					<text class="modal-confirm" @click="submitCredentialForm">确定</text>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="showCreateLibrary" @click="closeCreateLibrary">
			<view class="modal-box" @click.stop>
				<text class="modal-title">新建词库</text>
				<input class="modal-input" v-model="newLibraryName" placeholder="词库名称" focus />
				<view class="modal-actions">
					<text class="modal-cancel" @click="closeCreateLibrary">取消</text>
					<text class="modal-confirm" @click="submitCreateLibrary">确定</text>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
import request, { getToken, setToken } from '~@/common/requestDesktop'
import { apiHost } from '~@/common/env'
import { getNavBarInfo } from '~@/common/util'
import bgImage from '~@/common/bg-image.vue'

// 系统默认词库固定置顶，跟桌面端 Main.vue 的 PROTECTED_LIBS 排序一致
const PROTECTED_LIBS = ['默认收藏', '生词本']

export default {
	components: { bgImage },
	data() {
		return {
			ownLibraries: [],
			favoriteLibraries: [],
			safeTop: 0,
			user: null,
			editingNickname: false,
			nicknameDraft: '',
			credentialMode: null, // 'set' | 'bind' | null
			credentialUsername: '',
			credentialPassword: '',
			showCreateLibrary: false,
			newLibraryName: ''
		};
	},
	onShow() {
		this.safeTop = getNavBarInfo().top
		this.getProfile()
		this.getLibraries()
	},
	methods: {
		getProfile() {
			request({
				url: 'auth/me',
				method: 'GET'
			}).then((data) => {
				this.user = data
			}).catch(() => {})
		},
		getLibraries() {
			request({
				url: 'libraries/list',
				method: 'GET'
			}).then((data) => {
				this.ownLibraries = [...data].sort((a, b) => {
					const ia = PROTECTED_LIBS.indexOf(a.name)
					const ib = PROTECTED_LIBS.indexOf(b.name)
					return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
				})
			}).catch(() => {})

			request({
				url: 'libraries/favorites',
				method: 'GET'
			}).then((data) => {
				this.favoriteLibraries = data
			}).catch(() => {})
		},
		openLibrary(lib) {
			uni.navigateTo({
				url: `/pages/library-detail/library-detail?id=${lib.id}&name=${encodeURIComponent(lib.name)}`
			});
		},
		onChooseAvatar(e) {
			const filePath = e.detail.avatarUrl
			if (!filePath) return
			uni.uploadFile({
				url: apiHost + '/en-desktop/auth/avatar',
				filePath,
				name: 'file',
				header: { Authorization: `Bearer ${getToken()}` },
				success: (res) => {
					const body = JSON.parse(res.data)
					if (body.code === 200) {
						this.user = body.data
					} else {
						uni.showToast({ title: body.msg || '头像上传失败', icon: 'none' })
					}
				},
				fail: () => {
					uni.showToast({ title: '头像上传失败', icon: 'none' })
				}
			})
		},
		startEditNickname() {
			this.nicknameDraft = this.user && this.user.nickname || ''
			this.editingNickname = true
		},
		onNicknameConfirm(e) {
			const nickname = (e.detail.value || '').trim()
			this.editingNickname = false
			if (!nickname || nickname === (this.user && this.user.nickname)) return
			request({
				url: 'auth/profile',
				data: { nickname }
			}).then((data) => {
				this.user = data
			}).catch(() => {})
		},
		openCredentialForm(mode) {
			this.credentialMode = mode
			this.credentialUsername = ''
			this.credentialPassword = ''
		},
		closeCredentialForm() {
			this.credentialMode = null
		},
		submitCredentialForm() {
			const username = this.credentialUsername.trim()
			const password = this.credentialPassword
			if (!username || !password) {
				uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
				return
			}
			const url = this.credentialMode === 'bind' ? 'auth/bind-account' : 'auth/set-credentials'
			request({ url, data: { username, password } }).then((data) => {
				this.credentialMode = null
				if (data.token) {
					setToken(data.token)
					this.user = data.user
					this.getLibraries()
				} else {
					this.user = data
				}
				uni.showToast({ title: '绑定成功', icon: 'success' })
			}).catch(() => {})
		},
		openCreateLibrary() {
			this.newLibraryName = ''
			this.showCreateLibrary = true
		},
		closeCreateLibrary() {
			this.showCreateLibrary = false
		},
		submitCreateLibrary() {
			const name = this.newLibraryName.trim()
			if (!name) {
				uni.showToast({ title: '请输入词库名称', icon: 'none' })
				return
			}
			request({
				url: 'libraries/add',
				data: { name }
			}).then(() => {
				this.showCreateLibrary = false
				this.getLibraries()
				uni.showToast({ title: '创建成功', icon: 'success' })
			}).catch(() => {})
		}
	}
}
</script>

<style>
@import '~@/common/uni-nvue.css';
@import '~@/common/notebook-theme.css';

.profile-card {
	display: flex;
	align-items: center;
	margin: 0 16px;
	padding: 16px;
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border-radius: 6px;
}

.avatar-btn {
	padding: 0;
	margin: 0;
	background: none;
	border: none;
	line-height: 0;
}

.avatar-btn::after {
	border: none;
}

.avatar {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background-color: var(--paper-deep);
	flex-shrink: 0;
}

.nickname-area {
	margin-left: 14px;
	flex: 1;
}

.nickname {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 17px;
	font-weight: 700;
	color: var(--ink);
}

.nickname-input {
	font-size: 17px;
	color: var(--ink);
	border-bottom: 1px solid var(--rule);
	padding-bottom: 4px;
}

.account-row {
	margin: 10px 16px 0;
	padding: 0 2px;
	display: flex;
	gap: 16px;
}

.account-bound {
	font-size: 12px;
	color: var(--ink-soft);
}

.account-link {
	font-size: 12px;
	color: var(--margin);
}

.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.modal-box {
	width: 260px;
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	border-radius: 8px;
	padding: 20px;
}

.modal-title {
	display: block;
	font-family: Georgia, "Times New Roman", serif;
	font-size: 16px;
	font-weight: 700;
	color: var(--ink);
	margin-bottom: 14px;
}

.modal-input {
	display: block;
	border: 1px solid var(--rule);
	border-radius: 4px;
	padding: 8px 10px;
	margin-bottom: 12px;
	color: var(--ink);
	font-size: 14px;
}

.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 20px;
}

.modal-cancel {
	color: var(--ink-soft);
	font-size: 14px;
}

.modal-confirm {
	color: var(--highlight-ink);
	font-size: 14px;
	font-weight: 700;
}

.section {
	margin-top: 22px;
}

.section:first-child {
	margin-top: 0;
}

.section-title {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 15px;
	font-weight: 700;
	color: var(--ink-soft);
	padding: 0 16px;
	margin-bottom: 8px;
}

.section-title-row {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	padding: 0 16px;
	margin-bottom: 8px;
}

.section-title-row .section-title {
	padding: 0;
	margin-bottom: 0;
}

.section-action {
	font-size: 13px;
	color: var(--margin);
}

.lib-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: var(--paper);
	border: 1px solid rgba(232, 121, 249, 0.25);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
	border-radius: 6px;
	margin: 10px 16px 0;
	padding: 14px 16px;
}

.lib-name {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 16px;
	font-weight: 700;
	color: var(--ink);
}

.lib-count {
	color: var(--ink-soft);
	font-size: 12px;
	font-family: "Courier New", monospace;
}
</style>

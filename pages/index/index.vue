<template>
	<view class="nav_bar_custom">
		<view class="top_height"></view>
		<view class="nav_content">
			<image class="img" src="/static/农业智能.png" mode="heightFix"></image>
			<view class="nav_text">
				<text class="text_1">{{ name }}</text>
				<text class="text_2">为您提供智慧农业解决方案</text>
			</view>
		</view>
	</view>
	<!-- 占位 -->
	<view :style="{ height: MenuButton().seViewHeight }"></view>
	<!-- 文本 -->
	<view class="Sent_information backdrop your_element" v-if="messageData.length <= 0">{{ greetSb }}</view>
	<!-- 系统默认问题 -->
	<view v-if="messageData.length <= 0" class="Sent_information backdrop widthAuto your_element">
		<view class="nav_content">
			<image class="img" src="../../static/Ai.png" mode="heightFix"></image>
			<text class="text">你可以这样问我</text>
			<view class="Default_problem" v-for="(item, index) in problemDate" :key="index" @click="selectText(item)">{{ item
				}}
			</view>
		</view>
	</view>
	<!-- 问答区域 -->
	<!-- 用户提问 -->
	<block v-for="(item, index) in messageData " :key="index">
		<view class="user_backdrop" v-if="item.role == 'user'">
			<view>
				<image class="img" src="../../static/用户.png" mode="heightFix"></image>
				<view>{{ item.content }}</view>
			</view>
		</view>
		<!-- ai回复 -->
		<view class="Sent_information backdrop" v-else>
			<view class="loading" v-if="item.loadShow">
				<view class="loader"></view>
				<view>ai正在思考中</view>
			</view>
			<view class="ai_content" v-if="item.content != ''">
				<text user-select class="text">{{ item.content }}</text>
				<image v-if="item.copyIcon" @click="copyData(item.content)" class="img" src="../../static/复制.png"
					mode="heightFix"></image>
			</view>
		</view>
	</block>
	<!-- 底部，输入框 -->
	<view class="Input_field">
		<view>
			<image class="img" @click="clearMessage" src="../../static/刷新.png" mode="aspectFill"></image>
		</view>
		<input class="input" placeholder="你可以问我任何问题" maxlength="-1" cursor-spacing="40" confirm-type="send" auto-blur
			v-model="text" @confirm="sendMessage" :disabled="sendIngState">
		<view>
			<image class="img" src="../../static/发送.png" mode="aspectFill" @click="sendMessage"></image>
		</view>
	</view>
	<view style="height:160rpx;"></view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MenuButton } from '../../api/MenuButton';
const name = ref('EcoFarmAI')
const greetSb = ref('你好，我是您的智慧农业助手，人工智能EcoFarmAI，您可以叫我小E，现在我可以为您提供智慧农业解决方案。')
const problemDate = ref([
	'小E，帮我介绍一下什么是智慧农业',
	'小E，智慧农业可以给我们的生活提供什么帮助',
	'小E，帮我推荐几家农业庄园',
	'小E，帮我推荐些，好玩的智慧农业体验项目'
])

//用户输入问题 
const text = ref('')
//挂载方法
const SocketTask = ref(null)
//存储历史对话消息
const historyTestList = ref([])
//存储ai返回文本
const sparResult = ref('')
//存储用户与ai对话：临时数据
const messageData = ref([])
//发送状态：ai是否回复
const sendIngState = ref(false);//false:未开始对话，回复完毕，出现错误，true：正在恢复中

async function sendMessage() {
	//发送前的校验
	if (text.value.trim().length > 0) {
		text.value = text.value.trim()
	} else {
		wx.showToast({ title: '请输入询问内容', icon: 'none' })
		return false
	}
	if (sendIngState.value) {
		wx.showToast({ title: 'ai正在回复中', icon: 'none' })
		return false
	}
	messageData.value.push({
		"role": "user",
		"content": text.value
	})
	messageData.value.push({
		"role": "assistant",
		"content": '',
		"loadShow": true,
		"copyIcon": false
	})
	sparResult.value = ''
	sendIngState.value = true
	//	链接
	const wssUrl = await wx.cloud.callFunction({ name: 'gpt-wx' })
	//创建WebSocket 连接的
	SocketTask.value = uni.connectSocket({
		url: wssUrl.result.url,
		success: res => {
			console.log(res, 'ws连接成功')
		},
		fail: err => {
			console.log(err, 'ws连接失败')
			wx.showToast({ title: '出现异常', icon: 'none' })
			messageData.value = []
			sendIngState.value = false
		}
	})
	//监听失败
	SocketTask.value.onError((res) => {
		console.log('错误', res);
		wx.showToast({ title: '出现异常', icon: 'none' })
		messageData.value = []
		sendIngState.value = false
	})
	//链接打开事件监听函数
	SocketTask.value.onOpen(data => {
		console.log('成功，可以发送消息了', data)
		historyTestList.value.push({
			"role": "user",
			"content": text.value
		})
		text.value = ''
		//gpt所需要的传值
		let parms = {
			"header": {
				"app_id": wssUrl.result.APPID
				// "app_id": appid	
			},
			"parameter": {
				"chat": {
					"domain": "4.0Ultra",
					//核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
					"temperature": 0.5
				}
			},
			"payload": {
				"message": {
					"text": historyTestList.value
				}
			}
		}
		SocketTask.value.send({
			data: JSON.stringify(parms),
			success: res => {
				console.log('消息发送成功');
			},
			fail: err => {
				console.log('消息发送失败');
				wx.showToast({ title: '出现异常', icon: 'none' })
				messageData.value = []
				sendIngState.value = false
			}
		})
	})
	//调用消息接收方法
	returnMessage()
}
function returnMessage() {
	SocketTask.value.onMessage(res => {
		messageData.value[messageData.value.length - 1].loadShow = false
		const obj = JSON.parse(res.data)
		console.log(obj)
		//出现错误
		if (obj.header.code !== 0) {
			sparResult.value += obj.header.message
			messageData.value[messageData.value.length - 1].content = sparResult.value
			sendIngState.value = false
			messageData.value[messageData.value.length - 1].copyIcon = true
			return false
		}
		const dataArry = obj.payload.choices.text
		dataArry.forEach(item => {
			sparResult.value += item.content
			messageData.value[messageData.value.length - 1].content = sparResult.value
		})
		//超出页面自动滚动
		wx.pageScrollTo({
			scrollTop: 3000
		})
		//AI回复完成
		if (obj.header.code === 0 && obj.header.status === 2) {
			historyTestList.value.push({
				"role": "assistant",
				"content": sparResult.value
			})
			//打开复制按钮
			messageData.value[messageData.value.length - 1].copyIcon = true
			//打开重新输入
			sendIngState.value = false
		}
	})
}
function copyData(val) {
	wx.setClipboardData({ data: val })
}
function clearMessage() {
	if (sendIngState.value) {
		wx.showToast({ title: 'ai正在回复中', icon: 'none' })
		return false
	}
	sparResult.value = ''
	historyTestList.value = []
	messageData.value = []
}
//选择默认问题
function selectText(val) {
	text.value = val
	sendMessage()
}
</script>

<style lang="scss">
@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

@keyframes fadeInFromTop {
	0% {
		opacity: 0;
		transform: translateY(30px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

page {
	background-color: #E5EFE4;
}

.nav_bar_custom {
	height: v-bind('MenuButton().seViewHeight');
	position: fixed;
	top: 0px;
	left: 0px;
	right: 0px;
	background: linear-gradient(to bottom, #78CC68, #C8F5C8);
	z-index: 999;

	.top_height {
		height: v-bind('MenuButton().top');
	}

	.nav_content {
		padding-left: 24rpx;
		display: flex;
		align-ietms: center;

		.img {
			height: v-bind('MenuButton().height');
		}

		.nav_text {
			padding-left: 24rpx;
			display: flex;
			flex-direction: column;

			.text_1 {
				fonet-size: 28rpx;
				font-weight: bold;
			}

			.text_2 {
				font-size: 22rpx;
				color: #ffb400;
			}
		}
	}
}

.Sent_information {
	padding: 10rpx;
	margin: 20rpx;
	line-height: 1.5;
	border-radius: 10rpx;
	font-size: 30rpx;
}

.backdrop {
	border-radius: 10rpx;
	background-color: #DFECDB;
}

.your_element {
	animation-name: fadeInFromTop;
	animation-duration: 0.7s;
	animation-timing-function: ease-in;
	animation-fill-mode: forwards;

}

.widthAuto {
	width: auto;
}

.nav_content {
	.img {
		height: 48rpx;
		display: block;
		margin-right: 10rpx;
	}

	.text {
		font-size: 36rpx;
		font-weight: bold;
	}
}

.Default_problem {
	border: 1rpx solid #AAC8AC;
	border-radius: 40rpx;
	padding: 15rpx 0;
	text-align: center;
	margin: 20rpx 0;
	color: #AAC8AC;
	font-weight: bold;
}

.user_backdrop {
	//
	color: #AAC8AC;
	display: flex;
	margin: 20rpx;

	.img {
		height: 48rpx;
	}
}

.loading {
	display: flex;
	align-items: center;

	.loader {
		border: 5rpx solid #f3f3f3;
		border-top: 5rpx solid #DEECDB;
		border-radius: 50%;
		width: 40rpx;
		height: 40rpx;
		animation: spin 1s linear infinite;
		margin-right: 10rpx;
	}
}

.ai_content {
	display: flex;
	flex-direction: column;

	.text {
		border-bottom: 1px solid #f3f3f34;
		padding-bottom: 10rpx;
	}

	.img {
		height: 36rpx;
		width: 30rpx;
		align-self: flex-end;
	}

}

.Input_field {
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	border-top: 1px soloid #eeeeee;
	padding: 10rpx 10rpx 30rpx 10rpx;
	background-color: #DEECDB;

	.img {
		width: 48rpx;
		height: 48rpx;
		display: block;
	}

	.input {
		width: 100%;
		background-color: #E8F4E8;
		border-radius: 30rpx;
		padding: 20rpx;
	}
}
</style>

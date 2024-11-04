<script setup>
	import {onLaunch} from '@dcloudio/uni-app'
	onLaunch(()=>{
		let menuButtonInfo = uni.getStorageSync('MenuButton')
		if(!menuButtonInfo){
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			uni.setStorageSync('MenuButton',menuButtonInfo)
		}
		wx.cloud.init({
			env:'nygot-7gxsby4r865963df'
		})
	})
</script>

<style>
	/*每个页面公共css */
</style>

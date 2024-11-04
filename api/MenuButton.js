export const MenuButton = function(){
		let menuButtonInfo = uni.getStorageSync('MenuButton')
		const top = menuButtonInfo.top + 'px';
		const height = menuButtonInfo.height + 'px';
		const left = menuButtonInfo.left + 'px';
		const right = menuButtonInfo.right + 'px';
		const width = menuButtonInfo.width + 'px';
		const seViewHeight = menuButtonInfo.top + menuButtonInfo.height + 10 +'px';
		return{
			top,
			height,
			left,
			right,
			width,
			seViewHeight

		}
}
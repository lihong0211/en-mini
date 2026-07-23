<template>
	<image class="nb-bg-image" :src="bgSrc" mode="aspectFill" />
</template>
<script>
import bgSrc from '~@/static/bg.jpeg'

export default {
	data() {
		return { bgSrc }
	}
}
</script>
<style>
.nb-bg-image {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
}
</style>

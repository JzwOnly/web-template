<script lang="ts" setup>
import { testApi } from '~/api/test'

onMounted(async () => {
	const ret = await testApi('123')
	console.log(ret)
})
</script>
<template>
	<div>
		<div class="grid grid-cols-3">
			<a href="https://github.com/dishait/tov-template" target="_blank">
				<img :src="safeResolve('/logo.png')" class="logo" alt="Vite logo" />
			</a>
			<a href="https://vitejs.dev" target="_blank">
				<img :src="safeResolve('/vite.svg')" class="logo" alt="Vite logo" />
			</a>
			<a href="https://vuejs.org/" target="_blank">
				<img :src="safeResolve('/vue.svg')" class="logo vue" alt="Vue logo" />
			</a>
		</div>
		<HelloWorld msg="Tov + Vite + Vue" />
	</div>
</template>

<style>
.logo {
	width: 10em;
	height: 10em;
	padding: 1.5rem;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

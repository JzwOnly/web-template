import Tov from './presets'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [Tov()],
	// css: {
	// 	preprocessorOptions: {
	// 		scss: {
	// 			additionalData: `@use "@/styles/index.scss" as *;`,
	// 		},
	// 	},
	// },
})

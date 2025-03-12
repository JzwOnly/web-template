// https://unocss.dev/ 原子 css 库
import '@unocss/reset/tailwind-compat.css' // unocss reset
import 'virtual:uno.css'
import 'virtual:unocss-devtools'

import App from './App.vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'
const app = createApp(App)
app.use(VueDOMPurifyHTML)
app.mount('#app')

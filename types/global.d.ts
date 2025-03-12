import type { ComponentPublicInstance, FunctionalComponent } from 'vue'

declare global {
	// eslint-disable-next-line no-unused-vars
	declare type Nullable<T> = T | null
	// eslint-disable-next-line no-unused-vars
	declare type Recordable<T = any> = Record<string, T>
}

declare module 'vue' {
	export type JSXComponent<Props = any> =
		| { new (): ComponentPublicInstance<Props> }
		| FunctionalComponent<Props>
}

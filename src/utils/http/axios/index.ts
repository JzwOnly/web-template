// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosInstance, AxiosResponse } from 'axios'
import { clone } from 'lodash-es'
import type { RequestOptions, Result } from '#/axios'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import { VAxios } from './Axios'
import { checkStatus } from './checkStatus'
import { RequestEnum, ResultEnum, ContentTypeEnum } from '@/enums/httpEnum'
import { isString, isUndefined, isNull, isEmpty } from '@/utils/is'
import { setObjToUrlParams, deepMerge } from '@/utils'
import { joinTimestamp, formatRequestDate } from './helper'
import { AxiosRetry } from '@/utils/http/axios/axiosRetry'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import i18n from '~/plugins/i18n'
/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
	/**
	 * @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误
	 */
	transformResponseHook: (
		res: AxiosResponse<Result>,
		options: RequestOptions,
	) => {
		const { t } = i18n.global
		const { isTransformResponse, isReturnNativeResponse } = options
		// 是否返回原生响应头 比如：需要获取响应头时使用该属性
		if (isReturnNativeResponse) {
			return res
		}
		// 不进行任何处理，直接返回
		// 用于页面代码可能需要直接获取code，data，message这些信息时开启
		if (!isTransformResponse) {
			return res.data
		}
		// 错误的时候返回

		const { data } = res
		if (!data) {
			// return '[HTTP] Request has no return value';
			throw new Error(t('sys.api.apiRequestFailed'))
		}
		//  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
		const { code, result, msg } = data

		// 这里逻辑可以根据项目进行修改
		const hasSuccess =
			data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS
		if (hasSuccess) {
			let successMsg = msg

			if (
				isNull(successMsg) ||
				isUndefined(successMsg) ||
				isEmpty(successMsg)
			) {
				successMsg = t(`sys.api.operationSuccess`)
			}

			if (options.successMessageMode === 'modal') {
				ElMessageBox.alert(successMsg, t('sys.api.successTip'), {
					// if you want to disable its autofocus
					// autofocus: false,
					confirmButtonText: 'OK',
				})
			} else if (options.successMessageMode === 'message') {
				ElMessage.success(successMsg)
			}
			return result
		}

		// 在此处根据自己项目的实际情况对不同的code执行不同的操作
		// 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
		let timeoutMsg = ''
		switch (code) {
			case ResultEnum.LoginInvalid:
				timeoutMsg = t('sys.api.timeoutMessage')
				break
			case ResultEnum.TIMEOUT:
				timeoutMsg = t('sys.api.timeoutMessage')
				break
			default:
				if (msg) {
					timeoutMsg = msg
				}
		}

		// errorMessageMode='modal'的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
		// errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
		if (options.errorMessageMode === 'modal') {
			ElMessageBox.alert(timeoutMsg, t('sys.api.errorTip'), {
				// if you want to disable its autofocus
				// autofocus: false,
				confirmButtonText: 'OK',
			})
		} else if (options.errorMessageMode === 'message') {
			ElMessage.error(timeoutMsg)
		}

		throw new Error(timeoutMsg || t('sys.api.apiRequestFailed'))
	},

	// 请求之前处理config
	beforeRequestHook: (config, options) => {
		const {
			apiUrl,
			joinPrefix,
			joinParamsToUrl,
			formatDate,
			joinTime = true,
			urlPrefix,
		} = options

		if (joinPrefix) {
			config.url = `${urlPrefix}${config.url}`
		}

		if (apiUrl && isString(apiUrl)) {
			config.url = `${apiUrl}${config.url}`
		}
		const params = config.params || {}
		const data = config.data || false
		formatDate && data && !isString(data) && formatRequestDate(data)
		if (config.method?.toUpperCase() === RequestEnum.GET) {
			if (!isString(params)) {
				// 给 get 请求加上时间戳参数，避免从缓存中拿数据。
				config.params = Object.assign(
					params || {},
					joinTimestamp(joinTime, false),
				)
			} else {
				// 兼容restful风格
				config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
				config.params = undefined
			}
		} else {
			if (!isString(params)) {
				formatDate && formatRequestDate(params)
				if (
					Reflect.has(config, 'data') &&
					config.data &&
					(Object.keys(config.data).length > 0 ||
						config.data instanceof FormData)
				) {
					config.data = data
					config.params = params
				} else {
					// 非GET请求如果没有提供data，则将params视为data
					config.data = params
					config.params = undefined
				}
				if (joinParamsToUrl) {
					config.url = setObjToUrlParams(
						config.url as string,
						Object.assign({}, config.params, config.data),
					)
				}
			} else {
				// 兼容restful风格
				config.url = config.url + params
				config.params = undefined
			}
		}
		return config
	},

	/**
	 * @description: 请求拦截器处理
	 */
	requestInterceptors: (config, options) => {
		// 请求之前处理config
		// eslint-disable-next-line no-undef
		if ((config as Recordable)?.requestOptions?.withToken !== false) {
			// jwt token
			// eslint-disable-next-line no-undef
			;(config as Recordable).headers.Authorization =
				options.authenticationScheme ? `${options.authenticationScheme}` : ''
		}
		return config
	},

	/**
	 * @description: 响应拦截器处理
	 */
	responseInterceptors: (res: AxiosResponse<any>) => {
		return res
	},

	/**
	 * @description: 响应错误处理
	 */
	responseInterceptorsCatch: (axiosInstance: AxiosInstance, error: any) => {
		const { t } = i18n.global
		const { response, code, message, config } = error || {}
		const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none'
		const msg: string = response?.data?.error?.message ?? ''
		const err: string = error?.toString?.() ?? ''
		let errMessage = ''

		if (axios.isCancel(error)) {
			return Promise.reject(error)
		}

		try {
			if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
				errMessage = t('sys.api.apiTimeoutMessage')
			}
			if (err?.includes('Network Error')) {
				errMessage = t('sys.api.networkExceptionMsg')
			}

			if (errMessage) {
				if (errorMessageMode === 'modal') {
					ElMessageBox.alert(errMessage, t('sys.api.errorTip'), {
						// if you want to disable its autofocus
						// autofocus: false,
						confirmButtonText: 'OK',
					})
				} else if (errorMessageMode === 'message') {
					ElMessage.error(errMessage)
				}
				return Promise.reject(error)
			}
		} catch (error) {
			throw new Error(error as unknown as string)
		}

		checkStatus(error?.response?.status, msg, errorMessageMode)

		// 添加自动重试机制 保险起见 只针对GET请求
		const retryRequest = new AxiosRetry()
		const { isOpenRetry } = config.requestOptions.retryRequest
		config.method?.toUpperCase() === RequestEnum.GET &&
			isOpenRetry &&
			error?.response?.status !== 401 &&
			// @ts-ignore
			retryRequest.retry(axiosInstance, error)
		return Promise.reject(error)
	},
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
	return new VAxios(
		// 深度合并
		deepMerge(
			{
				// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
				// authentication schemes，e.g: Bearer
				// authenticationScheme: 'Bearer',
				authenticationScheme: 'Bearer',
				timeout: 10 * 1000,
				// 基础接口地址
				// baseURL: globSetting.apiUrl,
				withCredentials: true,
				headers: { 'Content-Type': ContentTypeEnum.JSON },
				// 如果是form-data格式
				// headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
				// 数据处理方式
				transform: clone(transform),
				// 配置项，下面的选项都可以在独立的接口请求中覆盖
				requestOptions: {
					// 默认将prefix 添加到url
					joinPrefix: true,
					// 是否返回原生响应头 比如：需要获取响应头时使用该属性
					isReturnNativeResponse: false,
					// 需要对返回数据进行处理
					isTransformResponse: true,
					// post请求的时候添加参数到url
					joinParamsToUrl: false,
					// 格式化提交参数时间
					formatDate: true,
					// 消息提示类型
					errorMessageMode: 'message',
					// 接口地址
					apiUrl: import.meta.env.VITE_API_BASE_URL,
					// 接口拼接地址
					urlPrefix: '',
					//  是否加入时间戳
					joinTime: true,
					// 忽略重复请求
					ignoreCancelToken: true,
					// 是否携带token
					withToken: true,
					retryRequest: {
						isOpenRetry: true,
						count: 3,
						waitTime: 100,
					},
				},
			},
			opt || {},
		),
	)
}
export const defHttp = createAxios()

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//     urlPrefix: 'xxx',
//   },
// });

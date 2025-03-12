import { isObject, isString } from '@/utils/is'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export function joinTimestamp<T extends boolean>(
	// eslint-disable-next-line no-unused-vars
	join: boolean,
	// eslint-disable-next-line no-unused-vars
	restful: T,
): T extends true ? string : object

// eslint-disable-next-line no-redeclare
export function joinTimestamp(join: boolean, restful = false): string | object {
	if (!join) {
		return restful ? '' : {}
	}
	const now = new Date().getTime()
	if (restful) {
		return `?_t=${now}`
	}
	return { _t: now }
}

/**
 * @description: Format request parameter time
 */
// eslint-disable-next-line no-undef
export function formatRequestDate(params: Recordable) {
	if (Object.prototype.toString.call(params) !== '[object Object]') {
		return
	}

	for (const key in params) {
		const format = params[key]?.format ?? null
		if (format && typeof format === 'function') {
			params[key] = params[key].format(DATE_TIME_FORMAT)
		}
		if (isString(key)) {
			const value = params[key]
			if (value) {
				try {
					params[key] = isString(value) ? value.trim() : value
				} catch (error: any) {
					throw new Error(error)
				}
			}
		}
		if (isObject(params[key])) {
			formatRequestDate(params[key])
		}
	}
}

/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'

export function formatToDateTime(
	date?: dayjs.ConfigType,
	format = DATE_TIME_FORMAT,
): string {
	return dayjs(date).format(format)
}

export function formatToDate(
	date?: dayjs.ConfigType,
	format = DATE_FORMAT,
): string {
	return dayjs(date).format(format)
}
/**
 * 获取UTC时间戳
 * @param timeString 支持三种格式：'2021-08-24 14:30:00'、'2021-08-24T14:30:00Z'、'2021-08-24T14:30:00.000Z'
 * @returns UTC时间戳
 */
export function getUTCDate(timeString: string) {
	dayjs.extend(utc)
	return dayjs(timeString).utc().startOf('minute').format()
}

export function diffDay(aDateString: string, bDateString: string) {
	return dayjs(aDateString)
		.startOf('day')
		.diff(dayjs(bDateString).startOf('day'), 'day')
}

/**
 * 获取两个时间段间隔的天数（以当天00:00:00为基准）
 * @param startDateString
 * @param endDateString
 * @returns 间隔的天数
 */
export function diffDays(startDateString: string, endDateString: string) {
	const intervalDayList: string[] = []
	const intervalDays = dayjs(endDateString)
		.startOf('day')
		.diff(dayjs(startDateString).startOf('day'), 'day')
	for (let i = 0; i < intervalDays; i++) {
		const dateString = dayjs(startDateString)
			.startOf('day')
			.add(i + 1, 'day')
			.format(DATE_TIME_FORMAT)
		intervalDayList.push(dateString)
	}
	return intervalDayList
}

export const dateUtil = dayjs

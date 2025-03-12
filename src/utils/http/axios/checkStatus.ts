import type { ErrorMessageMode } from '#/axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import i18n from '~/plugins/i18n'

export function checkStatus(
	status: number,
	msg: string,
	errorMessageMode: ErrorMessageMode = 'message',
): void {
	const { t } = i18n.global
	let errMessage = ''

	switch (status) {
		case 400:
			errMessage = `${msg}`
			break
		// 401: Not logged in
		// Jump to the login page if not logged in, and carry the path of the current page
		// Return to the current page after successful login. This step needs to be operated on the login page.
		case 403:
			errMessage = t('sys.api.errMsg403')
			break
		// 404请求不存在
		case 404:
			errMessage = t('sys.api.errMsg404')
			break
		case 405:
			errMessage = t('sys.api.errMsg405')
			break
		case 408:
			errMessage = t('sys.api.errMsg408')
			break
		case 500:
			errMessage = t('sys.api.errMsg500')
			break
		case 501:
			errMessage = t('sys.api.errMsg501')
			break
		case 502:
			errMessage = t('sys.api.errMsg502')
			break
		case 503:
			errMessage = t('sys.api.errMsg503')
			break
		case 504:
			errMessage = t('sys.api.errMsg504')
			break
		case 505:
			errMessage = t('sys.api.errMsg505')
			break
		default:
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
	}
}

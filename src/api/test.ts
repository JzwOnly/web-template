import { defHttp } from '~/utils/http/axios'

enum Api {
	ACTIVITY_URL = '/web/getActivityUrl',
}

export const testApi = (activityNumber: string) =>
	defHttp.get<any>({
		url: Api.ACTIVITY_URL,
		params: {
			activityNumber,
		},
	})

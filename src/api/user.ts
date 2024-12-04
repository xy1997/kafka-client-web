import service from '@/utils/request'

export const useUserInfoApi = () => {
	return service.get('/user/info')
}


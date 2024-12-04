import service from '@/utils/request'

export const useLoginApi = (data: any) => {
	return service.post("/user/login", data);
}

export const useLogoutApi = () => {
	return service.post('/user/loginOut')
}

import service from '@/utils/request'

export function useMenuNavApi() {
	return service.get('/user/menus')
}


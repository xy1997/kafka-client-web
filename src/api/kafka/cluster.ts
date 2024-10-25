import service from '@/utils/request'

export const addCluster = (data: any) => {
    return service.post('/kafka/broker/add', data)
}

export const describeCluster = () => {
    return service.get('/kafka/broker/describeCluster')
}

export const update = (data: any) => {
    return service.post('/kafka/broker/update', data)
}

export const detail = (data: any) => {
    return service.get('/kafka/broker/detail?id=' + data)
}

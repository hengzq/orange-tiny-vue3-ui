import axios from 'axios';

// 获取select的option
export function getUserData() {
    return axios.get('/user/getdata');
}

export function getUserPractic() {
    return axios.get('/user/getrpractic');
}

export function getUserTrain() {
    return axios.get('/user/getrtrain');
}

// 切换数据源
export function getUserChange(data: string) {
    return axios.post('/user/getselect', data as any);
}

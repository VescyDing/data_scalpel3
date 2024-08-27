// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import _ from 'lodash';

const baseUrl = `${process.env.NODE_ENV == 'development' ? '/proxy/' : '/'}api/v1`;

const listTransIn = (data: { [key: string]: any }) => {
  const { current, pageSize, ...rest } = data;
  const limit = (current - 1) + ',' + pageSize;
  const search = _.join(_.filter(_.map(rest, (value, key) => value ? key.slice(0, 2) == '**' ? `${key.slice(2)}:${value}` : `${key}:*${value}*` : ''), value => value), ' and ')
  return {
    limit,
    search,
  }
}

const listTransOut = (data: { code: string, data: { content: any[], totalElements: number }, detail: string, message: string }) => {
  return {
    data: data.data.content,
    success: data.code == '200',
    total: data.data.totalElements,
  }
}

const roles = {
  get: async (
    data?: { [key: string]: any },
  ) => {
    return listTransOut(await request(`${baseUrl}/roles?${(new URLSearchParams(listTransIn(data ?? {}))).toString()}`, {
      method: 'GET',
    }));
  },
  put: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/roles/${data.id}`, {
      method: 'PUT',
      data
    });
  },
  post: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/roles`, {
      method: 'POST',
      data
    });
  },
  delete: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/roles/${data.id}`, {
      method: 'DELETE',
    });
  },
}

const dict = {
  get: async (
    data?: { [key: string]: any },
  ) => {
    return listTransOut(await request(`${baseUrl}/dict?${(new URLSearchParams(listTransIn(data ?? {}))).toString()}`, {
      method: 'GET',
    }));
  },
}

export {
  roles,
  dict,
}
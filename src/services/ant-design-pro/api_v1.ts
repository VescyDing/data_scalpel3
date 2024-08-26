// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';


const baseUrl = `${process.env.NODE_ENV == 'development' ? '/proxy/' : '/'}api/v1`;
console.log('process.env.NODE_ENV :>> ', process.env.NODE_ENV);

const transIn = (data: { [key: string]: any }) => {
  const limit = (data.current - 1) + ',' + data.pageSize;
  return {
    limit,
  }
}

const transOut = (data: { code: string, data: { content: any[], totalElements: number }, detail: string, message: string }) => {
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
    return transOut(await request(`${baseUrl}/roles?${(new URLSearchParams(transIn(data ?? {}))).toString()}`, {
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
      data
    });
  },
}

export {
  roles,
}
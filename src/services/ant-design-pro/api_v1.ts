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
  put: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/dict/${data.id}`, {
      method: 'PUT',
      data
    });
  },
  post: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/dict`, {
      method: 'POST',
      data
    });
  },
  delete: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/dict/${data.id}`, {
      method: 'DELETE',
    });
  },
}

const users = {
  get: async (
    data?: { [key: string]: any },
  ) => {
    return listTransOut(await request(`${baseUrl}/users?${(new URLSearchParams(listTransIn(data ?? {}))).toString()}`, {
      method: 'GET',
    }));
  },
  put: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/users/${data.id}`, {
      method: 'PUT',
      data
    });
  },
  post: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/users`, {
      method: 'POST',
      data
    });
  },
  delete: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/users/${data.id}`, {
      method: 'DELETE',
    });
  },
  enable: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/users/${data.id}/actions/enable`, {
      method: 'POST',
    });
  },
  disable: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/users/${data.id}/actions/disable`, {
      method: 'POST',
      data
    });
  },
  changePassword: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/users/${data.id}/actions/change-password`, {
      method: 'POST',
      data
    });
  },
}

const dataSources = {
  get: async (
    data?: { [key: string]: any },
  ) => {
    return listTransOut(await request(`${baseUrl}/data-sources?${(new URLSearchParams(listTransIn(data ?? {}))).toString()}`, {
      method: 'GET',
    }));
  },
  put: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/data-sources/${data.id}`, {
      method: 'PUT',
      data
    });
  },
  post: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/data-sources`, {
      method: 'POST',
      data
    });
  },
  delete: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/data-sources/${data.id}`, {
      method: 'DELETE',
    });
  },
}
const catalogs = {
  get: async (
    data?: { [key: string]: any },
  ) => {
    return await request(`${baseUrl}/catalogs?${(new URLSearchParams(data ?? {})).toString()}`, {
      method: 'GET',
    });
  },
  put: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/catalogs/${data.id}`, {
      method: 'PUT',
      data
    });
  },
  post: async (data?: { [key: string]: any }) => {
    return request(`${baseUrl}/catalogs`, {
      method: 'POST',
      data
    });
  },
  delete: async (data: { [key: string]: any }) => {
    return request(`${baseUrl}/catalogs/${data.id}`, {
      method: 'DELETE',
    });
  },
}
export {
  roles,
  dict,
  users,
  dataSources,
  catalogs,
}
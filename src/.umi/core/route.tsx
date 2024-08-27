// @ts-nocheck
// This file is generated by Umi automatically
// DO NOT CHANGE IT MANUALLY!
import React from 'react';

export async function getRoutes() {
  const routes = {"1":{"path":"/user","layout":false,"id":"1"},"2":{"name":"login","path":"/user/login","parentId":"1","id":"2"},"3":{"path":"/welcome","name":"welcome","icon":"smile","parentId":"ant-design-pro-layout","id":"3"},"4":{"path":"/admin","name":"admin","icon":"crown","access":"canAdmin","parentId":"ant-design-pro-layout","id":"4"},"5":{"path":"/admin","redirect":"/admin/sub-page","parentId":"4","id":"5"},"6":{"path":"/admin/sub-page","name":"sub-page","parentId":"4","id":"6"},"7":{"path":"/","redirect":"/welcome","parentId":"ant-design-pro-layout","id":"7"},"8":{"path":"*","layout":false,"id":"8"},"9":{"path":"/xtgl","name":"系统管理","icon":"setting","parentId":"ant-design-pro-layout","id":"9"},"10":{"path":"jsyq/list","name":"计算引擎","icon":"","parentId":"9","id":"10"},"11":{"path":"sjcc/list","name":"数据存储","icon":"","parentId":"9","id":"11"},"12":{"path":"xtrz/list","name":"系统日志","icon":"","parentId":"9","id":"12"},"13":{"path":"roles/list","name":"角色管理","icon":"user","parentId":"9","id":"13"},"14":{"path":"zdgl/list","name":"字典管理","icon":"","parentId":"9","id":"14"},"15":{"path":"yhgl/list","name":"用户管理","icon":"","parentId":"9","id":"15"},"ant-design-pro-layout":{"id":"ant-design-pro-layout","path":"/","isLayout":true},"umi/plugin/openapi":{"path":"/umi/plugin/openapi","id":"umi/plugin/openapi"}} as const;
  return {
    routes,
    routeComponents: {
'1': React.lazy(() => import('./EmptyRoute')),
'2': React.lazy(() => import(/* webpackChunkName: "p__User__Login__index" */'@/pages/User/Login/index.tsx')),
'3': React.lazy(() => import(/* webpackChunkName: "p__Welcome" */'@/pages/Welcome.tsx')),
'4': React.lazy(() => import('./EmptyRoute')),
'5': React.lazy(() => import('./EmptyRoute')),
'6': React.lazy(() => import(/* webpackChunkName: "p__Admin" */'@/pages/Admin.tsx')),
'7': React.lazy(() => import('./EmptyRoute')),
'8': React.lazy(() => import(/* webpackChunkName: "p__404" */'@/pages/404.tsx')),
'9': React.lazy(() => import('./EmptyRoute')),
'10': React.lazy(() => import(/* webpackChunkName: "p__dev__index" */'@/pages/dev/index.tsx')),
'11': React.lazy(() => import(/* webpackChunkName: "p__dev__index" */'@/pages/dev/index.tsx')),
'12': React.lazy(() => import(/* webpackChunkName: "p__dev__index" */'@/pages/dev/index.tsx')),
'13': React.lazy(() => import(/* webpackChunkName: "p__roles__list" */'@/pages/roles/list.tsx')),
'14': React.lazy(() => import(/* webpackChunkName: "p__dev__index" */'@/pages/dev/index.tsx')),
'15': React.lazy(() => import(/* webpackChunkName: "p__dev__index" */'@/pages/dev/index.tsx')),
'ant-design-pro-layout': React.lazy(() => import(/* webpackChunkName: "umi__plugin-layout__Layout" */'/Users/dwx/Desktop/workspace/gistack/data_scalpel3/src/.umi/plugin-layout/Layout.tsx')),
'umi/plugin/openapi': React.lazy(() => import(/* webpackChunkName: "umi__plugin-openapi__openapi" */'/Users/dwx/Desktop/workspace/gistack/data_scalpel3/src/.umi/plugin-openapi/openapi.tsx')),
},
  };
}

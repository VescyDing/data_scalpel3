import React from 'react';
import { Button, Result } from 'antd';
import { history } from '@umijs/max';

export default () => <Result
    status="403"
    title="开发中..."
    subTitle="抱歉，此页面还在开发中，敬请期待..."
    extra={<Button type="primary" onClick={() => history.go(-1)} >返回</Button>}
/>
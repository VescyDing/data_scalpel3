import React, { useRef, useState, useEffect } from 'react';
import {
    PageContainer,
} from '@ant-design/pro-components';
import { dataFiles, } from '@/services/ant-design-pro/api_v1';
import { message } from "antd";
import { history, useParams, } from '@umijs/max';
import { v4 as uuidv4 } from 'uuid';

export default () => {

    const startId = uuidv4()
    const [data, _data] = useState()
    const params = useParams();

    useEffect(() => {
        const hide = message.loading('加载中...');
        dataFiles.detail(params).then((res) => {
            _data(res)
            hide()
        })
    }, [])

    return <PageContainer >
        <div style={{ width: '100%', padding: 0, height: 'calc(100vh - 206px)', }}>
        </div>
    </PageContainer>
}
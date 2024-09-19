import React, { useRef, useState, useEffect } from 'react';
import {
    PageContainer,
} from '@ant-design/pro-components';
import { tasks, } from '@/services/ant-design-pro/api_v1';
import { Breadcrumb, message } from "antd";
import { history, useParams, } from '@umijs/max';
import { v4 as uuidv4 } from 'uuid';
import WorkFlow from './WorkFlow'

export default () => {

    const startId = uuidv4()
    const [data, _data] = useState()
    const params = useParams();

    useEffect(async () => {
        const hide = message.loading('加载中...');
        const res = await tasks.detail(params)
        const canvas = {
            nodes: [
                {
                    "id": startId,
                    "shape": "data-processing-dag-node",
                    "x": 0,
                    "y": 100,
                    "ports": [
                        {
                            "id": `${startId}-out`,
                            "group": "out"
                        }
                    ],
                    "data": {
                        "name": "开始",
                        "type": ".start.Start",
                        "status": "success"
                    }
                },
            ],
            lines: []
        }
        const { definition } = res.data;
        _data(definition ?? JSON.stringify({ type: 'BATCH_CANVAS', canvas: JSON.stringify(canvas) }))
        hide()
    }, [])

    const setData = async (__data: any) => {
        const definition = JSON.stringify({ type: 'BATCH_CANVAS', ...__data })
        const hide = message.loading('保存中...');
        await tasks.definition({
            ...params,
            definition
        })
        hide()
    }

    return <PageContainer title='任务配置' breadcrumb={<Breadcrumb className='ant-page-header-breadcrumb' routes={[{ breadcrumbName: '数据汇聚' }, { breadcrumbName: '任务配置' }]} />} >
        <div style={{ width: '100%', padding: 0, height: 'calc(100vh - 206px)' }}>
            <WorkFlow data={data} setData={setData} />
        </div>
    </PageContainer>
}
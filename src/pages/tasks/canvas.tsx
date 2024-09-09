import React, { useRef, useState, useEffect } from 'react';
import {
    PageContainer,
} from '@ant-design/pro-components';
import { tasks, } from '@/services/ant-design-pro/api_v1';
import { Breadcrumb } from "antd";
import { history, useParams } from '@umijs/max';
import { v4 as uuidv4 } from 'uuid';
import WorkFlow from './WorkFlow'

const data = {
    "nodes": [
        {
            "id": "node-0",
            "shape": "data-processing-dag-node",
            "x": 0,
            "y": 100,
            "ports": [
                {
                    "id": "node-0-out",
                    "group": "out"
                }
            ],
            "data": {
                "name": "数据输入_1",
                "type": "INPUT",
                "checkStatus": "sucess"
            }
        },
        {
            "id": "node-1",
            "shape": "data-processing-dag-node",
            "x": 250,
            "y": 100,
            "ports": [
                {
                    "id": "node-1-in",
                    "group": "in"
                },
                {
                    "id": "node-1-out",
                    "group": "out"
                }
            ],
            "data": {
                "name": "数据筛选_1",
                "type": "FILTER"
            }
        },
        {
            "id": "node-2",
            "shape": "data-processing-dag-node",
            "x": 250,
            "y": 200,
            "ports": [
                {
                    "id": "node-2-out",
                    "group": "out"
                }
            ],
            "data": {
                "name": "数据输入_2",
                "type": "INPUT"
            }
        },
        {
            "id": "node-3",
            "shape": "data-processing-dag-node",
            "x": 500,
            "y": 100,
            "ports": [
                {
                    "id": "node-3-in",
                    "group": "in"
                },
                {
                    "id": "node-3-out",
                    "group": "out"
                }
            ],
            "data": {
                "name": "数据连接_1",
                "type": "JOIN"
            }
        },
        {
            "id": "node-4",
            "shape": "data-processing-dag-node",
            "x": 750,
            "y": 100,
            "ports": [
                {
                    "id": "node-4-in",
                    "group": "in"
                }
            ],
            "data": {
                "name": "数据输出_1",
                "type": "OUTPUT"
            }
        }
    ],
    "edges": [
        {
            "id": "edge-0",
            "source": {
                "cell": "node-0",
                "port": "node-0-out"
            },
            "target": {
                "cell": "node-1",
                "port": "node-1-in"
            },
            "shape": "data-processing-curve",
            "zIndex": -1,
            "data": {
                "source": "node-0",
                "target": "node-1"
            }
        },
        {
            "id": "edge-1",
            "source": {
                "cell": "node-2",
                "port": "node-2-out"
            },
            "target": {
                "cell": "node-3",
                "port": "node-3-in"
            },
            "shape": "data-processing-curve",
            "zIndex": -1,
            "data": {
                "source": "node-2",
                "target": "node-3"
            }
        },
        {
            "id": "edge-2",
            "source": {
                "cell": "node-1",
                "port": "node-1-out"
            },
            "target": {
                "cell": "node-3",
                "port": "node-3-in"
            },
            "shape": "data-processing-curve",
            "zIndex": -1,
            "data": {
                "source": "node-1",
                "target": "node-3"
            }
        },
        {
            "id": "edge-3",
            "source": {
                "cell": "node-3",
                "port": "node-3-out"
            },
            "target": {
                "cell": "node-4",
                "port": "node-4-in"
            },
            "shape": "data-processing-curve",
            "zIndex": -1,
            "data": {
                "source": "node-3",
                "target": "node-4"
            }
        }
    ]
}

export default () => {
    const startId = uuidv4()
    const [data, _data] = useState({
        "nodes": [
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
                    "type": "INPUT",
                    "nodeType": "start",
                    "checkStatus": "sucess"
                }
            },
        ],
        "edges": [],
    })
    const params = useParams();
    useEffect(() => {
        tasks.detail(params).then(res => {
            console.log('res :>> ', res);
        })
    }, [])
    return <PageContainer title='任务配置' breadcrumb={<Breadcrumb className='ant-page-header-breadcrumb' routes={[{ breadcrumbName: '数据汇聚' }, { breadcrumbName: '任务配置' }]} />} >
        <div id="minimap" style={{
            position: 'absolute',
            zIndex: 99,
            // left: '50%',
            // transform: 'translateX(-50%)',
            top: '-90px',
            right: '39px'
        }}
        ></div>
        <div style={{ width: '100%', padding: 0, height: 'calc(100vh - 206px)' }}>
            <WorkFlow data={data} />
        </div>
    </PageContainer>
}
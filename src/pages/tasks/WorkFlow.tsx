import React, { useEffect, useState } from 'react'
import { Graph, Node, Path, Edge, Platform, StringExt } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import classnames from 'classnames'
import { register } from '@antv/x6-react-shape'
import { Tooltip, Dropdown, Drawer, Space, Button, message } from 'antd'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { History } from '@antv/x6-plugin-history'
import { MiniMap } from '@antv/x6-plugin-minimap'
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash'

let graph: Graph;

// 元素校验状态
enum CellStatus {
    DEFAULT = 'default',
    SUCCESS = 'success',
    ERROR = 'error',
}

// 节点位置信息
interface Position {
    x: number
    y: number
}

// 加工类型列表
const PROCESSING_TYPE_LIST = [
    {
        type: '.input.JdbcInput',
        nodeType: 'JdbcInput',
        name: '关系数据库抽取',
    },

]

// 不同节点类型的icon
const NODE_TYPE_LOGO = {
    Start: <svg t="1725897005516" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3194" width="24" height="24"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#3A78F2" p-id="3195"></path><path d="M399.075556 734.833778a65.422222 65.422222 0 0 0 71.566222-3.811556l209.521778-145.92a87.608889 87.608889 0 0 0 36.636444-72.988444 85.048889 85.048889 0 0 0-35.498667-71.054222l-211.342222-145.635556a65.877333 65.877333 0 0 0-71.850667-3.754667A86.471111 86.471111 0 0 0 358.4 367.559111v291.328a85.902222 85.902222 0 0 0 40.618667 75.946667z" fill="#FFFFFF" p-id="3196"></path></svg>,
    JdbcInput: <svg t="1725946348024" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3533" width="24" height="24"><path d="M0 0h1023.999872v1023.999872H0z" fill="#D2142F" p-id="3534"></path><path d="M1023.999872 102.399987l-0.0128 584.908727-336.691158 336.678358L102.399987 1023.999872a101.964787 101.964787 0 0 1-63.103992-21.759997L1002.239875 39.295995A101.964787 101.964787 0 0 1 1023.999872 102.399987z" fill="#DB4358" p-id="3535"></path><path d="M235.775971 612.351923c21.247997 0 36.607995-5.375999 46.335994-16.127998 8.703999-10.239999 13.055998-25.599997 13.055998-46.591994v-123.647984h-29.951996v122.623984c0 13.055998-2.304 22.527997-6.911999 28.415997-4.607999 5.887999-12.031998 8.959999-22.015998 8.959999-18.175998 0-27.135997-10.495999-27.135996-31.487996v-5.632H179.199978v5.888c0 17.919998 4.863999 31.999996 14.591998 42.239994 9.471999 10.239999 23.551997 15.359998 41.983995 15.359998z m162.047979-3.583999c29.695996 0 51.967994-8.191999 67.327992-24.575997 14.591998-15.615998 22.015997-37.887995 22.015997-66.815992 0-29.183996-7.423999-51.455994-22.015997-66.815991-15.359998-16.383998-37.631995-24.575997-67.327992-24.575997h-66.815991v182.783977h66.815991z m-5.631999-25.599997H360.959955V451.583944h31.231996c22.783997 0 39.423995 5.119999 49.919994 15.615998 10.239999 10.239999 15.359998 27.135997 15.359998 50.175993 0 22.527997-5.119999 39.167995-15.359998 49.919994-10.495999 10.495999-27.135997 15.871998-49.919994 15.871998z m207.103974 25.599997c19.455998 0 34.815996-3.584 45.567994-10.751999 12.543998-8.703999 18.943998-22.271997 18.943998-40.703995 0-12.287998-3.072-22.271997-8.959999-29.439996-6.143999-7.423999-15.103998-12.287998-27.135996-14.591998 9.215999-3.584 16.127998-8.447999 20.991997-15.103998 4.863999-7.167999 7.423999-15.871998 7.423999-26.111997 0-13.823998-4.863999-24.831997-14.335998-33.023996-10.239999-8.703999-24.575997-13.055998-42.751995-13.055998h-83.711989v182.783977h83.967989z m-8.191999-105.983987H545.279932V450.559944h46.335994c12.287998 0 20.991997 2.048 26.623997 6.143999 5.119999 3.84 7.935999 10.239999 7.935999 18.943998 0 9.471999-2.816 16.383998-7.935999 20.735997-5.375999 4.095999-14.335998 6.399999-27.135997 6.399999z m3.84 81.40799H545.279932V527.359934h50.431994c13.311998 0 23.039997 2.304 29.183996 6.911999 5.887999 4.607999 8.959999 12.031998 8.959999 22.527997 0 10.239999-4.095999 17.407998-12.287999 22.015998-6.399999 3.584-15.359998 5.375999-26.623996 5.375999z m176.895978 28.159996c19.711998 0 36.607995-5.631999 50.687993-16.895997 15.103998-12.031998 24.575997-28.671996 28.671997-50.175994h-29.183997c-3.584 13.823998-9.727999 24.319997-18.431997 31.231996-8.191999 6.143999-18.943998 9.471999-31.999996 9.471999-19.967998 0-34.815996-6.399999-44.287995-18.687998-8.703999-11.519999-13.055998-28.159996-13.055998-49.663994 0-20.991997 4.351999-37.375995 13.311998-49.151994 9.727999-13.311998 24.063997-19.711998 43.263995-19.711997 12.799998 0 23.295997 2.56 31.487996 8.191999 8.447999 5.631999 14.079998 14.335998 17.151998 26.367997h29.183996c-2.816-18.431998-10.751999-33.279996-24.063997-44.031995-13.823998-11.263999-31.743996-16.895998-53.247993-16.895998-29.183996 0-51.455994 9.471999-66.815992 28.927997-13.567998 16.895998-20.223997 39.167995-20.223998 66.303991 0 27.647997 6.399999 49.663994 19.455998 66.047992 14.847998 18.943998 37.631995 28.671996 68.095992 28.671996z" fill="#FFFFFF" p-id="3536"></path></svg>,
}

/**
 * 根据起点初始下游节点的位置信息
 * @param node 起始节点
 * @param graph
 * @returns
 */
const getDownstreamNodePosition = (
    node: Node,
    graph: Graph,
    dx = 250,
    dy = 100,
) => {
    // 找出画布中以该起始节点为起点的相关边的终点id集合
    const downstreamNodeIdList: string[] = []
    graph.getEdges().forEach((edge) => {
        const originEdge = edge.toJSON()?.data
        if (originEdge.source === node.id) {
            downstreamNodeIdList.push(originEdge.target)
        }
    })
    // 获取起点的位置信息
    const position = node.getPosition()
    let minX = Infinity
    let maxY = -Infinity
    graph.getNodes().forEach((graphNode) => {
        if (downstreamNodeIdList.indexOf(graphNode.id) > -1) {
            const nodePosition = graphNode.getPosition()
            // 找到所有节点中最左侧的节点的x坐标
            if (nodePosition.x < minX) {
                minX = nodePosition.x
            }
            // 找到所有节点中最x下方的节点的y坐标
            if (nodePosition.y > maxY) {
                maxY = nodePosition.y
            }
        }
    })

    return {
        x: minX !== Infinity ? minX : position.x + dx,
        y: maxY !== -Infinity ? maxY + dy : position.y,
    }
}

// 根据节点的类型获取ports
const getPortsByType = (type: string, nodeId: string) => {
    let ports = []
    switch (type.split('.')[1]) {
        case 'input':
            ports = [
                {
                    id: `${nodeId}-out`,
                    group: 'out',
                },
            ]
            break
        case 'output':
            ports = [
                {
                    id: `${nodeId}-in`,
                    group: 'in',
                },
            ]
            break
        default:
            ports = [
                {
                    id: `${nodeId}-in`,
                    group: 'in',
                },
                {
                    id: `${nodeId}-out`,
                    group: 'out',
                },
            ]
            break
    }
    return ports
}

/**
 * 创建节点并添加到画布
 * @param type 节点类型
 * @param graph
 * @param position 节点位置
 * @returns
 */
export const createNode = (
    nodeType: string,
    graph: Graph,
    position?: Position,
) => {
    if (!graph) {
        return {}
    }
    let newNode = {}
    const id = uuidv4()
    const nodeTmplate = _.find(PROCESSING_TYPE_LIST, { nodeType })
    const type = nodeTmplate?.type
    const node = {
        id,
        shape: 'data-processing-dag-node',
        x: position?.x,
        y: position?.y,
        ports: getPortsByType(type, id),
        data: {
            ...nodeTmplate,
        },
    }
    newNode = graph.addNode(node)
    return newNode
}

/**
 * 创建边并添加到画布
 * @param source
 * @param target
 * @param graph
 */
const createEdge = (source: string, target: string, graph: Graph) => {
    const edge = {
        id: StringExt.uuid(),
        shape: 'data-processing-curve',
        source: {
            cell: source,
            port: `${source}-out`,
        },
        target: {
            cell: target,
            port: `${target}-in`,
        },
        zIndex: -1,
        data: {
            source,
            target,
        },
    }
    if (graph) {
        graph.addEdge(edge)
        graph.zoomToFit()
    }
}

//  获取+号下拉菜单
const getPlusDagMenu = (props = { className: '', clickPlusDragMenu: () => null }) => {
    return (
        <ul className={props.className} >
            {PROCESSING_TYPE_LIST.map((item) => {
                const content = (
                    // eslint-disable-next-line
                    <a>
                        <i
                            className="node-mini-logo"
                        >
                            {NODE_TYPE_LOGO[item.nodeType]}
                        </i>
                        <span>{item.name}</span>
                    </a>
                )
                return (
                    <li className="each-sub-menu" key={item.type} onClick={() => props.clickPlusDragMenu(item.nodeType)}>
                        {content}
                    </li>
                )
            })}
        </ul>
    )
}

class DataProcessingDagNode extends React.Component<{
    node: Node
}> {
    state = {
        plusActionSelected: false,
    }

    // 创建下游的节点和边
    createDownstream = (nodeType: string) => {
        const { node } = this.props
        const { graph } = node.model || {}
        if (graph) {
            // 获取下游节点的初始位置信息
            const position = getDownstreamNodePosition(node, graph)
            // 创建下游节点
            const newNode = createNode(nodeType, graph, position)
            const source = node.id
            const target = newNode.id
            // 创建该节点出发到下游节点的边
            createEdge(source, target, graph)
        }
    }

    // 点击添加下游+号
    clickPlusDragMenu = (nodeType: string) => {
        this.createDownstream(nodeType)
        this.setState({
            plusActionSelected: false,
        })
    }

    // 添加下游菜单的打开状态变化
    onPlusDropdownOpenChange = (value: boolean) => {
        this.setState({
            plusActionSelected: value,
        })
    }

    // 鼠标进入矩形主区域的时候显示连接桩
    onMainMouseEnter = () => {
        const { node } = this.props
        // 获取该节点下的所有连接桩
        const ports = node.getPorts() || []
        ports.forEach((port) => {
            node.setPortProp(port.id, 'attrs/circle', {
                fill: '#fff',
                stroke: '#85A5FF',
            })
        })
    }

    // 鼠标离开矩形主区域的时候隐藏连接桩
    onMainMouseLeave = () => {
        const { node } = this.props
        // 获取该节点下的所有连接桩
        const ports = node.getPorts() || []
        ports.forEach((port) => {
            node.setPortProp(port.id, 'attrs/circle', {
                fill: 'transparent',
                stroke: 'transparent',
            })
        })
    }

    render() {
        const { plusActionSelected } = this.state
        const { node } = this.props
        const data = node?.getData()
        const { name, type, status = 'default', statusMsg, nodeType } = data

        return (
            <div className="data-processing-dag-node">
                <div
                    className="main-area"
                    onMouseEnter={this.onMainMouseEnter}
                    onMouseLeave={this.onMainMouseLeave}
                >
                    <div className="main-info">
                        {/* 节点类型icon */}
                        <i
                            className="node-logo"
                        >
                            {NODE_TYPE_LOGO[nodeType]}
                        </i>
                        <Tooltip title={name} mouseEnterDelay={0.8}>
                            <div className="ellipsis-row node-name">{name}</div>
                        </Tooltip>
                    </div>

                    {/* 节点状态信息 */}
                    <div className="status-action">
                        {status === CellStatus.ERROR && (
                            <Tooltip title={statusMsg}>
                                <i className="status-icon" >
                                    <svg t="1725951774275" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8877" width="24" height="24"><path d="M512 0a512 512 0 0 0-512 512 512 512 0 0 0 512 512 512 512 0 0 0 512-512 512 512 0 0 0-512-512z" fill="#FD6B6D" p-id="8878"></path><path d="M513.755429 565.540571L359.277714 720.018286a39.058286 39.058286 0 0 1-55.296-0.073143 39.277714 39.277714 0 0 1 0.073143-55.442286l154.331429-154.331428-155.062857-155.136a36.571429 36.571429 0 0 1 51.712-51.785143l365.714285 365.714285a36.571429 36.571429 0 1 1-51.785143 51.785143L513.755429 565.540571z m157.549714-262.582857a35.254857 35.254857 0 1 1 49.737143 49.737143l-106.057143 108.982857a35.254857 35.254857 0 1 1-49.883429-49.810285l106.203429-108.982858z" fill="#FFFFFF" p-id="8879"></path></svg>
                                </i>
                            </Tooltip>
                        )}
                        {status === CellStatus.SUCCESS && (
                            <i className="status-icon" >
                                <svg t="1725951447076" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6768" width="24" height="24"><path d="M511.396232 14.306221c278.295908-0.465617 500.87635 220.72309 500.850767 497.724479-0.025583 277.006506-222.646959 498.179863-500.917284 497.657962-277.651207-0.516784-498.66083-220.144906-499.571598-496.450427C10.847349 236.436396 232.818908 14.776955 511.396232 14.306221zM947.137321 528.158457c8.872313-226.070014-165.161125-437.629141-417.715045-448.967691-234.052026-10.504532-442.234148 170.620617-452.441913 416.66101-9.378864 226.105831 165.125309 437.624024 417.612712 448.957458C728.501834 955.308649 936.428122 774.311418 947.137321 528.158457z" p-id="6769" fill="#87d068"></path><path d="M286.58492 511.80045c47.92277 38.134573 94.371938 75.097427 141.03089 112.224014 96.700025-126.990736 226.622615-214.777515 351.106181-311.503123 6.134892 8.202029 11.604617 15.513756 17.949293 23.986968-147.549533 125.36875-244.786809 286.272803-328.551881 450.46176-80.132234-75.941678-161.26222-152.835057-245.032409-232.23049C247.631679 538.146205 266.13869 525.625703 286.58492 511.80045z" p-id="6770" fill="#87d068"></path></svg>
                            </i>
                        )}
                        {status === CellStatus.DEFAULT && (
                            <i className="status-icon" >
                                <svg t="1725951447076" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6768" width="24" height="24"><path d="M511.396232 14.306221c278.295908-0.465617 500.87635 220.72309 500.850767 497.724479-0.025583 277.006506-222.646959 498.179863-500.917284 497.657962-277.651207-0.516784-498.66083-220.144906-499.571598-496.450427C10.847349 236.436396 232.818908 14.776955 511.396232 14.306221zM947.137321 528.158457c8.872313-226.070014-165.161125-437.629141-417.715045-448.967691-234.052026-10.504532-442.234148 170.620617-452.441913 416.66101-9.378864 226.105831 165.125309 437.624024 417.612712 448.957458C728.501834 955.308649 936.428122 774.311418 947.137321 528.158457z" p-id="6769" fill="#cdcdcd"></path><path d="M286.58492 511.80045c47.92277 38.134573 94.371938 75.097427 141.03089 112.224014 96.700025-126.990736 226.622615-214.777515 351.106181-311.503123 6.134892 8.202029 11.604617 15.513756 17.949293 23.986968-147.549533 125.36875-244.786809 286.272803-328.551881 450.46176-80.132234-75.941678-161.26222-152.835057-245.032409-232.23049C247.631679 538.146205 266.13869 525.625703 286.58492 511.80045z" p-id="6770" fill="#cdcdcd"></path></svg>
                            </i>
                        )}

                        {/* 节点操作菜单 */}
                        {/* <div className="more-action-container">
                            <i className="more-action" />
                        </div> */}
                    </div>
                </div>

                {/* 添加下游节点 */}
                {type.split('.')[1] !== 'output' && (
                    <div className="plus-dag">
                        <Dropdown
                            dropdownRender={() => getPlusDagMenu({ className: '', clickPlusDragMenu: this.clickPlusDragMenu })}
                            overlayClassName="processing-node-menu"
                            trigger={['click']}
                            placement="bottom"
                            open={plusActionSelected}
                            onOpenChange={this.onPlusDropdownOpenChange}
                        >
                            <i
                                className={classnames('plus-action', {
                                    'plus-action-selected': plusActionSelected,
                                })}
                            />
                        </Dropdown>
                    </div>
                )}
            </div>
        )
    }
}

register({
    shape: 'data-processing-dag-node',
    width: 212,
    height: 48,
    component: DataProcessingDagNode,
    // port默认不可见
    ports: {
        groups: {
            in: {
                position: 'left',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: 'transparent',
                        strokeWidth: 1,
                        fill: 'transparent',
                    },
                },
            },

            out: {
                position: {
                    name: 'right',
                    args: {
                        dx: -32,
                    },
                },

                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: 'transparent',
                        strokeWidth: 1,
                        fill: 'transparent',
                    },
                },
            },
        },
    },
})

// 注册连线
Graph.registerConnector(
    'curveConnector',
    (sourcePoint, targetPoint) => {
        const hgap = Math.abs(targetPoint.x - sourcePoint.x)
        const path = new Path()
        path.appendSegment(
            Path.createSegment('M', sourcePoint.x - 4, sourcePoint.y),
        )
        path.appendSegment(
            Path.createSegment('L', sourcePoint.x + 12, sourcePoint.y),
        )
        // 水平三阶贝塞尔曲线
        path.appendSegment(
            Path.createSegment(
                'C',
                sourcePoint.x < targetPoint.x
                    ? sourcePoint.x + hgap / 2
                    : sourcePoint.x - hgap / 2,
                sourcePoint.y,
                sourcePoint.x < targetPoint.x
                    ? targetPoint.x - hgap / 2
                    : targetPoint.x + hgap / 2,
                targetPoint.y,
                targetPoint.x - 6,
                targetPoint.y,
            ),
        )
        path.appendSegment(
            Path.createSegment('L', targetPoint.x + 2, targetPoint.y),
        )

        return path.serialize()
    },
    true,
)

Edge.config({
    markup: [
        {
            tagName: 'path',
            selector: 'wrap',
            attrs: {
                fill: 'none',
                cursor: 'pointer',
                stroke: 'transparent',
                strokeLinecap: 'round',
            },
        },
        {
            tagName: 'path',
            selector: 'line',
            attrs: {
                fill: 'none',
                pointerEvents: 'none',
            },
        },
    ],
    connector: { name: 'curveConnector' },
    attrs: {
        wrap: {
            connection: true,
            strokeWidth: 10,
            strokeLinejoin: 'round',
        },
        line: {
            connection: true,
            stroke: '#A2B1C3',
            strokeWidth: 1,
            targetMarker: {
                name: 'classic',
                size: 6,
            },
        },
    },
})

Graph.registerEdge('data-processing-curve', Edge, true)

// 节点状态列表
const nodeStatusList = [
    {
        id: 'node-0',
        status: 'success',
    },
    {
        id: 'node-1',
        status: 'success',
    },
    {
        id: 'node-2',
        status: 'success',
    },
    {
        id: 'node-3',
        status: 'success',
    },
    {
        id: 'node-4',
        status: 'error',
        statusMsg: '错误信息示例',
    },
]

// 边状态列表
const edgeStatusList = [
    {
        id: 'edge-0',
        status: 'success',
    },
    {
        id: 'edge-1',
        status: 'success',
    },
    {
        id: 'edge-2',
        status: 'success',
    },
    {
        id: 'edge-3',
        status: 'success',
    },
]

// 显示节点状态
const showNodeStatus = () => {
    nodeStatusList.forEach((item) => {
        const { id, status, statusMsg } = item
        const node = graph.getCellById(id)
        const data = node.getData() as CellStatus
        node.setData({
            ...data,
            status,
            statusMsg,
        })
    })
}

// 开启边的运行动画
const excuteAnimate = () => {
    graph.getEdges().forEach((edge) => {
        edge.attr({
            line: {
                stroke: '#3471F9',
            },
        })
        edge.attr('line/strokeDasharray', 5)
        edge.attr('line/style/animation', 'running-line 30s infinite linear')
    })
}

// 关闭边的动画
const stopAnimate = () => {
    graph.getEdges().forEach((edge) => {
        edge.attr('line/strokeDasharray', 0)
        edge.attr('line/style/animation', '')
    })
    edgeStatusList.forEach((item) => {
        const { id, status } = item
        const edge = graph.getCellById(id)
        if (status === 'success') {
            edge.attr('line/stroke', '#52c41a')
        }
        if (status === 'error') {
            edge.attr('line/stroke', '#ff4d4f')
        }
    })
    // 默认选中一个节点
    graph.select('node-2')
}

const currentSelectNode = { node: {} };

export default (props: { data: any }) => {
    const [data, _data] = useState(props.data)
    const [showDetail, _showDetail] = useState(false)
    const [minScale, maxScale] = [0.01, 1]
    const [Detail, _Detail] = useState(<></>)

    useEffect(() => {
        graph = new Graph({
            container: document.getElementById('workFlow')!,
            scaling: { min: minScale, max: maxScale },
            autoResize: true,
            grid: true,
            panning: {
                enabled: true,
                eventTypes: ['leftMouseDown', 'mouseWheel'],
            },
            mousewheel: {
                enabled: true,
                modifiers: 'ctrl',
                factor: 1.1,
                maxScale: 1.5,
                minScale: 0.5,
            },
            highlighting: {
                magnetAdsorbed: {
                    name: 'stroke',
                    args: {
                        attrs: {
                            fill: '#fff',
                            stroke: '#31d0c6',
                            strokeWidth: 4,
                        },
                    },
                },
            },
            connecting: {
                snap: true,
                allowBlank: false,
                allowLoop: false,
                highlight: true,
                sourceAnchor: {
                    name: 'left',
                    args: {
                        dx: Platform.IS_SAFARI ? 4 : 8,
                    },
                },
                targetAnchor: {
                    name: 'right',
                    args: {
                        dx: Platform.IS_SAFARI ? 4 : -8,
                    },
                },
                createEdge() {
                    return graph.createEdge({
                        shape: 'data-processing-curve',
                        attrs: {
                            line: {
                                strokeDasharray: '5 5',
                            },
                        },
                        zIndex: -1,
                    })
                },
                // 连接桩校验
                validateConnection({ sourceMagnet, targetMagnet }) {
                    // 只能从输出链接桩创建连接
                    if (!sourceMagnet || sourceMagnet.getAttribute('port-group') === 'in') {
                        return false
                    }
                    // 只能连接到输入链接桩
                    if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'in') {
                        return false
                    }
                    return true
                },
            },
        })
        graph.use(
            new Selection({
                multiple: false,
            }),
        ).use(new Snapline())
            .use(new Keyboard())
            .use(new Clipboard())
            .use(new History())
            .use(new MiniMap({
                container: document.getElementById('minimap'),
                minScale,
                maxScale,
            }))
        // 创建下游的节点和边
        const createDownstream = (nodeType: string) => {
            const node = graph.getCellById(currentSelectNode.node.id)
            if (graph) {
                // 获取下游节点的初始位置信息
                const position = getDownstreamNodePosition(node, graph)
                // 创建下游节点
                const newNode = createNode(nodeType, graph, position)
                const source = node.id
                const target = newNode.id
                // 创建该节点出发到下游节点的边
                createEdge(source, target, graph)
            }
        }
        const clickPlusDragMenu = (nodeType: string) => {
            createDownstream(nodeType)
        }
        const openDrawer = (...args) => {
            const data = args[0].cell.store.data.data
            if (data) {
                currentSelectNode.node = args[0].cell
                if (data.nodeType) {
                    _showDetail(false)
                    import(`./nodes/${data.nodeType}.tsx`).then((module) => {
                        _showDetail(true)
                        _Detail(<module.default data={data} menu={getPlusDagMenu({ className: 'drawer-menu', clickPlusDragMenu, })} callBack={(data) => onFormSubmit(data)} closeDrawer={() => {
                            graph.unselect(currentSelectNode.node)
                        }} />)
                    })
                }
            }
        }
        graph.on('node:selected', openDrawer)
        graph.on('node:unselected', () => {
            currentSelectNode.node = {};
            _showDetail(false);
        })
        // graph.on('node:click', (...args) => showDetail ? null : openDrawer(...args))


        if (data) {
            graph.fromJSON(data)
            const zoomOptions = {
                padding: {
                    left: 10,
                    right: 10,
                    // maxScale: 1,
                    // minScale: 1,
                    // preserveAspectRatio: true,
                },
            }
            graph.zoomToFit(zoomOptions)
        }
    }, [])

    const onFormSubmit = async (data) => {
        const node = graph.getCellById(currentSelectNode.node.id)
        node.setData({
            ...node.data,
            ...data,
            status: 'success'
        })
        console.log('node.data :>> ', node.data);
    }

    return <div id='workFlow'>
        <div id='container'  >
        </div>
        <Drawer
            width={document.body.clientWidth <= 500 ? 380 : document.body.clientWidth * 0.3}
            open={showDetail}
            onClose={() => {
                currentSelectNode.node = {};
                _showDetail(false);
            }}
            mask={false}
            closable={false}
            rootClassName='workflowModal'
        >
            {Detail}
        </Drawer>
    </div >
}

import React, { useEffect, useState } from 'react'
import { Graph, Node, Path, Edge, Platform, StringExt } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import classnames from 'classnames'
import { register } from '@antv/x6-react-shape'
import { Tooltip, Dropdown, Drawer, Space, Button, message, Flex } from 'antd'
import {
    SaveOutlined,
    AimOutlined,
    UndoOutlined,
    RedoOutlined,
} from '@ant-design/icons';
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
        name: '关系数据库抽取',
    },
    {
        type: '.processor.UUID',
        name: '增加UUID',
    },
]

// 不同节点类型的icon
const NODE_TYPE_LOGO = {
    '.start.Start': <svg t="1725897005516" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3194" width="24" height="24"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#3A78F2" p-id="3195"></path><path d="M399.075556 734.833778a65.422222 65.422222 0 0 0 71.566222-3.811556l209.521778-145.92a87.608889 87.608889 0 0 0 36.636444-72.988444 85.048889 85.048889 0 0 0-35.498667-71.054222l-211.342222-145.635556a65.877333 65.877333 0 0 0-71.850667-3.754667A86.471111 86.471111 0 0 0 358.4 367.559111v291.328a85.902222 85.902222 0 0 0 40.618667 75.946667z" fill="#FFFFFF" p-id="3196"></path></svg>,
    '.input.JdbcInput': <svg t="1725946348024" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3533" width="24" height="24"><path d="M0 0h1023.999872v1023.999872H0z" fill="#D2142F" p-id="3534"></path><path d="M1023.999872 102.399987l-0.0128 584.908727-336.691158 336.678358L102.399987 1023.999872a101.964787 101.964787 0 0 1-63.103992-21.759997L1002.239875 39.295995A101.964787 101.964787 0 0 1 1023.999872 102.399987z" fill="#DB4358" p-id="3535"></path><path d="M235.775971 612.351923c21.247997 0 36.607995-5.375999 46.335994-16.127998 8.703999-10.239999 13.055998-25.599997 13.055998-46.591994v-123.647984h-29.951996v122.623984c0 13.055998-2.304 22.527997-6.911999 28.415997-4.607999 5.887999-12.031998 8.959999-22.015998 8.959999-18.175998 0-27.135997-10.495999-27.135996-31.487996v-5.632H179.199978v5.888c0 17.919998 4.863999 31.999996 14.591998 42.239994 9.471999 10.239999 23.551997 15.359998 41.983995 15.359998z m162.047979-3.583999c29.695996 0 51.967994-8.191999 67.327992-24.575997 14.591998-15.615998 22.015997-37.887995 22.015997-66.815992 0-29.183996-7.423999-51.455994-22.015997-66.815991-15.359998-16.383998-37.631995-24.575997-67.327992-24.575997h-66.815991v182.783977h66.815991z m-5.631999-25.599997H360.959955V451.583944h31.231996c22.783997 0 39.423995 5.119999 49.919994 15.615998 10.239999 10.239999 15.359998 27.135997 15.359998 50.175993 0 22.527997-5.119999 39.167995-15.359998 49.919994-10.495999 10.495999-27.135997 15.871998-49.919994 15.871998z m207.103974 25.599997c19.455998 0 34.815996-3.584 45.567994-10.751999 12.543998-8.703999 18.943998-22.271997 18.943998-40.703995 0-12.287998-3.072-22.271997-8.959999-29.439996-6.143999-7.423999-15.103998-12.287998-27.135996-14.591998 9.215999-3.584 16.127998-8.447999 20.991997-15.103998 4.863999-7.167999 7.423999-15.871998 7.423999-26.111997 0-13.823998-4.863999-24.831997-14.335998-33.023996-10.239999-8.703999-24.575997-13.055998-42.751995-13.055998h-83.711989v182.783977h83.967989z m-8.191999-105.983987H545.279932V450.559944h46.335994c12.287998 0 20.991997 2.048 26.623997 6.143999 5.119999 3.84 7.935999 10.239999 7.935999 18.943998 0 9.471999-2.816 16.383998-7.935999 20.735997-5.375999 4.095999-14.335998 6.399999-27.135997 6.399999z m3.84 81.40799H545.279932V527.359934h50.431994c13.311998 0 23.039997 2.304 29.183996 6.911999 5.887999 4.607999 8.959999 12.031998 8.959999 22.527997 0 10.239999-4.095999 17.407998-12.287999 22.015998-6.399999 3.584-15.359998 5.375999-26.623996 5.375999z m176.895978 28.159996c19.711998 0 36.607995-5.631999 50.687993-16.895997 15.103998-12.031998 24.575997-28.671996 28.671997-50.175994h-29.183997c-3.584 13.823998-9.727999 24.319997-18.431997 31.231996-8.191999 6.143999-18.943998 9.471999-31.999996 9.471999-19.967998 0-34.815996-6.399999-44.287995-18.687998-8.703999-11.519999-13.055998-28.159996-13.055998-49.663994 0-20.991997 4.351999-37.375995 13.311998-49.151994 9.727999-13.311998 24.063997-19.711998 43.263995-19.711997 12.799998 0 23.295997 2.56 31.487996 8.191999 8.447999 5.631999 14.079998 14.335998 17.151998 26.367997h29.183996c-2.816-18.431998-10.751999-33.279996-24.063997-44.031995-13.823998-11.263999-31.743996-16.895998-53.247993-16.895998-29.183996 0-51.455994 9.471999-66.815992 28.927997-13.567998 16.895998-20.223997 39.167995-20.223998 66.303991 0 27.647997 6.399999 49.663994 19.455998 66.047992 14.847998 18.943998 37.631995 28.671996 68.095992 28.671996z" fill="#FFFFFF" p-id="3536"></path></svg>,
    '.processor.UUID': <svg t="1726756660335" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8903" width="24" height="24"><path d="M837.12 405.504c0.512-8.704-2.048-16.896-7.68-23.552-5.632-6.144-13.312-9.216-21.504-8.704h-28.672V645.12h28.672c8.192 0.512 15.872-2.56 21.504-8.704 5.632-6.656 8.192-15.36 7.68-23.552V405.504z" p-id="8904"></path><path d="M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0zM323.584 613.376c0.512 18.944-3.584 37.888-11.264 54.784-7.168 14.848-18.944 27.136-33.28 34.816-15.872 8.704-33.792 12.8-52.224 12.288-17.92 0.512-35.84-3.584-51.712-12.288-14.336-8.192-26.112-20.48-33.28-34.816-7.68-17.408-11.776-35.84-11.264-54.784V306.688H199.68v308.736c-0.512 8.192 2.048 16.384 7.168 23.04 5.12 5.632 12.288 8.704 19.968 8.192 7.68 0.512 15.36-2.56 20.48-8.192 5.12-6.656 7.68-14.848 7.168-23.04V306.688h69.12v306.688z m234.496 0c0.512 18.944-3.584 37.888-11.264 54.784-7.168 14.848-18.944 27.136-33.28 34.816-15.872 8.704-33.792 12.8-52.224 12.288-17.92 0.512-35.84-3.584-51.712-12.288-14.336-8.192-26.112-19.968-33.28-34.816-8.192-16.896-11.776-35.84-11.264-54.784V306.688h69.12v308.736c-0.512 8.192 2.048 16.384 7.168 23.04 5.12 5.632 12.288 8.704 19.968 8.192 7.68 0.512 15.36-2.56 20.48-8.192 5.12-6.656 7.68-14.848 7.168-23.04V306.688H558.08v306.688z m108.544 97.792h-69.12v-404.48h69.12v404.48z m229.376-41.984c-7.168 13.312-17.92 24.576-31.744 31.232-15.36 7.68-32.256 11.264-49.664 10.752h-104.448v-404.48h104.96c16.896-0.512 34.304 3.072 49.664 10.752 13.312 6.656 24.576 17.92 31.232 31.232 7.68 15.36 11.264 31.744 10.752 48.64v223.232c0.512 16.896-3.072 33.792-10.752 48.64z" p-id="8905"></path></svg>,
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
        case 'start':
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
    type: string,
    graph: Graph,
    position?: Position,
) => {
    if (!graph) {
        return {}
    }
    let newNode = {}
    const id = uuidv4()
    const nodeTmplate = _.find(PROCESSING_TYPE_LIST, { type })
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
const getPlusDagMenu = (props = { className: '', clickPlusDragMenu: () => null, type: '' }) => {
    const menu = _.filter(PROCESSING_TYPE_LIST, (item) => {
        if (props.type.split('.')[1] === 'start') {
            return item.type.split('.')[1] === 'input'
        } else if (props.type.split('.')[1] === 'input' || props.type.split('.')[1] === 'processor') {
            return item.type.split('.')[1] === 'processor' || item.type.split('.')[1] === 'output'
        } else {
            return false
        }
    })
    return (
        <ul className={props.className} >
            {menu.map((item) => {
                const content = (
                    // eslint-disable-next-line
                    <a>
                        <i
                            className="node-mini-logo"
                        >
                            {NODE_TYPE_LOGO[item.type]}
                        </i>
                        <span>{item.name}</span>
                    </a>
                )
                return (
                    <li className="each-sub-menu" key={item.type} onClick={() => props.clickPlusDragMenu(item.type)}>
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
    createDownstream = (type: string) => {
        const { node } = this.props
        const { graph } = node.model || {}
        if (graph) {
            // 获取下游节点的初始位置信息
            const position = getDownstreamNodePosition(node, graph)
            // 创建下游节点
            const newNode = createNode(type, graph, position)
            const source = node.id
            const target = newNode.id
            // 创建该节点出发到下游节点的边
            createEdge(source, target, graph)
        }
    }

    // 点击添加下游+号
    clickPlusDragMenu = (type: string) => {
        this.createDownstream(type)
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
        const { name, type, status = 'default', statusMsg } = data

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
                            {NODE_TYPE_LOGO[type]}
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
                                    <svg t="1726123062885" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5445" width="24" height="24"><path d="M512 1024c-282.304 0-512-229.696-512-512 0-282.304 229.696-512 512-512 282.304 0 512 229.696 512 512C1024 794.304 794.304 1024 512 1024L512 1024zM512 48.768C256.576 48.768 48.768 256.576 48.768 512c0 255.424 207.808 463.168 463.232 463.168 255.424 0 463.168-207.744 463.168-463.168C975.168 256.576 767.424 48.768 512 48.768L512 48.768zM512 48.768" fill="#FD6B6D" p-id="5446"></path><path d="M764.8 312.256l-53.12-53.12L512 458.88 312.256 259.136l-53.12 53.12L458.88 512l-199.744 199.68 53.12 53.12L512 565.12l199.68 199.68 53.12-53.12L565.12 512 764.8 312.256zM764.8 312.256" fill="#FD6B6D" p-id="5447"></path></svg>
                                </i>
                            </Tooltip>
                        )}
                        {status === CellStatus.SUCCESS && (
                            <i className="status-icon" >
                                <svg t="1726123003541" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4868" width="24" height="24"><path d="M512 1024c-282.304 0-512-229.696-512-512 0-282.304 229.696-512 512-512 282.304 0 512 229.696 512 512C1024 794.304 794.304 1024 512 1024L512 1024zM512 48.768C256.576 48.768 48.768 256.576 48.768 512c0 255.424 207.808 463.168 463.232 463.168 255.424 0 463.168-207.744 463.168-463.168C975.168 256.576 767.424 48.768 512 48.768L512 48.768zM512 48.768" fill="#87d068" p-id="4869"></path><path d="M425.728 750.784 206.528 531.648l45.248-45.312 173.952 173.952 346.496-346.496 45.248 45.248L425.728 750.784zM425.728 750.784" fill="#87d068" p-id="4870"></path></svg>
                            </i>
                        )}
                        {status === CellStatus.DEFAULT && (
                            <i className="status-icon" >
                                <svg t="1726123096896" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5702" width="24" height="24"><path d="M512 51.2c254.08 0 460.8 206.72 460.8 460.8 0 254.08-206.72 460.8-460.8 460.8-254.08 0-460.8-206.72-460.8-460.8C51.2 257.92 257.92 51.2 512 51.2M512 0C229.248 0 0 229.248 0 512c0 282.752 229.248 512 512 512 282.752 0 512-229.248 512-512C1024 229.248 794.752 0 512 0L512 0 512 0zM512 0" fill="#cdcdcd" p-id="5703"></path><path d="M477.888 640c-0.256 0-0.32-14.4-0.32-18.88 0-26.496 3.776-48.704 11.264-67.968 5.504-14.528 14.4-28.8 26.624-43.584 9.024-10.752 25.216-26.24 48.576-46.848 23.36-20.608 38.592-36.992 45.568-49.28C616.512 401.152 620.096 387.84 620.096 373.312c0-26.24-10.24-49.344-30.72-69.184-20.48-19.84-45.696-29.824-75.456-29.824-28.736 0-52.736 9.024-72 27.008C422.592 319.36 409.984 347.52 403.968 385.728L334.656 377.472c6.272-51.264 24.832-90.496 55.68-117.76C421.184 232.448 461.952 218.88 512.704 218.88c53.76 0 96.64 14.656 128.64 43.904 32 29.248 48 64.64 48 106.112 0 24-5.632 46.144-16.896 66.368-11.264 20.224-33.28 44.864-65.984 73.856C584.448 528.64 570.112 542.976 563.392 552.256 556.608 561.536 551.616 570.752 548.416 582.784 545.152 594.88 543.232 640 542.784 640L477.888 640 477.888 640zM479.872 768.384l0-64.192 64.192 0 0 64.192L479.872 768.384 479.872 768.384z" fill="#cdcdcd" p-id="5704"></path></svg>
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
                            dropdownRender={() => getPlusDagMenu({ className: '', clickPlusDragMenu: this.clickPlusDragMenu, type, })}
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

const transDataIn = (data: any) => {
    const canvas = JSON.parse(JSON.parse(data).canvas)
    return {
        nodes: canvas.nodes,
        edges: canvas.lines,
    }
}

const transDataOut = (data: any) => {
    const canvas = {
        nodes: _.filter(data.cells, { shape: 'data-processing-dag-node' }),
        lines: _.map(_.filter(data.cells, { shape: 'data-processing-curve' }), edge => ({
            ...edge,
            from: edge.source.cell,
            to: edge.target.cell,
        }))
    }
    return JSON.stringify(canvas)
}

export default (props: { data: any, setData: any }) => {
    const [data, _data] = useState({ nodes: [], edges: [] })
    const [showDetail, _showDetail] = useState(false)
    const [minScale, maxScale] = [0.01, 1]
    const [Detail, _Detail] = useState(<></>)
    const [btType, _btType] = useState('default')
    const [canDo, _canDo] = useState({})

    useEffect(() => {
        if (props.data) {
            const __data = transDataIn(props.data)
            _data(__data)
            graph.fromJSON(__data)
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
    }, props.data)

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
            .use(new History({
                enabled: true,
            }))
        // .use(new MiniMap({
        //     container: document.getElementById('minimap'),
        //     minScale,
        //     maxScale,
        //     height: 160,
        // }))
        // 创建下游的节点和边
        const createDownstream = (type: string) => {
            const node = graph.getCellById(currentSelectNode.node.id)
            if (graph) {
                // 获取下游节点的初始位置信息
                const position = getDownstreamNodePosition(node, graph)
                // 创建下游节点
                const newNode = createNode(type, graph, position)
                const source = node.id
                const target = newNode.id
                // 创建该节点出发到下游节点的边
                createEdge(source, target, graph)
            }
        }
        const clickPlusDragMenu = (type: string) => {
            createDownstream(type)
        }
        const openDrawer = (...args) => {
            const data = args[0].cell.store.data.data
            if (data) {
                currentSelectNode.node = args[0].cell
                if (data.type) {
                    _showDetail(false)
                    import(`./nodes/${data.type.split('.')[2]}.tsx`).then((module) => {
                        _showDetail(true)
                        _Detail(<module.default data={data} menu={getPlusDagMenu({ className: 'drawer-menu', clickPlusDragMenu, type: data.type })} callBack={(data) => onFormSubmit(data)} closeDrawer={() => {
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
        graph.on('history:change', () => {
            _canDo({
                canRedo: graph.canRedo(),
                canUndo: graph.canUndo(),
            })
        })


        graph.on('cell:change:data', () => {
            _btType('primary')
        })

        // if (data) {
        //     graph.fromJSON(data)
        //     const zoomOptions = {
        //         padding: {
        //             left: 10,
        //             right: 10,
        //             // maxScale: 1,
        //             // minScale: 1,
        //             // preserveAspectRatio: true,
        //         },
        //     }
        //     graph.zoomToFit(zoomOptions)
        // }
    }, [])

    const onFormSubmit = async (data) => {
        const node = graph.getCellById(currentSelectNode.node.id)
        node.setData({
            ...node.data,
            ...data,
            status: 'success'
        })
    }

    const saveData = () => {
        props.setData({
            canvas: transDataOut(graph.toJSON())
        })
    }

    const onUndo = () => {
        graph.undo()
    }

    const onRedo = () => {
        graph.redo()
    }

    return <>
        <div style={{
            position: 'absolute',
            zIndex: 99,
            // left: '50%',
            // transform: 'translateX(-50%)',
            top: '-90px',
            right: '39px'
        }}
        >
            {/* <div id="minimap" >
                <Button style={{ width: 'calc(100% - 18px)', position: 'absolute', bottom: '8px', zIndex: 1002, margin: '0 9px' }} type={btType} onClick={saveData} >保存</Button>
            </div> */}
        </div>
        <Flex gap="small" wrap style={{ zIndex: 99, position: 'absolute', top: '-60px', right: '37px', padding: '8px', }}  >
            <Button type={btType} icon={<SaveOutlined />} onClick={saveData} >保存</Button>
            <Button icon={<AimOutlined />} onClick={() => graph.zoomToFit()} >定位</Button>
            <Button icon={<UndoOutlined />} onClick={onUndo} disabled={!canDo?.canUndo} >撤销</Button>
            <Button icon={<RedoOutlined />} onClick={onRedo} disabled={!canDo?.canRedo}>重做</Button>
            {/* <Button>整理</Button> */}
        </Flex>
        <div id='workFlow'>
            <div id='container' />
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
    </>
}

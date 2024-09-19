import { dataSources } from '@/services/ant-design-pro/api_v1';
import {
    ProForm,
    ProFormCascader,
    ProFormDatePicker,
    ProFormDateRangePicker,
    ProFormDigit,
    ProFormList,
    ProFormMoney,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    ProFormTreeSelect,
    ProCard,
    ProFormRadio,
    ProFormDependency,
    ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Table, Select, Form, Popconfirm, Tag, Button } from 'antd';
import { useRef, useEffect, useState, } from 'react';
import _ from 'lodash'

export default ({ data, menu, closeDrawer, callBack }) => {
    const formRef = useRef();
    const [itemData, _itemData] = useState([])
    const [loading, _loading] = useState(false)
    // const [tableData, _tableData] = useState([])
    const [type, _type] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [open, setOpen] = useState({
        open: false,
        field: '',
        tableNames: [],
    });

    const onValuesChange = async (changedValues) => {
        if (changedValues?.configuration?.datasourceId) {
            _loading(true)
            const res = await dataSources.getItems({
                id: changedValues?.configuration.datasourceId,
                type: 'JDBC_TABLE'
            })
            // _itemData(_.map(res.data, ({ name }) => ({ label: `${name}`, value: name })))
            const requests = _.map(res.data, async ({ name }) => await dataSources.getMetadata({
                id: changedValues?.configuration.datasourceId,
                item: name,
            }))
            const res1 = await Promise.all(requests)
            _itemData(_.map(res.data, (value, index) => ({ ...value, ...res1[index].data })))
            _loading(false)
        }
        if (changedValues?.configuration?.strategy?.type) {
            _type(changedValues.configuration.strategy.type)
        }
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            setSelectedRowKeys(selectedRowKeys)
        },
        selectedRowKeys,
    };

    const onSubmit = async () => {
        if (formRef?.current) {
            const data = await formRef.current.validateFields()
            const configuration = data.configuration;
            configuration.items = _.map(selectedRowKeys, (name) => ({
                item: name,
                timeFieldName: _.find(itemData, { name })?.timeFieldName ?? null
            }))
            configuration.strategy.startTime = configuration.strategy.startTime?.format?.('YYYY-MM-DD HH:mm:ss')
            configuration.strategy.endTime = configuration.strategy.endTime?.format?.('YYYY-MM-DD HH:mm:ss')
            callBack({ configuration })
            closeDrawer()
        }
    }

    return <ProCard
        colSpan="580px"
        title={<div style={{ width: '100%' }}>
            {data?.name}
            <Button type="primary" style={{ float: 'right' }} onClick={onSubmit} >确定</Button>
            <Button style={{ float: 'right', marginRight: '14px' }} onClick={() => closeDrawer()} >取消</Button>
        </div>}
        tabs={{
            items: [
                {
                    label: '配置',
                    key: 'setting',
                    children: (<>
                        <ProForm
                            formRef={formRef}
                            initialValues={data}
                            layout='horizontal'
                            submitter={{
                                render: () => null
                            }}
                            onValuesChange={onValuesChange}
                        >
                            <ProFormSelect
                                name={['configuration', 'datasourceId']}
                                // width="md"
                                label="数据源"
                                rules={[{ required: true }]}
                                request={async () => {
                                    const res = await dataSources.get({
                                        '**category': 'DATA_SOURCE',
                                        current: 1, pageSize: 1000,
                                    })
                                    return _.map(res.data, ({ name, alias, id }) => ({ label: `${name} (${alias})`, value: id }))
                                }}
                            />
                            <ProFormRadio.Group
                                name={['configuration', 'strategy', 'type']}
                                label="采集范围"
                                rules={[{ required: true }]}
                                options={[
                                    {
                                        label: '全量',
                                        value: 'ALL',
                                    },
                                    {
                                        label: '时间范围',
                                        value: 'RANGE',
                                    },
                                    {
                                        label: '周期',
                                        value: 'T1',
                                        disabled: true,
                                    },
                                ]}
                            />
                            <ProFormDependency name={['configuration']}>
                                {({ configuration }) => {
                                    if (configuration?.strategy?.type === 'RANGE') {
                                        return <>
                                            <ProFormDateTimePicker
                                                name={['configuration', 'strategy', 'startTime']}
                                                width="md"
                                                label="开始时间"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            />
                                            <ProFormDateTimePicker
                                                name={['configuration', 'strategy', 'endTime']}
                                                width="md"
                                                label="结束时间"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            />
                                        </>
                                    }
                                }}
                            </ProFormDependency>
                            {/* <ProFormDependency name={['configuration']}>
                                {({ configuration }) => {
                                    return <ProFormSelect
                                        name={['configuration', 'datasourceItemId']}
                                        // width="md"
                                        label="来源表"
                                        rules={[{ required: true }]}
                                        disabled={loading || !itemData.length}
                                        mode="multiple"
                                        onChange={(value) => {
                                            _tableData(_.map(value, (tableName) => {
                                                if (_.find(tableData, { tableName })) {
                                                    return _.find(tableData, { tableName })
                                                } else {
                                                    return { tableName }
                                                }
                                            }))
                                        }}
                                        fieldProps={{
                                            loading,
                                            options: itemData,
                                        }}
                                    />
                                }}
                            </ProFormDependency> */}
                            <Form.Item label='来源表' >
                                <Popconfirm
                                    title='自动补全可用'
                                    description={<div>
                                        <div style={{ marginBottom: '7px' }} >检测到以下表同样含有时间字段：<Tag>{open.field}</Tag>，是否批量设置？</div>
                                        {_.map(open.tableNames, (table) => <Tag color='processing'>{table}</Tag>)}
                                    </div>}
                                    okText="确定"
                                    onConfirm={() => {
                                        _.each(open.tableNames, tableName => {
                                            _.set(_.find(itemData, { name: tableName }), 'timeFieldName', open.field)
                                        })
                                        _itemData([...itemData])
                                        setSelectedRowKeys([...selectedRowKeys, ...open.tableNames])
                                        setOpen({ open: false, field: '', tableNames: [] })
                                    }}
                                    cancelText="取消"
                                    onCancel={() => setOpen({ open: false, field: '', tableNames: [] })}
                                    open={open.open}
                                >
                                    <Table
                                        rowSelection={{
                                            type: 'checkbox',
                                            ...rowSelection,
                                        }}
                                        rowKey='name'
                                        columns={[{
                                            title: '表名',
                                            dataIndex: 'name',
                                        }, {
                                            title: '描述',
                                            dataIndex: 'description',
                                        }, {
                                            title: '配置',
                                            key: 'action',
                                            width: 150,
                                            render: (__, record) => (
                                                <Select value={record.timeFieldName} placeholder='时间范围字段' disabled={type != 'RANGE'} popupMatchSelectWidth={false} options={_.map(record.columns, (column) => ({
                                                    label: `${column.name} (${column.cnName}) [${column.type}]`,
                                                    value: column.name,
                                                    detail: column,
                                                }))} onChange={v => {
                                                    record.timeFieldName = v;
                                                    const sameName = _.filter(itemData, item => _.find(item.columns, column => column.name == v));
                                                    if (sameName.length > 1) {
                                                        setOpen({
                                                            open: true,
                                                            field: v,
                                                            tableNames: _.map(sameName, item => item.name),
                                                        })
                                                    }
                                                }} />
                                            ),
                                        },]}
                                        loading={loading}
                                        size='small'
                                        bordered
                                        scroll={{ y: 318 }}
                                        pagination={{ pageSize: 6 }}
                                        dataSource={itemData}
                                    />
                                </Popconfirm>
                            </Form.Item>
                        </ProForm>
                    </>)
                },
                {
                    label: '添加子节点',
                    key: 'addnode',
                    children: (<>
                        {menu}
                    </>)
                },
            ]
        }}
    />
}
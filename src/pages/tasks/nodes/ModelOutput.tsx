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
    ProFormGroup,
} from '@ant-design/pro-components';
import { Table, Select, Form, Popconfirm, Tag, Button, Modal, Space } from 'antd';
import { useRef, useEffect, useState, } from 'react';
import _ from 'lodash'
import ModelTable from '@/pages/models/list';

export default ({ data, menu, closeDrawer, callBack, deleteNode, getTables }) => {
    const formRef = useRef();
    const [loading, _loading] = useState(false)
    const [proTem, _proTem] = useState(null)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [open, setOpen] = useState<{ open: boolean, callback?: (args: any) => any, targetItemId?: string, }>({
        open: false,
        callback: a => a,
        targetItemId: undefined,
    });
    const [inputTables, _inputTables] = useState([])

    // 无数据时数据初始化
    if (!data?.configuration?.saveMode?.length) {
        data = {
            ...data,
            configuration: {
                mappings: [{
                    sourceTable: null,
                    targetItem: null,
                    fieldMappings: []
                }]
            }
        }
    }

    // 表单联动、接口请求、回显数据设置
    const onValuesChange = async (changedValues) => {

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

            configuration.strategy.startTime = configuration.strategy.startTime?.format?.('YYYY-MM-DD HH:mm:ss')
            configuration.strategy.endTime = configuration.strategy.endTime?.format?.('YYYY-MM-DD HH:mm:ss')
            callBack({ configuration })
            closeDrawer()
        }
    }

    useEffect(() => {
        if (data?.configuration) {
            onValuesChange(data)
        }
        getTables().then(tables => {
            _inputTables(tables.inputTables)
        })
    }, [])

    return <>
        <ProCard
            colSpan="580px"
            title={<div style={{ width: '100%' }}>
                {data.name}
                <div style={{ float: 'right', display: 'flex', gap: '14px' }} >
                    <Button danger onClick={() => deleteNode(data.id)} >删除</Button>
                    <Button onClick={() => closeDrawer()} >取消</Button>
                    <Button type="primary" onClick={onSubmit} >确定</Button>
                </div>
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
                                submitter={{
                                    render: () => null
                                }}
                                onValuesChange={onValuesChange}
                            >
                                <ProFormRadio.Group
                                    name={['configuration', 'saveMode']}
                                    label="更新方式"
                                    rules={[{ required: true }]}
                                    options={[
                                        {
                                            label: '覆盖',
                                            value: 'OVERWRITE',
                                        },
                                        {
                                            label: '追加',
                                            value: 'APPEND',
                                        },
                                    ]}
                                />
                                <Form.Item label='配置映射'></Form.Item>
                                <ProFormList
                                    name={["configuration", "mappings"]}
                                >
                                    {(f, index, action) => {
                                        return <ProFormGroup>
                                            <ProFormSelect
                                                name="sourceTable"
                                                label="输入表"
                                                rules={[{ required: true }]}
                                                fieldProps={{
                                                    options: _.map(inputTables, (({ name, alias, columns }) => ({
                                                        label: `${name} (${alias})`,
                                                        value: name,
                                                        columns,
                                                    }))),
                                                    popupMatchSelectWidth: false,
                                                }}
                                                style={{ width: '100px' }}
                                            />
                                            <Form.Item label='模型'>
                                                <ProFormDependency name={[]}>
                                                    {(...args) => {
                                                        const formData = args[1].getFieldsValue();
                                                        const current = formData?.configuration?.mappings?.[index];
                                                        return <Button type="link" style={{ padding: 0 }} onClick={() => {
                                                            _proTem(current?.targetItemDetail)
                                                            setOpen({
                                                                open: true,
                                                                callback: (model: any) => {
                                                                    const mappings = formData?.configuration?.mappings ?? [];
                                                                    mappings[index].targetItem = model.id;
                                                                    mappings[index].targetItemDetail = model;
                                                                    args[1].setFieldValue('configuration.mappings', mappings)
                                                                },
                                                            })
                                                        }}>
                                                            <span style={{ width: 90, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{current?.targetItem ? current.targetItemDetail?.name : '设置模型'}</span>
                                                        </Button>
                                                    }}
                                                </ProFormDependency>
                                            </Form.Item>
                                            <Form.Item label='字段映射'>
                                                <ProFormDependency name={[]}>
                                                    {(...args) => {
                                                        const formData = args[1].getFieldsValue();
                                                        const current = formData?.configuration?.mappings?.[index];
                                                        return <div style={{ width: '86px' }} >0/{current?.targetItemDetail?.recordCount ?? 0}</div>
                                                    }}
                                                </ProFormDependency>
                                            </Form.Item>
                                            <Form.Item label='操作'>
                                                <ProFormDependency name={[]}>
                                                    {(...args) => {
                                                        const formData = args[1].getFieldsValue();
                                                        const current = formData?.configuration?.mappings?.[index];
                                                        return <div>
                                                            <Button type="link" style={{ padding: 0, marginRight: 14 }} >字段映射</Button>
                                                            <Button type="link" disabled style={{ padding: 0 }} >高级</Button>
                                                        </div>
                                                    }}
                                                </ProFormDependency>
                                            </Form.Item>
                                        </ProFormGroup>
                                    }}
                                </ProFormList>
                            </ProForm>
                        </>)
                    },
                ]
            }}
        />
        <Modal width='80%' centered title="勾选以选择模型" open={open.open}
            footer={[
                <Button key="cancel" onClick={() => setOpen({ open: false, callback: undefined, targetItemId: undefined, })}>
                    取消
                </Button>,
                <Button disabled={!proTem} key="confirm" type="primary" loading={loading} onClick={() => {
                    open?.callback?.(proTem)
                    setOpen({ open: false, callback: undefined, targetItemId: undefined, })
                }}>
                    确定
                </Button>,
            ]} closable={false}
        >
            <ModelTable targetItemDetail={proTem} sendSelected={(model) => { _proTem(model) }} />
        </Modal>
    </>

}
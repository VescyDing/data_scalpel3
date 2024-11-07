import { models } from '@/services/ant-design-pro/api_v1';
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
    ModalForm,
} from '@ant-design/pro-components';
import { Table, Select, Form, Popconfirm, Tag, Button, Modal, Space } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useRef, useEffect, useState, } from 'react';
import _ from 'lodash'
import ModelTable from '@/pages/models/list';

export default ({ data, menu, closeDrawer, callBack, deleteNode, getTables }) => {
    const formRef = useRef();
    const modalFormRef = useRef();

    const [loading, _loading] = useState(false)
    const [proTem, _proTem] = useState(null)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [open, setOpen] = useState<{ open: boolean, index: number }>({
        open: false,
        index: 0,
    });
    const [open2, setOpen2] = useState({
        open: false,
        index: 0,
        FL: [],
        FR: [],
        FT: '',
        RT: '',
        fieldMappings: [],
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

    const onSubmit = async () => {
        if (formRef?.current) {
            const data = await formRef.current.validateFields()
            const configuration = data.configuration;

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
                                <div style={{ marginBottom: 24 }} >
                                    配置映射
                                </div>
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
                                                    options: _.map(inputTables, (({ name, alias }) => ({
                                                        label: `${name} (${alias})`,
                                                        value: name,
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
                                                                index: index,
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
                                                        return <div style={{ width: '86px' }} >{current?.setCount ?? 0}/{current?.allCount ?? 0}</div>
                                                    }}
                                                </ProFormDependency>
                                            </Form.Item>
                                            <Form.Item label='操作'>
                                                <ProFormDependency name={['sourceTable']}>
                                                    {(...args) => {
                                                        const formData = args[1].getFieldsValue();
                                                        const current = formData?.configuration?.mappings?.[index];
                                                        return <div>
                                                            <Button type="link" style={{ padding: 0, marginRight: 14 }} disabled={!(current?.sourceTable && current?.targetItem)} onClick={async () => {
                                                                const FL = _.find(inputTables, { name: current?.sourceTable })
                                                                const FR = await models.getFields({ id: current?.targetItem })
                                                                const fieldMappings = current?.fieldMappings?.length ? current?.fieldMappings : _.map(FR?.data, ({ name }) => ({
                                                                    sourceFieldName: null,
                                                                    targetFieldName: name,
                                                                }))
                                                                setOpen2({
                                                                    open: true,
                                                                    index: index,
                                                                    FL: FL?.columns ?? [],
                                                                    FR: FR?.data ?? [],
                                                                    fieldMappings,
                                                                    FT: current?.sourceTable,
                                                                    RT: current?.targetItemDetail?.name,
                                                                })
                                                            }} >字段映射</Button>
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
                <Button key="cancel" onClick={() => setOpen({ open: false, index: 0, })}>
                    取消
                </Button>,
                <Button disabled={!proTem} key="confirm" type="primary" loading={loading} onClick={() => {
                    const formData = formRef.current?.getFieldsValue();
                    const mappings = formData?.configuration?.mappings ?? [];
                    mappings[open.index].targetItem = proTem?.id;
                    mappings[open.index].targetItemDetail = proTem;
                    mappings[open.index].allCount = proTem?.recordCount;
                    formRef.current?.setFieldValue('configuration.mappings', mappings)
                    setOpen({ open: false, index: 0, })
                }}>
                    确定
                </Button>,
            ]} closable={false}
        >
            <ModelTable targetItemDetail={proTem} sendSelected={(model) => { _proTem(model) }} />
        </Modal>
        <ModalForm
            title="字段映射"
            width='40%'
            open={open2.open}
            onOpenChange={v => setOpen2({ ...open2, open: v, })}
            modalProps={{
                destroyOnClose: true,
                centered: true,
            }}
            onFinish={async (value) => {
                const formData = formRef.current?.getFieldsValue();
                const mappings = formData?.configuration?.mappings ?? [];
                mappings[open2.index].fieldMappings = open2.fieldMappings;
                mappings[open2.index].setCount = _.reduce(open2.fieldMappings, function (sum, item) {
                    if (item.targetFieldName) {
                        return sum + 1;
                    } else {
                        return sum;
                    }
                }, 0)
                formRef.current?.setFieldValue('configuration.mappings', mappings)
                setOpen2({ ...open2, open: false, index: 0, })
            }}
            formRef={modalFormRef}
        >
            <Table
                rowKey='targetFieldName'
                columns={[{
                    title: `目标字段 (目标模型: ${open2.RT})`,
                    dataIndex: 'targetFieldName',
                }, {
                    title: `来源字段 (来源表: ${open2.FT})`,
                    dataIndex: 'sourceFieldName',
                    render: (__, record, index) => <Select
                        key={index + record.sourceFieldName}
                        options={_.map(open2.FL, (({ name, alias }) => ({
                            label: `${name} (${alias})`,
                            value: name,
                        })))}
                        popupMatchSelectWidth={false}
                        style={{ width: '100%' }}
                        value={record.sourceFieldName}
                        onChange={(v) => {
                            setOpen2({
                                ...open2,
                                fieldMappings: open2.fieldMappings.map((item, i) => {
                                    if (i == index) {
                                        return { ...item, sourceFieldName: v }
                                    } else {
                                        return item
                                    }
                                })
                            })
                        }}
                    />
                }]}
                size='small'
                style={{ marginTop: 16 }}
                bordered
                scroll={{ y: 490 }}
                pagination={{ pageSize: 10, position: ['bottomLeft'] }}
                dataSource={open2.fieldMappings}
            />
            <Button type='dashed' danger style={{ position: 'absolute', bottom: 75, right: 24 }} onClick={() => {
                Modal.confirm({
                    title: '智能匹配',
                    content: '智能匹配将会遍历所有来源字段和目标字段，并将忽略大小写、空格、分隔符、驼峰等差异，进行对比，如果结果相等，将会自动为目标字段填入对应值。此操作将会覆盖之前所有已经做过的设置，所以请在最开始设置时使用此功能，是否继续？',
                    onOk: () => {
                        console.log('object :>> ', open2.fieldMappings);
                        _.each(open2.fieldMappings, item => {
                            if (item.targetFieldName) {
                                const target = _.find(open2.FL, ({ name }) => {
                                    return _.camelCase(name) == _.camelCase(item.targetFieldName)
                                });
                                if (target) {
                                    item.sourceFieldName = target.name;
                                }
                            }
                        })
                        setOpen2({ ...open2, fieldMappings: open2.fieldMappings })
                    }
                })
            }} >智能匹配</Button>
        </ModalForm>
    </>

}
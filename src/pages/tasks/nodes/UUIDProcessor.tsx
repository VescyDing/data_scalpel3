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
import { Table, Select, Form, Popconfirm, Tag, Button } from 'antd';
import { useRef, useEffect, useState, } from 'react';
import _ from 'lodash'

export default ({ data, menu, closeDrawer, callBack, deleteNode, getTables }) => {
    const formRef = useRef();
    const [loading, _loading] = useState(false)
    const [inputTables, _inputTables] = useState([])


    useEffect(() => {
        getTables().then(tables => {
            console.log(tables);
            _inputTables(tables.inputTables)
        })
    }, [])

    if (!data?.configuration?.actions?.length) {
        data = {
            configuration: {
                actions: [{
                    table: null,
                    fieldName: null
                }]
            }
        }
    }

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

    return <ProCard
        colSpan="580px"
        title={<div style={{ width: '100%' }}>
            {data?.name}
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
                            <ProFormList
                                name={["configuration", "actions"]}
                            >
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="table"
                                        label="数据表"
                                        rules={[{ required: true }]}
                                        fieldProps={{
                                            options: _.map(inputTables, (({ name, alias, columns }) => ({
                                                label: `${name} (${alias})`,
                                                value: name,
                                                columns,
                                            }))),
                                            popupMatchSelectWidth: false,
                                        }}
                                        style={{ width: '180px' }}
                                    />
                                    <ProFormText name="fieldName" label="新增字段" rules={[{ required: true }]} style={{ minWidth: '180px' }} />
                                </ProFormGroup>
                            </ProFormList>
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
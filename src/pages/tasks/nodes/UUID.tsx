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

export default ({ data, menu, closeDrawer, callBack }) => {
    const formRef = useRef();
    const [loading, _loading] = useState(false)

    if (!data?.configuration?.length) {
        data.configuration = [{
            table: null,
            fieldName: null
        }]
    }
    console.log(data.configuration)
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
                            submitter={{
                                render: () => null
                            }}
                            onValuesChange={onValuesChange}
                        >
                            <ProFormList
                                name="configuration"
                            >
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="table"
                                        label="数据表"
                                        rules={[{ required: true }]}
                                        request={async () => {

                                        }}
                                        style={{ minWidth: '180px' }}
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
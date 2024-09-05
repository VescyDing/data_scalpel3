import React, { useRef, useState, useEffect } from 'react';
import {
    FooterToolbar,
    ModalForm,
    PageContainer,
    ProDescriptions,
    ProFormText,
    ProFormTextArea,
    ProTable,
    ProFormCheckbox,
    ProFormSelect,
    StepsForm,
    ProForm,
    ProFormDigit,
    ProFormTreeSelect,
    ProFormList,
    EditableProTable,
    ProFormDateTimePicker,
    ProFormDependency,
} from '@ant-design/pro-components';
import { Breadcrumb } from "antd";
import { history } from '@umijs/max';

export default () => {
    return <PageContainer title='任务配置' breadcrumb={<Breadcrumb className='ant-page-header-breadcrumb' routes={[{ breadcrumbName: '数据汇聚' }, { breadcrumbName: '任务配置' }]} />} >
        {/* return <PageContainer > */}
        <div className='white-block' style={{ width: '100%', height: 'calc(100vh - 206px)' }}>

        </div>
    </PageContainer>
}
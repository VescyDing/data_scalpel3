import { models, catalogs, dataSources, dict } from '@/services/ant-design-pro/api_v1';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined, SyncOutlined, MinusCircleOutlined, HighlightOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
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
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Tag, Switch, Modal, Layout, Row, Col, Select } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash'
import SearchTree from '@/components/SearchTree';
import { data_source_type_icon } from './enum';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  const res = await models.post(fields);
  hide();
  const success = res.code == '200';
  success && message.success('添加成功');
  return success;
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在更新');
  const res = await models.put(fields);
  hide();
  const success = res.code == '200';
  success && message.success('更新成功');
  return success;
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  if (!selectedRows) return true;
  const hide = message.loading('正在删除');
  const requests = selectedRows.map(({ id }) => models.delete({ id }))
  const res = await Promise.all(requests)
  hide();
  const success = res[0].code == '200';
  success && message.success('删除成功');
  return success;
};

const handleUpdateFields = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在更新字段');
  const res = await models.updateFields(fields);
  hide();
  const success = res.code == '200';
  success && message.success('更新成功');
  return success;
};

const TableList: React.FC = (props: { category?: string, targetItemDetail?: any, sendSelected?: (model: any) => void }) => {
  const { category = 'MODEL', targetItemDetail, sendSelected } = props;

  const isAPickerComponent = !!sendSelected;

  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [action_modal_1, _action_modal_1] = useState<boolean>(false);

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>({});
  const [selectedRows, setSelectedRows] = useState<API.RuleListItem[]>([]);

  const [catalogsTree, _catalogsTree] = useState([]);
  const [params, _params] = useState({});
  const [datasource, _datasource] = useState([]);

  const [state, _state] = useState({});
  const [columnType, _columnType] = useState({});
  const [currentEditFieldRow, _currentEditFieldRow] = useState({});

  useEffect(() => {
    if (!createModalOpen) {
      setCurrentRow({});
    }
  }, [createModalOpen])

  const transTreeData: any = (nodes: any[]) => nodes.map((item: any) => ({
    ...item,
    key: item.id,
    title: item.name,
    value: item.id,
    children: item.children && item.children.length > 0 ? transTreeData(item.children) : [],
  }))

  useEffect(() => {
    catalogs.get({
      type: category,
      tree: true
    }).then((res) => {
      _catalogsTree(transTreeData(res.data) as [])
    })
    dataSources.get({
      '**category': 'DATA_STORAGE',
      current: 1, pageSize: 1000,
    }).then((res) => {
      _datasource(_.map(res.data, ({ name, alias, id }) => ({ label: `${name} (${alias})`, value: id })))
    })
    dict.get({
      '**type': 'ColumnType',
      current: 1,
      pageSize: 1000,
    }).then((res) => {
      _columnType(res.data as [])
    })
  }, [])


  useEffect(() => {
    if (isAPickerComponent) {
      setSelectedRows(targetItemDetail ? [targetItemDetail] : [])
    }
  }, [targetItemDetail])


  const dict_state = {
    'DRAFT': <Tag icon={<QuestionCircleOutlined />} color="processing">
      草稿
    </Tag>,
    'ONLINE': <Tag icon={<SyncOutlined spin />} color="success">
      在线
    </Tag>,
    'OFFLINE': <Tag icon={<MinusCircleOutlined />} color="default">
      下线
    </Tag>
  }


  const dict_type_dom = _.map(data_source_type_icon, (v, k) => ({ label: v, value: k }))
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',

      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '别名',
      dataIndex: 'alias',
    },
    {
      title: '状态',
      dataIndex: '**state',
      render: (dom, entity) => dict_state[entity.state] ?? <Tag>{entity?.state ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: dict_state
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      search: false,
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'lastModifiedDate',
      valueType: 'dateTime',
      search: false,
    },
    ...(isAPickerComponent ? [] : [
      {
        title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
        dataIndex: 'option',
        valueType: 'option',
        render: (_, record) => [
          <Button
            type="link"
            key="edit"
            onClick={() => {
              setCurrentRow(record);
              handleModalOpen(true);
            }}
          >
            <EditOutlined /> 编辑
          </Button>,
          <Button
            type="link"
            key="edit_action_1"
            onClick={async () => {
              const hide = message.loading('获取字段中');
              const res = await models.getFields({ id: record.id });
              hide();
              setCurrentRow({ ...record, fields: res.data });
              _action_modal_1(true);
            }}
          >
            <HighlightOutlined /> 编辑字段
          </Button>,
          <Switch checkedChildren="在线" unCheckedChildren="下线" checked={record.state === 'ONLINE'} onChange={async v => {
            const { id } = record;
            const hide = message.loading('正在' + (v ? '上线' : '下线'));
            try {
              await (v ? models.online({ id }) : models.offline({ id }));
              hide();
              message.success((v ? '上线' : '下线') + '成功');
              if (actionRef.current) {
                actionRef.current.reload();
              }
              return true;
            } catch (error) {
              return false;
            }
          }} />,
        ],
      },
    ]) as any,
  ];

  const columns1: ProColumns<API.RuleListItem>[] = [
    {
      title: '字段(英文)',
      dataIndex: 'name',
    },
    {
      title: '字段名(中文)',
      dataIndex: 'alias',
    },
    {
      title: '备注',
      dataIndex: 'description',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (dom, entity) => _.find(columnType, { value: dom })?.name ?? dom,
      renderFormItem: ({ value, onChange }) => {
        return <Select
          options={_.map(columnType, item => ({ label: item.name, value: item.value, key: item.id, detail: item }))}
          value={value}
          onChange={(...args) => {
            onChange?.(...args);
            _currentEditFieldRow(args[1].detail)
          }}
          placeholder='请选择'
        />
      }
    },
    {
      title: '长度',
      dataIndex: 'precision',
      valueType: 'digit',
      fieldProps: {
        disabled: currentEditFieldRow?.options?.supportPrecision == 'false',
        min: currentEditFieldRow?.options?.minPrecision,
        max: currentEditFieldRow?.options?.maxPrecision,
      }
    },
    {
      title: '精度',
      dataIndex: 'scale',
      valueType: 'digit',
      fieldProps: {
        disabled: currentEditFieldRow?.options?.supportScale == 'false',
        min: currentEditFieldRow?.options?.minScale,
        max: currentEditFieldRow?.options?.maxScale,
      }
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.index);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          style={{
            color: 'red',
          }}
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.index !== record.index));
          }}
        >
          删除
        </a>,
      ],
    },
  ]

  const [dataSource, setDataSource] = useState([]);

  const detail_columns: ProColumns<API.RuleListItem>[] = []

  const onSelect = (...args: any) => {
    _params(args[0][0] ? { '**catalogId': args[0][0], } : {})
  }

  const content = <Layout style={{ minHeight: '100%' }}>
    <Layout.Sider width="25%" className='white-block' style={{ marginRight: '16px', paddingTop: '24px' }} >
      <SearchTree treeData={catalogsTree} onSelect={onSelect} />
    </Layout.Sider>
    <Layout.Content >
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        toolBarRender={() => isAPickerComponent ? [] : [
          <Button
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined />新建
          </Button>,
        ]}
        params={params}
        request={models.get}
        columns={columns}
        rowSelection={{
          type: isAPickerComponent ? 'radio' : 'checkbox',
          onChange: (_, selectedRows) => {
            if (sendSelected) {
              sendSelected(selectedRows[0]);
            } else {
              setSelectedRows(selectedRows);
            }
          },
          selectedRowKeys: _.map(selectedRows, 'id'),
        }}
      />
    </Layout.Content>
  </Layout>

  return isAPickerComponent ? content : <PageContainer>
    {content}

    {!isAPickerComponent && selectedRows?.length > 0 && (
      <FooterToolbar
        extra={
          <div>
            <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
            <a style={{ fontWeight: 600 }}>{selectedRows.length}</a>{' '}
            <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
          </div>
        }
      >
        <Button
          danger
          onClick={async () => {
            await handleRemove(selectedRows);
            setSelectedRows([]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <DeleteOutlined />
          <FormattedMessage
            id="pages.searchTable.batchDeletion"
            defaultMessage="Batch deletion"
          />
        </Button>
      </FooterToolbar>
    )}
    <ModalForm
      title={(currentRow?.id ? '编辑' : '新建') + '模型'}
      width="400px"
      open={createModalOpen}
      onOpenChange={handleModalOpen}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={currentRow}
      onFinish={async (value) => {
        let success;
        const { id } = currentRow;
        if (id) {
          success = await handleUpdate({ id, ...value, } as API.RuleListItem);
        } else {
          success = await handleAdd({ ...value, } as API.RuleListItem);
        }
        if (success) {
          handleModalOpen(false);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }
      }}
    >
      <ProFormText
        rules={[
          {
            required: true,
          },
        ]}
        width="md"
        name="name"
        label="名称"
      />
      <ProFormText
        rules={[
          {
            required: true,
          },
        ]}
        width="md"
        name="alias"
        label="别名"
      />
      <ProFormTreeSelect
        name='catalogId'
        width="md"
        label="挂载目录"
        rules={[
          {
            required: true,
          },
        ]}
        request={async () => await catalogsTree}
      />
      <ProFormSelect
        name='datasourceId'
        width="md"
        label="存储"
        showSearch
        rules={[
          {
            required: true,
          },
        ]}
        request={async () => await datasource}
      />
      <ProFormTextArea
        width="md"
        name="description"
        label="描述"
      />
    </ModalForm>
    <ModalForm
      title={'编辑模型字段'}
      width="1200px"
      open={action_modal_1}
      onOpenChange={_action_modal_1}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={currentRow}
      onFinish={async (value) => {
        let success;
        const { id } = currentRow;
        success = await handleUpdateFields({ id, fields: dataSource, } as API.RuleListItem);
        if (success) {
          _action_modal_1(false);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }
      }}
    >
      <EditableProTable
        rowKey="index"
        scroll={{
          y: 400,
        }}
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({ index: dataSource.length }),
        }}
        loading={false}
        columns={columns1}
        request={async () => ({
          data: currentRow.fields,
          total: currentRow.fields?.length ?? 0,
          success: true,
        })}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          onSave: async (rowKey, data, row) => {
          },
        }}
      />
    </ModalForm>
    <Drawer
      width={document.body.clientWidth <= 500 ? 380 : document.body.clientWidth * 0.3}
      open={showDetail}
      onClose={() => {
        setCurrentRow(undefined);
        setShowDetail(false);
      }}
      closable={false}
    >
      {currentRow?.name && (
        <ProDescriptions<API.RuleListItem>
          column={1}
          title={currentRow?.name}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?.name,
          }}
          columns={[...columns, ...detail_columns] as ProDescriptionsItemProps<API.RuleListItem>[]}
        />
      )}
    </Drawer>
  </PageContainer>
};

export default TableList;

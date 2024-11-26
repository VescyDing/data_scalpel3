import { dataFiles, catalogs, } from '@/services/ant-design-pro/api_v1';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
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
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, history } from '@umijs/max';
import { Button, Drawer, Input, message, Tag, Switch, Modal, Layout, Row, Col, Select } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash'
import SearchTree from '@/components/SearchTree';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  const res = await dataFiles.post(fields);
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
  const res = await dataFiles.put(fields);
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
  const hide = message.loading('正在删除');
  const requests = selectedRows.map(({ id }) => dataFiles.delete({ id }))
  const res = await Promise.all(requests)
  hide();
  const success = res[0].code == '200';
  success && message.success('删除成功');
  return success;
};

const TableList: React.FC = (props: { targetItemDetail?: any, sendSelected?: (model: any) => void }) => {
  const { targetItemDetail, sendSelected } = props;

  const isAPickerComponent = !!sendSelected;

  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);

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

  const type_status = {
    'SHP': 'SHP',
    'GDB': 'GDB',
    'CSV': 'CSV',
    'TXT': 'TXT',
    'XLS': 'XLS',
    'XLSX': 'XLSX',
    'JSON': 'JSON',
  }

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
      type: 'FILE',
      tree: true
    }).then((res) => {
      _catalogsTree(transTreeData(res.data) as [])
    })
  }, [])


  useEffect(() => {
    if (isAPickerComponent) {
      setSelectedRows(targetItemDetail ? [targetItemDetail] : [])
    }
  }, [targetItemDetail])


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
      title: '类型',
      dataIndex: '**type',
      render: (dom, entity) => <Tag>{type_status[entity.type] ?? entity?.type ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: type_status
    },
    {
      title: '创建时间',
      dataIndex: 'createdDate',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
    },
    ...(isAPickerComponent ? [] : [
      {
        title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
        dataIndex: 'option',
        valueType: 'option',
        render: (_, record) => [
          <Button
            type="link"
            key="detail"
            onClick={() => {
              history.push(`list/${record.id}`)
            }}
          >
            <SearchOutlined /> 详情
          </Button>,
        ],
      },
    ]) as any,
  ];

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
        request={dataFiles.get}
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
      title={(currentRow?.id ? '编辑' : '上传') + '文件'}
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
        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('file', value.file?.[0]?.originFileObj);
        formData.append('name', value.name);
        formData.append('alias', value.alias);
        formData.append('type', value.type);
        formData.append('catalogId', value.catalogId);
        value.description && formData.append('description', value.description);
        value.options && formData.append('options', value.options);
        if (id) {
          formData.append('id', value.id);
          success = await handleUpdate(formData as API.RuleListItem);
        } else {
          success = await handleAdd(formData as API.RuleListItem);
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
      <ProFormSelect
        name="type"
        width="md"
        label="类型"
        rules={[{ required: true }]}
        valueEnum={type_status}
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
      <ProFormText
        width="md"
        name="description"
        label="描述"
      />
      <ProFormTextArea
        width="md"
        name="options"
        label="选项"
      />
      {/* TODO: 如果有编辑回显，这块未做 */}
      <ProFormUploadButton
        style={{ width: '100%' }}
        name="file"
        label="文件上传"
        rules={[{ required: true, message: '请上传文件' }]}
        max={1}
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

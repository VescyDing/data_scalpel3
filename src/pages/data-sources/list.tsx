import { dataSources, catalogs, dict } from '@/services/ant-design-pro/api_v1';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, } from '@ant-design/icons';
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
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Tag, Switch, Modal, Layout } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash'
import SearchTree from '@/components/SearchTree';
import { data_source_type_icon, data_source_dict_name } from './enum';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await dataSources.post(fields);
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在更新');
  try {
    await dataSources.put(fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    const requests = selectedRows.map(({ id }) => dataSources.delete({ id }))
    await Promise.all(requests)
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    return false;
  }
};

const TableList: React.FC = (props: { category?: string }) => {
  const { category = 'DATA_SOURCE' } = props;

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
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  const [catalogsTree, _catalogsTree] = useState([]);
  const [params, _params] = useState({ '**category': category });
  const [datasource, _datasource] = useState([]);

  const [state, _state] = useState({});

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
      type: 'DATA_SOURCE',
      tree: true
    }).then((res) => {
      _catalogsTree(transTreeData(res.data) as [])
    })
  }, [])

  const dict_state = {
    'OK': <Tag icon={<CheckCircleOutlined />} color="success">
      可用
    </Tag>,
    'WARN': <Tag icon={<ExclamationCircleOutlined />} color="warning">
      异常
    </Tag>,
    'ERROR': <Tag icon={<CloseCircleOutlined />} color="error">
      错误
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
      title: '类型',
      dataIndex: '**type',
      render: (dom, entity) => data_source_type_icon[entity.type] ?? <Tag>{entity?.type ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: data_source_type_icon
    },
    {
      title: '状态',
      dataIndex: '**state',
      render: (dom, entity) => dict_state[entity.state] ?? <Tag>{entity?.state ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: dict_state
    },
    {
      title: '最后检测时间',
      dataIndex: 'lastCheckTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'lastModifiedDate',
      valueType: 'dateTime',
      search: false,
    },
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
            _state({
              ...state,
              type: record.type,
            })
            handleModalOpen(true);
          }}
        >
          <EditOutlined /> 更新
        </Button>,
      ],
    },
  ];

  const detail_columns: ProColumns<API.RuleListItem>[] = []

  const onSelect = (...args: any) => {
    _params(args[0][0] ? { '**catalogId': args[0][0], '**category': category } : { '**category': category })
  }

  return (
    <PageContainer>
      <Layout style={{ minHeight: '100%' }}>
        <Layout.Sider width="25%" style={{ backgroundColor: 'rgba(255, 255, 255)', marginRight: '16px', borderRadius: '6px', padding: '16px', paddingTop: '23px' }} >
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
            toolBarRender={() => [
              <Button
                key="primary"
                onClick={() => {
                  _state({
                    ...state,
                    type: ''
                  })
                  handleModalOpen(true);
                }}
              >
                <PlusOutlined />新建
              </Button>,
            ]}
            params={params}
            request={dataSources.get}
            columns={columns}
            rowSelection={{
              onChange: (_, selectedRows) => {
                setSelectedRows(selectedRows);
              },
            }}
          />
        </Layout.Content>
      </Layout>

      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          <Button
            danger
            onClick={async () => {
              await handleRemove(selectedRowsState);
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
        title={(currentRow?.id ? '编辑' : '新建') + '数据源'}
        width="40%"
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
            success = await handleUpdate({ id, category, ...value, } as API.RuleListItem);
          } else {
            success = await handleAdd({ category, ...value, } as API.RuleListItem);
          }
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProForm.Group>
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
            label="简称"
          />
          <ProFormSelect
            name="type"
            width="md"
            label="数据源类型"
            rules={[{ required: true }]}
            disabled={!!currentRow?.id}
            request={async () => await dict_type_dom}
            onChange={async v => {
              _state({
                ...state,
                type: v
              })
              if (data_source_dict_name[v]) {
                const res = await dict.get({
                  '**type': data_source_dict_name[v],
                  current: 1,
                  pageSize: 1000,
                })
                _datasource(res.data)
              }
            }}
          />
          <ProFormSelect
            name={['props', 'type']}
            width="md"
            label="数据库类型"
            rules={[{ required: true }]}
            valueEnum={_.mapValues(_.keyBy(datasource, 'name'), 'value')}
            disabled={!datasource.length}
          />
          <ProFormTreeSelect
            name='catalogId'
            width="md"
            label="挂载目录"
            request={async () => await catalogsTree}
          />
        </ProForm.Group>
        <div style={state.type ? { backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #d9d9d9', padding: '12px', boxSizing: 'border-box' } : { display: 'none' }}>
          <ProForm.Group >
            {
              state.type == 'JDBC' && <>
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  name={['props', 'host']}
                  label="地址"
                />
                <ProFormDigit
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  name={['props', 'port']}
                  label="端口"
                />
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  name={['props', 'database']}
                  label="数据库"
                />
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  name={['props', 'username']}
                  label="用户名"
                />
                <ProFormText.Password
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  name={['props', 'password']}
                  label="密码"
                />
              </>
            }
          </ProForm.Group>
          <ProForm.Group>
            <ProFormTextArea
              width="md"
              name={['props', 'params']}
              label="高级选项"
              placeholder={'请输入标准JSON字符串，如：{"key":"value"}。'}
            />
          </ProForm.Group>
        </div>
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
  );
};

export default TableList;

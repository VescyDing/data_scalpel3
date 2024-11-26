import { tasks, catalogs, dict } from '@/services/ant-design-pro/api_v1';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, SyncOutlined, MinusCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined, HistoryOutlined, FieldTimeOutlined, StopOutlined, BranchesOutlined, PlaySquareOutlined } from '@ant-design/icons';
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
  ProFormDateTimePicker,
  ProFormDependency,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Tag, Switch, Modal, Layout, Row, Col, Select, Typography, Breadcrumb } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { history } from '@umijs/max';
import _ from 'lodash'
import SearchTree from '@/components/SearchTree';

const { Text } = Typography;

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  const res = await tasks.post(fields);
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
  const res = await tasks.put(fields);
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
  const requests = selectedRows.map(({ id }) => tasks.delete({ id }))
  const res = await Promise.all(requests)
  hide();
  const success = res[0].code == '200';
  success && message.success('删除成功');
  return success;
};

const handleUpdateFields = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在更新字段');
  const res = await tasks.updateFields(fields);
  hide();
  const success = res.code == '200';
  success && message.success('更新成功');
  return success;
};

const TableList: React.FC = (props: { category?: string }) => {
  const { category = 'DATA_DEV' } = props;

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
  const [params, _params] = useState({});

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
      type: category,
      tree: true
    }).then((res) => {
      _catalogsTree(transTreeData(res.data) as [])
    })
  }, [])

  const dict_status = {
    'ENABLE': <Tag icon={<SyncOutlined spin />} color="processing">
      启用
    </Tag>,
    'DISABLE': <Tag icon={<MinusCircleOutlined />} color="default">
      禁用
    </Tag>
  }

  const dict_taskLastRunStatus = {
    'QUEUING': <Tag icon={<ClockCircleOutlined />} color="processing">
      等待运行
    </Tag>,
    'RUNNING': <Tag icon={<SyncOutlined spin />} color="processing">
      运行中
    </Tag>,
    'SUCCESS': <Tag icon={<CheckCircleOutlined />} color="success">
      成功
    </Tag>,
    'FAILURE': <Tag icon={<CloseCircleOutlined />} color="error">
      失败
    </Tag>,
  }
  const dict_scheduleType = {
    'TIMER': <Tag icon={<PlayCircleOutlined />} color="processing">
      运行一次
    </Tag>,
    'CRON': <Tag icon={<HistoryOutlined />} color="processing">
      周期运行
    </Tag>,
    'INTERVAL': <Tag icon={<FieldTimeOutlined />} color="processing">
      间隔执行
    </Tag>,
    'NONE': <Tag icon={<StopOutlined />} color="default">
      暂不调度
    </Tag>
  }


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
      dataIndex: 'taskType',
      render: (dom, entity) => <Tag>{dom}</Tag>,
      search: false,
    },
    {
      title: '状态',
      dataIndex: '**status',
      render: (dom, entity) => dict_status[entity.status] ?? <Tag>{entity?.status ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: dict_status
    },
    {
      title: '运行状态',
      dataIndex: '**taskLastRunStatus',
      render: (dom, entity) => dict_taskLastRunStatus[entity.taskLastRunStatus] ?? <Tag>{entity?.taskLastRunStatus ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: dict_taskLastRunStatus
    },
    {
      title: '统计',
      dataIndex: 'successCount',
      search: false,
      render: (dom, entity) => <div><Text type="success">{entity?.successCount}</Text>/<Text type="danger">{entity?.failureCount}</Text></div>,
    },
    {
      title: '调度类型',
      dataIndex: '**scheduleType',
      render: (dom, entity) => dict_scheduleType[entity.scheduleType] ?? <Tag>{entity?.scheduleType ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: dict_scheduleType,
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
      width: 265,
      render: (_, record) => [
        <Button
          className='no-padding-button'
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
          className='no-padding-button'
          type="link"
          key="canvas"
          onClick={() => {
            setCurrentRow(record);
            // handleModalOpen(true);
            switch (record.taskType) {
              case 'BATCH_CANVAS':
                history.push(`canvas/${record.id}`);
                break;
              default:
                break;
            }
          }}
        >
          <BranchesOutlined /> 配置
        </Button>,
        <Button
          className='no-padding-button'
          type="link"
          key="run"
          onClick={async () => {
            setCurrentRow(record);
            const res = await tasks.runOnce({ id: record.id });
            if (res?.code == '200') {
              message.success('发起运行成功');
            }
          }}
        >
          <PlaySquareOutlined /> 运行
        </Button>,
        <Switch key="switch" checkedChildren="启用" unCheckedChildren="禁用" checked={record.status === 'ENABLE'} onChange={async v => {
          const { id } = record;
          const hide = message.loading('正在' + (v ? '启用' : '禁用'));
          try {
            await (v ? tasks.enable({ id }) : tasks.disable({ id }));
            hide();
            message.success((v ? '启用' : '禁用') + '成功');
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
  ];

  const detail_columns: ProColumns<API.RuleListItem>[] = []

  const onSelect = (...args: any) => {
    _params(args[0][0] ? { '**catalogId': args[0][0], } : {})
  }

  return (
    <PageContainer title='任务列表' breadcrumb={<Breadcrumb className='ant-page-header-breadcrumb' routes={[{ breadcrumbName: '数据汇聚' }, { breadcrumbName: '任务列表' }]} />}>
      <Layout style={{ minHeight: '100%' }}>
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
            toolBarRender={() => [
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
            request={tasks.get}
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
        title={(currentRow?.id ? '编辑' : '新建') + '任务'}
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
        <ProFormTreeSelect
          name='catalogId'
          width="md"
          label="挂载目录"
          request={async () => await catalogsTree}
        />
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
        <ProFormSelect
          name='taskType'
          width="md"
          label="任务类型"
          rules={[
            {
              required: true,
            },
          ]}
          request={async () => await [{ label: 'BATCH_CANVAS', value: 'BATCH_CANVAS' }]}
        />
        <ProFormSelect
          name='scheduleType'
          width="md"
          label="调度类型"
          rules={[
            {
              required: true,
            },
          ]}
          valueEnum={dict_scheduleType}
        />
        <ProFormDependency name={['scheduleType']}>
          {({ scheduleType }) => {
            if (scheduleType === 'TIMER') {
              return <ProFormDateTimePicker
                name='startTime'
                width="md"
                label="运行时间"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />;
            } else if (scheduleType === 'CRON') {
              return <>
                <ProFormSelect
                  name='TaskCycleType'
                  width="md"
                  label="周期类型"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  valueEnum={{
                    YEAR: '年',
                    MONTH: '月',
                    WEEK: '周',
                    DAY: '天',
                    HOUR: '小时',
                  }}
                />
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  name="cron"
                  label="Cron"
                />
                <ProFormDateTimePicker
                  name='startTime'
                  width="md"
                  label="开始时间"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
                <ProFormDateTimePicker
                  name='endTime'
                  width="md"
                  label="结束时间"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
              </>
            } else if (scheduleType === 'INTERVAL') {
              return <>
                <ProFormDigit
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  width="md"
                  fieldProps={{
                    addonAfter: '分钟',
                  }}
                  name='interval'
                  label="运行间隔"
                />
                <ProFormDateTimePicker
                  name='startTime'
                  width="md"
                  label="开始时间"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
                <ProFormDateTimePicker
                  name='endTime'
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

import { users, dict, roles } from '@/services/ant-design-pro/api_v1';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, MinusCircleOutlined, ExclamationCircleOutlined, KeyOutlined } from '@ant-design/icons';
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
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Tag, Switch } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash'

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await users.post(fields);
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
    await users.put(fields);
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
    const requests = selectedRows.map(({ id }) => users.delete({ id }))
    await Promise.all(requests)
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    return false;
  }
};

const TableList: React.FC = () => {
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

  const [rolesData, _rolesData] = useState<boolean>({});

  useEffect(() => {
    if (!createModalOpen) {
      setCurrentRow({});
    }
  }, [createModalOpen])

  useEffect(() => {
    roles.get({ current: 1, pageSize: 1000 }).then(res => {
      _rolesData(_.mapValues(_.keyBy(res.data, 'id'), 'name'))
    })
  }, [])

  const dict_state = {
    'ENABLE': <Tag icon={<CheckCircleOutlined />} color="processing">
      启用
    </Tag>,
    'DISABLE': <Tag icon={<MinusCircleOutlined />} color="default">
      禁用
    </Tag>,
    'DELETED': <Tag icon={<ExclamationCircleOutlined />} color="error">
      已删除
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
      title: '昵称',
      dataIndex: 'nickName',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '状态',
      dataIndex: '**state',
      render: (dom, entity) => dict_state[entity.state] ?? <Tag>{entity?.state ?? '-'}</Tag>,
      valueType: 'select',
      valueEnum: dict_state
    },
    {
      title: '创建时间',
      dataIndex: 'createdDate',
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
            handleModalOpen(true);
          }}
        >
          <EditOutlined /> 编辑
        </Button>,
        <Button
          type="link"
          key="edit-password"
          onClick={() => {
            setCurrentRow(record);
            _action_modal_1(true);
          }}
        >
          <KeyOutlined /> 修改密码
        </Button>,
        <Switch checkedChildren="启用" unCheckedChildren="禁用" checked={record.state === 'ENABLE'} disabled={record.state == 'DELETED'} onChange={async v => {
          const { id } = record;
          const hide = message.loading('正在' + (v ? '启用' : '禁用'));
          try {
            await (v ? users.enable({ id }) : users.disable({ id }));
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

  return (
    <PageContainer>
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
        request={users.get}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
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
        title={(currentRow?.id ? '编辑' : '新建') + '用户'}
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
            success = await handleUpdate({ id, ...value } as API.RuleListItem);
          } else {
            success = await handleAdd(value as API.RuleListItem);
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
          name="nickName"
          label="昵称"
        />
        {
          currentRow?.id ? null : <>
            <ProFormText.Password
              rules={[
                {
                  required: true,
                },
              ]}
              width="md"
              name="password"
              label="密码"
            />
            <ProFormText.Password
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject("两次密码输入不一致")
                  }
                }),
              ]}
              width="md"
              name="check_password"
              label="确认密码"
            />
          </>
        }
        <ProFormText
          rules={[
            {
              required: true,
            },
          ]}
          width="md"
          name="phone"
          label="手机号"
        />
        <ProFormText
          rules={[
            {
              required: true,
            },
          ]}
          width="md"
          name="email"
          label="邮箱"
        />
        <ProFormSelect
          name="roleId"
          width="md"
          label="角色"
          valueEnum={rolesData}
          rules={[{ required: true }]}
        />
      </ModalForm>
      <ModalForm
        title={'修改密码'}
        width="400px"
        open={action_modal_1}
        onOpenChange={_action_modal_1}
        modalProps={{
          destroyOnClose: true,
        }}
        initialValues={currentRow}
        onFinish={async (value) => {
          let success;
          const { id } = currentRow;
          if (id) {
            const hide = message.loading('正在修改');
            try {
              await users.changePassword({ id, ...value });
              hide();
              message.success('修改密码成功');
              _action_modal_1(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            } catch (error) {
              message.error('修改密码失败!');
            }
          }
        }}
      >
        <ProFormText.Password
          rules={[
            {
              required: true,
            },
          ]}
          width="md"
          name="password"
          label="新密码"
        />
        <ProFormText.Password
          rules={[
            {
              required: true,
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject("两次密码输入不一致")
              }
            }),
          ]}
          width="md"
          name="check_password"
          label="确认密码"
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
  );
};

export default TableList;

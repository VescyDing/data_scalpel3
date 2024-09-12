import { ProCard } from '@ant-design/pro-components';
import { Button } from 'antd';

export default ({ data, menu, closeDrawer }) => {
    return <ProCard
        colSpan="580px"
        title={<div style={{ width: '100%' }} >
            {data?.name}
            <Button type="primary" style={{ float: 'right' }} onClick={() => closeDrawer()}>确定</Button>
        </div>}
        tabs={{
            items: [
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
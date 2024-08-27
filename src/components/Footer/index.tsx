import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      copyright={`${new Date().getFullYear()}《Data Scalpel》powered by VescyDing & SuperHuang`}
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'Data Scalpel',
          title: 'Data Scalpel',
          href: 'https://github.com/VescyDing/data_scalpel3',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/ant-design/ant-design-pro',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;

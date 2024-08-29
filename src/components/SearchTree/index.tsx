import React, { useMemo, useState, useEffect } from 'react';
import { Input, Tree } from 'antd';
import type { TreeDataNode } from 'antd';

const { Search } = Input;

// const defaultData: TreeDataNode[] = [];

const dataList: { key: React.Key; title: string }[] = [];
const generateList = (data: TreeDataNode[]) => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const { key } = node;
        dataList.push({ key, title: key as string });
        if (node.children) {
            generateList(node.children);
        }
    }
};
// generateList(defaultData);

const getParentKey = (key: React.Key, tree: TreeDataNode[]): React.Key => {
    let parentKey: React.Key;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item) => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey!;
};

const App: React.FC = (props: any) => {
    const [defaultData, _defaultData] = useState([]);

    const onSelect = (...args: any) => {
        props?.onSelect?.(...args)
    }

    useEffect(() => {
        _defaultData(props.treeData)
        generateList(defaultData)
    }, [props.treeData])

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const onExpand = (newExpandedKeys: React.Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, defaultData);
                }
                return null;
            })
            .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i));
        setExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    const treeData = useMemo(() => {
        const loop = (data: TreeDataNode[]): TreeDataNode[] =>
            data.map((item) => {
                const strTitle = item.title as string;
                const index = strTitle.indexOf(searchValue);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchValue.length);
                const title =
                    index > -1 ? (
                        <span key={item.key}>
                            {beforeStr}
                            <span className="site-tree-search-value">{searchValue}</span>
                            {afterStr}
                        </span>
                    ) : (
                        <span key={item.key}>{strTitle}</span>
                    );
                if (item.children) {
                    return { title, key: item.key, children: loop(item.children) };
                }

                return {
                    title,
                    key: item.key,
                };
            });

        return loop(defaultData);
    }, [searchValue, defaultData]);

    return (
        <div>
            <Search style={{ marginBottom: 8 }} placeholder="搜索" onChange={onChange} />
            <Tree
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={treeData}
                onSelect={onSelect}
            />
        </div>
    );
};

export default App;
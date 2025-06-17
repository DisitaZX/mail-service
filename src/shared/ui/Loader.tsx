import React from 'react';
import { Spin } from 'antd';

export const Loader: React.FC = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <Spin size="large" />
        </div>
    );
};
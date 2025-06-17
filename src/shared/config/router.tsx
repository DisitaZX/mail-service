import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { App } from '../../app/App';

export const RouterConfig = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
        </Routes>
    );
};
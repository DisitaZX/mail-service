import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainPage } from '@pages/MainPage';
import { PageLoader } from '@widgets/page-loader';

export const AppRouter = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<MainPage />} />
            </Routes>
        </Suspense>
    );
};
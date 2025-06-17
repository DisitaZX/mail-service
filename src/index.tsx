import React from 'react';
import ReactDOM from 'react-dom/client'; // API React 18
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU'; // Локализация для русской версии Ant Design
import { store } from './app/store';
import { App } from './app/App';
import reportWebVitals from './shared/lib/reportWebVitals'; // Метрики производительности
import './shared/styles/global.css';

// Создаём корневой элемент
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// Рендерим приложение с провайдерами
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfigProvider locale={ruRU}>
                <App />
            </ConfigProvider>
        </Provider>
    </React.StrictMode>
);

// Если нужно измерять производительность
reportWebVitals();
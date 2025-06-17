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
        {/* Провайдер Redux store */}
        <Provider store={store}>
            {/* Провайдер Ant Design с русской локализацией */}
            <ConfigProvider locale={ruRU}>
                {/* Главный компонент приложения */}
                <App />
            </ConfigProvider>
        </Provider>
    </React.StrictMode>
);

// Если нужно измерять производительность
reportWebVitals();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { App } from './app/App'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#7600c3',
          colorInfo: '#dfb7ff',
          colorBgBase: '#151218',
          borderRadius: 8,
          fontFamily: 'Manrope, "Space Grotesk", system-ui, sans-serif',
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)

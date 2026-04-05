import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ChampionEncyclopedia } from '../features/champions/pages/ChampionEncyclopedia'
import { ItemGuide } from '../features/items/pages/ItemGuide'
import { BoardBuilder } from '../features/board/pages/BoardBuilder'
import { MetaCompositions } from '../features/meta/pages/MetaCompositions'
import { AdminSection } from '../features/admin/layout/AdminSection'
import { AdminArchiveDashboard } from '../features/admin/pages/AdminArchiveDashboard'
import { AdminDashboardHome } from '../features/admin/pages/AdminDashboardHome'
import { AdminPlaceholderPage } from '../features/admin/pages/AdminPlaceholderPage'
import { AdminChampionsPage } from '../features/admin/pages/AdminChampionsPage'
import { AdminGameDataPage } from '../features/admin/pages/AdminGameDataPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/champions" replace />} />
        <Route path="/champions" element={<ChampionEncyclopedia />} />
        <Route path="/items" element={<ItemGuide />} />
        <Route path="/board" element={<BoardBuilder />} />
        <Route path="/meta" element={<MetaCompositions />} />
        <Route path="/admin" element={<AdminSection />}>
          <Route index element={<Navigate to="archive" replace />} />
          <Route path="dashboard" element={<AdminDashboardHome />} />
          <Route path="archive" element={<AdminArchiveDashboard />} />
          <Route path="champions" element={<AdminChampionsPage />} />
          <Route path="game-data" element={<AdminGameDataPage />} />
          <Route
            path="tactics"
            element={
              <AdminPlaceholderPage
                title="Chiến thuật"
                subtitle="Dòng thời gian macro, lớp phủ do thám và thông tin phòng chờ sẽ nằm tại đây."
              />
            }
          />
          <Route
            path="settings"
            element={
              <AdminPlaceholderPage
                title="Cài đặt"
                subtitle="Khóa API, tinh chỉnh giao diện và mặc định xuất dữ liệu."
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { ChampionEncyclopedia } from '../features/champions/pages/ChampionEncyclopedia'
import { ItemGuide } from '../features/items/pages/ItemGuide'
import { BoardBuilder } from '../features/board/pages/BoardBuilder'
import { MetaCompositions } from '../features/meta/pages/MetaCompositions'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/champions" replace />} />
      <Route path="/champions" element={<ChampionEncyclopedia />} />
      <Route path="/items" element={<ItemGuide />} />
      <Route path="/board" element={<BoardBuilder />} />
      <Route path="/meta" element={<MetaCompositions />} />
    </Routes>
  )
}

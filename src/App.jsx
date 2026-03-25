import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Team from './pages/Team'
import MemberEdit from './pages/MemberEdit'
import ComingFeatures from './pages/ComingFeatures'
import Faq from './pages/Faq'
import AvailabilityComparison from './pages/AvailabilityComparison'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/team/:id" element={<Team />} />
        <Route path="/team/:id/member/new" element={<MemberEdit />} />
        <Route path="/team/:id/member/:memberId" element={<MemberEdit />} />
        <Route path="/team/:id/grid" element={<AvailabilityComparison />} />
        <Route path="/coming-features" element={<ComingFeatures />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ChartList from './pages/ChartList'
import ChartDetail from './pages/ChartDetail'
import Generator from './pages/Generator'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="charts" element={<ChartList />} />
        <Route path="charts/:id" element={<ChartDetail />} />
        <Route path="generator" element={<Generator />} />
      </Route>
    </Routes>
  )
}

export default App

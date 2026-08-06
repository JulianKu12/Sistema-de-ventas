import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import PuntoVentaPage from './pages/PuntoVentaPage'
import IngredientesPage from './pages/IngredientesPage'
import ProductosPage from './pages/ProductosPage'
import CombosPage from './pages/CombosPage'

function RutaProtegida({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <AppShell />
          </RutaProtegida>
        }
      >
        <Route index element={<PuntoVentaPage />} />
        <Route path="ingredientes" element={<IngredientesPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="combos" element={<CombosPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

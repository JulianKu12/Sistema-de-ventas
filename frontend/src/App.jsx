import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import AppShell from './components/layout/AppShell'
import RepartidorShell from './components/layout/RepartidorShell'
import LoginPage from './pages/LoginPage'
import PuntoVentaPage from './pages/PuntoVentaPage'
import IngredientesPage from './pages/IngredientesPage'
import InventarioPage from './pages/InventarioPage'
import ProductosPage from './pages/ProductosPage'
import CombosPage from './pages/CombosPage'
import GastosPage from './pages/GastosPage'
import CajaPage from './pages/CajaPage'
import DevolucionesPage from './pages/DevolucionesPage'
import PedidosPage from './pages/PedidosPage'
import NuevoPedidoPage from './pages/NuevoPedidoPage'
import RepartidoresPage from './pages/RepartidoresPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import ReportesPage from './pages/ReportesPage'
import ClientesPage from './pages/ClientesPage'
import MisPedidosPage from './pages/MisPedidosPage'

function RutaProtegida({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { usuario } = useAuth()
  const esRepartidor = usuario?.tipo === 'Repartidor'

  const adminRoutes = (
    <>
      <Route index element={<PedidosPage />} />
      <Route path="nuevo-pedido" element={<NuevoPedidoPage />} />
      <Route path="punto-venta" element={<PuntoVentaPage />} />
      <Route path="pedidos" element={<PedidosPage />} />
      <Route path="ingredientes" element={<IngredientesPage />} />
      <Route path="inventario" element={<InventarioPage />} />
      <Route path="productos" element={<ProductosPage />} />
      <Route path="combos" element={<CombosPage />} />
      <Route path="gastos" element={<GastosPage />} />
      <Route path="caja" element={<CajaPage />} />
      <Route path="devoluciones" element={<DevolucionesPage />} />
      <Route path="repartidores" element={<RepartidoresPage />} />
      <Route path="configuracion" element={<ConfiguracionPage />} />
      <Route path="reportes" element={<ReportesPage />} />
      <Route path="clientes" element={<ClientesPage />} />
    </>
  )

  const repartidorRoutes = <Route index element={<MisPedidosPage repartidorId={usuario?.empleadoId} />} />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            {esRepartidor ? <RepartidorShell /> : <AppShell />}
          </RutaProtegida>
        }
      >
        {esRepartidor ? repartidorRoutes : adminRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

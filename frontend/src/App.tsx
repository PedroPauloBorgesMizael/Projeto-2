import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home/Home';
import { TicketList } from './pages/Tickets/TicketList';
import { TicketCreate } from './pages/Tickets/TicketCreate';
import { TicketDetails } from './pages/Tickets/TicketDetails';
import { UserList } from './pages/Users/UserList';
import { AuxiliarySettings } from './pages/Settings/AuxiliarySettings';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Home / Início */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* Chamados */}
        <Route
          path="/tickets"
          element={
            <PrivateRoute>
              <TicketList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <PrivateRoute>
              <TicketCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <PrivateRoute>
              <TicketDetails />
            </PrivateRoute>
          }
        />

        {/* Gestão de Usuários */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          }
        />

        {/* Tabelas e Cadastros Auxiliares */}
        <Route
          path="/auxiliary"
          element={
            <PrivateRoute>
              <AuxiliarySettings />
            </PrivateRoute>
          }
        />

        {/* Rota padrão redireciona para a Home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

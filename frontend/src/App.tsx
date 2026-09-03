import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { TicketList } from './pages/Tickets/TicketList';
import { TicketCreate } from './pages/Tickets/TicketCreate';
import { TicketDetails } from './pages/Tickets/TicketDetails';
import { useAuth } from './hooks/useAuth';

import { Layout } from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Navigate to="/tickets" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

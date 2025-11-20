import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Tailors from './pages/Tailors';
import Riders from './pages/Riders';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import CustomerDetails from './pages/CustomerDetails';
import TailorDetails from './pages/TailorDetails';
import RiderDetails from './pages/RiderDetails';
import Messages from './pages/Messages';
import Payments from './pages/Payments';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#F44336',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <CustomerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailors"
            element={
              <ProtectedRoute>
                <Tailors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailors/:id"
            element={
              <ProtectedRoute>
                <TailorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/riders"
            element={
              <ProtectedRoute>
                <Riders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/riders/:id"
            element={
              <ProtectedRoute>
                <RiderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

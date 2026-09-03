import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import TechnicianLayout from './layouts/TechnicianLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import MyOrders from './pages/MyOrders.jsx';
import NotFound from './pages/NotFound.jsx';

// Service booking module — user
import Services from './pages/Services.jsx';
import ServiceBooking from './pages/ServiceBooking.jsx';
import AddressManagement from './pages/AddressManagement.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Invoice from './pages/Invoice.jsx';

// Admin
import AdminLogin from './pages/admin/AdminLogin.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import SubCategoryManagement from './pages/admin/SubCategoryManagement.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import OrderManagement from './pages/admin/OrderManagement.jsx';
import ServiceCategoryManagement from './pages/admin/ServiceCategoryManagement.jsx';
import RepairServiceManagement from './pages/admin/RepairServiceManagement.jsx';
import SparePartManagement from './pages/admin/SparePartManagement.jsx';
import TechnicianManagement from './pages/admin/TechnicianManagement.jsx';
import BookingManagement from './pages/admin/BookingManagement.jsx';
import PaymentManagement from './pages/admin/PaymentManagement.jsx';

// Technician
import TechnicianDashboard from './pages/technician/TechnicianDashboard.jsx';
import AssignedJobs from './pages/technician/AssignedJobs.jsx';
import CompleteService from './pages/technician/CompleteService.jsx';
import CompletedServices from './pages/technician/CompletedServices.jsx';

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/services" element={<Services />} />
      <Route
        path="/services/:id"
        element={
          <ProtectedRoute roles={['user']}>
            <ServiceBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <AddressManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
    </Route>

    {/* Standalone printable invoice (kept out of MainLayout so print is clean) */}
    <Route
      path="/invoice/:bookingId"
      element={
        <ProtectedRoute>
          <Invoice />
        </ProtectedRoute>
      }
    />

    {/* Technician panel */}
    <Route
      element={
        <ProtectedRoute roles={['technician']}>
          <TechnicianLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/technician" element={<TechnicianDashboard />} />
      <Route path="/technician/jobs" element={<AssignedJobs />} />
      <Route path="/technician/jobs/:id/complete" element={<CompleteService />} />
      <Route path="/technician/completed" element={<CompletedServices />} />
    </Route>

    <Route path="/admin/login" element={<AdminLogin />} />

    <Route
      element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/subcategories" element={<SubCategoryManagement />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/service-categories" element={<ServiceCategoryManagement />} />
      <Route path="/admin/repair-services" element={<RepairServiceManagement />} />
      <Route path="/admin/spare-parts" element={<SparePartManagement />} />
      <Route path="/admin/technicians" element={<TechnicianManagement />} />
      <Route path="/admin/bookings" element={<BookingManagement />} />
      <Route path="/admin/payments" element={<PaymentManagement />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;

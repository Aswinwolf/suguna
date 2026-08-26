import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import MyOrders from './pages/MyOrders.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import SubCategoryManagement from './pages/admin/SubCategoryManagement.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import OrderManagement from './pages/admin/OrderManagement.jsx';

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
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
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;

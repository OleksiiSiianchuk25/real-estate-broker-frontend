import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import AddPropertyPage from "./pages/AddPropertyPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import MyPropertiesPage from "./pages/MyPropertiesPage";
import AdminLayout from "./pages/admin/AdminLayout";
import RolesPage from "./pages/admin/RolesPage";
import UsersPage from "./pages/admin/UsersPage";
import PropertiesPage from "./pages/admin/PropertiesPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import PoisPage from "./pages/admin/PoisPage";
import RequireAdmin from "./components/RequireAdmin";
import StatsPage from "./pages/admin/StatsPage";
import FavoritesPageAdmin from "./pages/admin/FavoritesPageAdmin";
import MapPage from "./pages/MapPage"; 
import ChatWidget from "./components/ChatWidget";

function App() {
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

  return (
    <Router>
      <Navbar />

      <ChatWidget />

      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/property/:id" element={<PropertyDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/add-property" element={<AddPropertyPage />} />
          <Route path="/edit-property/:id" element={<EditPropertyPage />} />
          <Route path="/my-properties" element={<MyPropertiesPage />} />
        </Route>

        {/* Адмінські маршрути */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="favorites" element={<FavoritesPageAdmin />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="pois" element={<PoisPage />} />       
        </Route>

        <Route
          path="/admin/stats"
          element={
            <RequireAdmin>
              <StatsPage />
            </RequireAdmin>
          }
        />

        <Route path="/403" element={<h1>403 — Доступ заборонено</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

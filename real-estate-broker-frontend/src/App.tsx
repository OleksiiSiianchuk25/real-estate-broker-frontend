import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ListingsPage />} />
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
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import FavoritesPage from "./pages/FavoritesPage";

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/api"; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logout();
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            🏡 Real Estate Broker
          </Link>
        </Typography>

        <Button color="inherit" component={Link} to="/listings">
          Оголошення
        </Button>

        {isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/profile">
              Кабінет
            </Button>
            <Button color="inherit" onClick={handleLogout} disabled={loadingLogout}>
              {loadingLogout ? <CircularProgress size={20} color="inherit" /> : "Вийти"}
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Увійти
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Реєстрація
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

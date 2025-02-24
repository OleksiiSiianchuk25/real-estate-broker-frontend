import { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/api"; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate("/login");
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
          <Button color="inherit" onClick={handleLogout}>
            Вийти
          </Button>
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

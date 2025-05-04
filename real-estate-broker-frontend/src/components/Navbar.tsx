// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);

    if (token) {
      api
        .get("/users/profile")
        .then((res) => {
          setRole(res.data.role);
        })
        .catch((err) => {
          console.error("Не вдалося отримати профіль у Navbar:", err);
          setRole("");
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    } else {
      setLoadingProfile(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setRole("");
    navigate("/login");
  };

  const openAdminMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const closeAdminMenu = () => {
    setAnchorEl(null);
  };

  const isAdmin = role === "ADMIN";

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Логотип веде на карту */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            🏡 Real Estate Broker
          </Link>
        </Typography>

        {/* Головні сторінки */}
        <Button color="inherit" component={Link} to="/listings">
          Оголошення
        </Button>

        {/* Якщо ще завантажуємо профіль, показуємо спінер */}
        {loadingProfile && (
          <CircularProgress color="inherit" size={24} sx={{ ml: 2 }} />
        )}

        {/* Адмін-меню */}
        {isAuthenticated && isAdmin && !loadingProfile && (
          <>
            <Button color="inherit" onClick={openAdminMenu}>
              Адмін панель
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={closeAdminMenu}
            >
              <MenuItem
                component={Link}
                to="/admin/users"
                onClick={closeAdminMenu}
              >
                Користувачі
              </MenuItem>
              <MenuItem
                component={Link}
                to="/admin/roles"
                onClick={closeAdminMenu}
              >
                Ролі
              </MenuItem>
              <MenuItem
                component={Link}
                to="/admin/categories"
                onClick={closeAdminMenu}
              >
                Категорії
              </MenuItem>
              <MenuItem
                component={Link}
                to="/admin/properties"
                onClick={closeAdminMenu}
              >
                Оголошення
              </MenuItem>
              <MenuItem
                component={Link}
                to="/admin/pois"
                onClick={closeAdminMenu}
              >
                POI
              </MenuItem>
              <MenuItem
                component={Link}
                to="/admin/favorites"
                onClick={closeAdminMenu}
              >
                Закладки
              </MenuItem>
              <MenuItem
                component={Link}
                to="/admin/stats"
                onClick={closeAdminMenu}
              >
                Статистика
              </MenuItem>
            </Menu>
          </>
        )}

        {/* Пункти для авторизованого / неавторизованого */}
        {isAuthenticated ? (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/favorites"
              sx={{ ml: 1 }}
            >
              Улюблені
            </Button>
            <Button color="inherit" component={Link} to="/profile">
              Кабінет
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Вийти
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

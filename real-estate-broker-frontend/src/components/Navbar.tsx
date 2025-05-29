// src/components/Navbar.tsx

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ChatWidget from "./ChatWidget";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAdmin = role === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openAdminMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const closeAdminMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Логотип веде на карту */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              🏡 Real Estate Broker
            </Link>
          </Typography>

          {/* Головні сторінки */}
          <Button color="inherit" component={Link} to="/">
            Карта
          </Button>
          <Button color="inherit" component={Link} to="/listings">
            Оголошення
          </Button>

          {/* Адмін-меню */}
          {isAuthenticated && isAdmin && (
            <>
              <Button color="inherit" onClick={openAdminMenu}>
                Адмін панель
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeAdminMenu}
              >
                <MenuItem component={Link} to="/admin/users" onClick={closeAdminMenu}>
                  Користувачі
                </MenuItem>
                <MenuItem component={Link} to="/admin/roles" onClick={closeAdminMenu}>
                  Ролі
                </MenuItem>
                <MenuItem component={Link} to="/admin/categories" onClick={closeAdminMenu}>
                  Категорії
                </MenuItem>
                <MenuItem component={Link} to="/admin/properties" onClick={closeAdminMenu}>
                  Оголошення
                </MenuItem>
                <MenuItem component={Link} to="/admin/pois" onClick={closeAdminMenu}>
                  POI
                </MenuItem>
                <MenuItem component={Link} to="/admin/favorites" onClick={closeAdminMenu}>
                  Закладки
                </MenuItem>
                <MenuItem component={Link} to="/admin/stats" onClick={closeAdminMenu}>
                  Статистика
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Пункти для авторизованого / неавторизованого */}
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/favorites" sx={{ ml: 1 }}>
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

      {/* Чат-віжет лише для авторизованих */}
      {isAuthenticated && <ChatWidget />}
    </>
  );
};

export default Navbar;

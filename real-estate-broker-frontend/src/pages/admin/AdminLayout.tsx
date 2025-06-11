import React from "react";
import { Container, Tabs, Tab, Box } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const tabPaths = [
  "/admin/users",
  "/admin/roles",
  "/admin/categories",
  "/admin/favorites",
  "/admin/properties",
  "/admin/pois"
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = tabPaths.indexOf(location.pathname);

  const handleChange = (_: React.SyntheticEvent, idx: number) => {
    navigate(tabPaths[idx]);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Tabs value={currentTab >= 0 ? currentTab : 0} onChange={handleChange}>
        <Tab label="Користувачі" />
        <Tab label="Ролі" />
        {/* <Tab label="Категорії" /> */}
        <Tab label="Улюблені" />
        <Tab label="Оголошення" />
        <Tab label="POIs" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default AdminLayout;
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🏠 Real Estate
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Головна
          </Button>
          <Button color="inherit" component={Link} to="/listings">
            Оголошення
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Увійти
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Реєстрація
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;

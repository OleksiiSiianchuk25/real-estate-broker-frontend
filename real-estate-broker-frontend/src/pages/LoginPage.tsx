import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import api from "../utils/api";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    try {
        const response = await api.post("/auth/login", formData);
        const { token, role } = response.data; 

        localStorage.setItem("token", token);
        localStorage.setItem("role", role); 

        setSuccess("Вхід успішний! Перенаправлення...");
        setTimeout(() => navigate("/"), 2000);
    } catch (err) {
        setError("Невірний email або пароль.");
    }
};


  return (
    <Container maxWidth="xs">
      <Box mt={5} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Вхід
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        fullWidth
        label="Електронна пошта"
        margin="normal"
        variant="outlined"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        label="Пароль"
        margin="normal"
        type="password"
        variant="outlined"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Увійти
      </Button>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Ще не маєте акаунту? <a href="/register">Зареєструватися</a>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;

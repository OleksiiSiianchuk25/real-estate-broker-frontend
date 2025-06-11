// src/pages/LoginPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      const { accessToken, role } = response.data;
      // Зберігаємо токен і роль через AuthContext
      login(accessToken, role);

      setSuccess("Вхід успішний! Переадресація...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Помилка при логіні:", err);
      setError("Невірний email або пароль.");
    } finally {
      setLoading(false);
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

      <Box mt={2} textAlign="center">
        {loading ? (
          <CircularProgress />
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Увійти
          </Button>
        )}
      </Box>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Ще не маєте акаунту? <Button component="a" href="/register">Зареєструватися</Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;

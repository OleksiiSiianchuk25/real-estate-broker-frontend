import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import api from "../utils/api";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    agency: "",
    telegram: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    try {
        const response = await api.post("/auth/register", {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
            agency: formData.role === "REALTOR" ? formData.agency : "",
            telegram: formData.telegram || "",
        }, {
            headers: { "Content-Type": "application/json" }, // ✅ Вказуємо заголовки
        });

        setSuccess("Реєстрація успішна! Перенаправлення...");
        setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
        console.error("Помилка при реєстрації:", err);
        setError("Не вдалося зареєструватися. Спробуйте ще раз.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={5} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Реєстрація
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        fullWidth
        label="Повне ім'я"
        margin="normal"
        variant="outlined"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
      />
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
        label="Телефон"
        margin="normal"
        variant="outlined"
        name="phone"
        value={formData.phone}
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

      <FormControl fullWidth margin="normal">
        <InputLabel>Роль</InputLabel>
        <Select
          name="role"
          value={formData.role}
          onChange={handleSelectChange}
        >
          <MenuItem value="USER">Користувач</MenuItem>
          <MenuItem value="REALTOR">Рієлтор</MenuItem>
          <MenuItem value="ADMIN">Адмін</MenuItem>
        </Select>
      </FormControl>

      {formData.role === "REALTOR" && (
        <TextField
          fullWidth
          label="Агентство"
          margin="normal"
          variant="outlined"
          name="agency"
          value={formData.agency}
          onChange={handleChange}
        />
      )}

      <TextField
        fullWidth
        label="Telegram (необов’язково)"
        margin="normal"
        variant="outlined"
        name="telegram"
        value={formData.telegram}
        onChange={handleChange}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleRegister}
      >
        Зареєструватися
      </Button>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Вже маєте акаунт? <a href="/login">Увійти</a>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;

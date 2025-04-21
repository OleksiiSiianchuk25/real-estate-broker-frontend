import { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress } from "@mui/material";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    telegram: "",
    agency: "",
    role: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Отримуємо дані користувача при завантаженні
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Помилка отримання профілю:", error);
        setError("Не вдалося завантажити профіль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put("/users/profile", formData);
      setUser(formData);
      setSuccess("Профіль оновлено успішно!");
      setEditMode(false);
    } catch (err) {
      setError("Помилка оновлення профілю");
    }
  };

  // Переходи для різних дій
  const handleFavorites = () => {
    navigate("/favorites");
  };

  const handleAddProperty = () => {
    navigate("/add-property");
  };

  const handleMyProperties = () => {
    navigate("/my-properties");
  };

  if (loading) {
    return (
      <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "2rem" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={5} textAlign="center">
        <Typography variant="h4">Персональний кабінет</Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Box mt={3}>
        <TextField
          fullWidth
          label="Ім'я"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          disabled={!editMode}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled
          margin="normal"
        />
        <TextField
          fullWidth
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={!editMode}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Telegram"
          name="telegram"
          value={formData.telegram}
          onChange={handleChange}
          disabled={!editMode}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Агентство"
          name="agency"
          value={formData.agency}
          onChange={handleChange}
          disabled={!editMode}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Роль"
          value={user.role}
          disabled
          margin="normal"
        />

        {editMode ? (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleUpdate}
          >
            Зберегти зміни
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setEditMode(true)}
          >
            Редагувати
          </Button>
        )}

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleFavorites}
        >
          Переглянути улюблені
        </Button>

        {user.role === "REALTOR" && (
          <>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleAddProperty}
            >
              Додати оголошення
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleMyProperties}
            >
              Мої оголошення
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default UserProfilePage;

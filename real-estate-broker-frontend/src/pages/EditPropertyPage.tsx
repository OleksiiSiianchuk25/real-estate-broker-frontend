import { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Alert, Box, CircularProgress } from "@mui/material";
import api from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    address: "",
    imageUrl: "",
    status: "FOR_SALE",
    type: "APARTMENT",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setFormData(response.data);
      } catch (err) {
        setError("Не вдалося завантажити оголошення");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/properties/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess("Оголошення оновлено успішно!");
      setTimeout(() => navigate(`/property/${id}`), 2000);
    } catch (err) {
      setError("Помилка оновлення оголошення");
      console.error(err);
    }
  };

  if (loading)
    return (
      <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "2rem" }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Редагувати оголошення
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField
          label="Назва"
          name="title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={handleChange}
        />
        <TextField
          label="Опис"
          name="description"
          fullWidth
          margin="normal"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
        />
        <TextField
          label="Ціна"
          name="price"
          fullWidth
          margin="normal"
          value={formData.price}
          onChange={handleChange}
        />
        <TextField
          label="Місто"
          name="city"
          fullWidth
          margin="normal"
          value={formData.city}
          onChange={handleChange}
        />
        <TextField
          label="Адреса"
          name="address"
          fullWidth
          margin="normal"
          value={formData.address}
          onChange={handleChange}
        />
        <TextField
          label="URL зображення"
          name="imageUrl"
          fullWidth
          margin="normal"
          value={formData.imageUrl}
          onChange={handleChange}
        />
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
          Оновити оголошення
        </Button>
      </Box>
    </Container>
  );
};

export default EditPropertyPage;

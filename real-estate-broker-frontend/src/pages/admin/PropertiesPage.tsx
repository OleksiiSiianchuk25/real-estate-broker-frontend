// src/pages/admin/PropertiesPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// fix default marker icon path
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  type: "APARTMENT" | "HOUSE";
  status: "FOR_SALE" | "FOR_RENT" | "SOLD";
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  realtorId: number;
  imageUrl?: string;
  createdAt: string;
}

const initialCenter: [number, number] = [49.8397, 24.0297]; // Lviv as default

const PropertiesPage: React.FC = () => {
  const [rows, setRows] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // search
  const [searchTerm, setSearchTerm] = useState("");

  // dialogs
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Property>>({});

  const fetch = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Property[]>("/properties");
      setRows(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const handleView = (p: Property) => {
    setCurrent(p);
    setViewOpen(true);
  };
  const handleEdit = (p: Property) => {
    setCurrent(p);
    setEditOpen(true);
  };
  const handleAdd = () => {
    setCurrent({ latitude: initialCenter[0], longitude: initialCenter[1] });
    setAddOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Назва", flex: 1 },
    { field: "city", headerName: "Місто", width: 150 },
    { field: "price", headerName: "Ціна", width: 120 },
    { field: "status", headerName: "Статус", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Дії",
      width: 140,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => handleView(params.row as Property)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as Property)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Видалити"
          onClick={async () => {
            if (window.confirm("Видалити оголошення?")) {
              await api.delete(`/properties/${params.id}`);
              fetch();
            }
          }}
        />,
      ],
    },
  ];

  // Component to pick a location on the map
  const LocationPicker: React.FC<{
    position: [number, number];
    onChange: (lat: number, lng: number) => void;
  }> = ({ position, onChange }) => {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={position} />;
  };

  // View Dialog
  const ViewDialog = () => (
    <Dialog
      open={viewOpen}
      onClose={() => setViewOpen(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Перегляд оголошення</DialogTitle>
      <DialogContent dividers>
        {Object.entries(current).map(([key, val]) => (
          <TextField
            key={key}
            label={key}
            fullWidth
            margin="dense"
            value={val as string | number | undefined ?? ""}
            InputProps={{ readOnly: true }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewOpen(false)}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );

  // Add/Edit Dialog
  const EditDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    isNew: boolean;
  }> = ({ open, onClose, isNew }) => {
    const [form, setForm] = useState<Partial<Property>>(current);

    useEffect(() => {
      setForm(current);
    }, [current]);

    const save = async () => {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (isNew) {
        await api.post("/properties", payload);
      } else {
        await api.put(`/properties/${current.id}`, payload);
      }
      onClose();
      fetch();
    };

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {isNew ? "Додати оголошення" : "Редагувати оголошення"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Назва"
            fullWidth
            margin="dense"
            value={form.title ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
          />
          <TextField
            label="Опис"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <TextField
            label="Ціна"
            type="number"
            fullWidth
            margin="dense"
            value={form.price ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: Number(e.target.value) }))
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="type-label">Тип</InputLabel>
            <Select
              labelId="type-label"
              value={form.type ?? ""}
              label="Тип"
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as any }))
              }
            >
              <MenuItem value="APARTMENT">Квартира</MenuItem>
              <MenuItem value="HOUSE">Будинок</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="status-label">Статус</InputLabel>
            <Select
              labelId="status-label"
              value={form.status ?? ""}
              label="Статус"
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as any }))
              }
            >
              <MenuItem value="FOR_SALE">Продається</MenuItem>
              <MenuItem value="FOR_RENT">Оренда</MenuItem>
              <MenuItem value="SOLD">Продано</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Адреса"
            fullWidth
            margin="dense"
            value={form.address ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />

          <Box mt={2} mb={1}>
            <Typography variant="subtitle1">
              Оберіть місце на карті:
            </Typography>
            <MapContainer
              center={
                form.latitude && form.longitude
                  ? [form.latitude, form.longitude]
                  : initialCenter
              }
              zoom={13}
              style={{ height: 300, width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {form.latitude != null && form.longitude != null && (
                <Marker
                  position={[form.latitude, form.longitude]}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      setForm((f) => ({
                        ...f,
                        latitude: lat,
                        longitude: lng,
                      }));
                    },
                  }}
                />
              )}
              <LocationPicker
                position={
                  form.latitude && form.longitude
                    ? [form.latitude, form.longitude]
                    : initialCenter
                }
                onChange={(lat, lng) =>
                  setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
                }
              />
            </MapContainer>
          </Box>

          <TextField
            label="Місто"
            fullWidth
            margin="dense"
            value={form.city ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, city: e.target.value }))
            }
          />
          <TextField
            label="Realtor ID"
            type="number"
            fullWidth
            margin="dense"
            value={form.realtorId ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, realtorId: Number(e.target.value) }))
            }
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="dense"
            value={form.imageUrl ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Скасувати</Button>
          <Button variant="contained" onClick={save}>
            {isNew ? "Додати" : "Зберегти"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Пошук (назва або місто)"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Додати оголошення
        </Button>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25]}
        />
      </div>

      <ViewDialog />
      <EditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        isNew={false}
      />
      <EditDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        isNew={true}
      />
    </>
  );
};

export default PropertiesPage;

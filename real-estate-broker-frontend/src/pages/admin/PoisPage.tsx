// src/pages/admin/PoisPage.tsx
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
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../utils/api";

interface Poi {
  id: number;
  osmType: string;
  osmId: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

const categories = [
  "park",
  "kindergarten",
  "university",
  "school",
  "hospital",
  "atm",
  "supermarket",
];

const PoisPage: React.FC = () => {
  const [rows, setRows] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Poi>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Poi[]>("/admin/pois");
      setRows(resp.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleView = (poi: Poi) => {
    setCurrent(poi);
    setViewOpen(true);
  };
  const handleEdit = (poi: Poi = {} as Poi) => {
    setCurrent(poi);
    setErrors({});
    setEditOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити POI?")) {
      await api.delete(`/admin/pois/${id}`);
      fetch();
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!current.name) e.name = "Обов'язкове поле";
    if (!current.category) e.category = "Обов'язкове поле";
    if (
      current.latitude == null ||
      isNaN(current.latitude) ||
      current.latitude < -90 ||
      current.latitude > 90
    )
      e.latitude = "Невалідна широта";
    if (
      current.longitude == null ||
      isNaN(current.longitude) ||
      current.longitude < -180 ||
      current.longitude > 180
    )
      e.longitude = "Невалідна довгота";
    return e;
  };

  const save = async (isNew: boolean) => {
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    const payload = {
      ...current,
      latitude: Number(current.latitude),
      longitude: Number(current.longitude),
    };
    if (isNew) await api.post("/admin/pois", payload);
    else await api.put(`/admin/pois/${current.id}`, payload);
    setEditOpen(false);
    fetch();
  };

  // Фільтрація за назвою та категорією
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Назва", flex: 1 },
    { field: "category", headerName: "Категорія", width: 150 },
    { field: "latitude", headerName: "Lat", width: 120 },
    { field: "longitude", headerName: "Lng", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Дії",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => handleView(params.row as Poi)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as Poi)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Видалити"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Пошук (назва або категорія)"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" onClick={() => handleEdit()}>
          Додати POI
        </Button>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </div>

      {/* Перегляд */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth>
        <DialogTitle>Перегляд POI</DialogTitle>
        <DialogContent dividers>
          {["name", "category", "latitude", "longitude", "osmType", "osmId"].map((field) => (
            <TextField
              key={field}
              label={field}
              fullWidth
              margin="dense"
              value={(current as any)[field] ?? ""}
              InputProps={{ readOnly: true }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>

      {/* Додати/Редагувати */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>{current.id ? "Редагувати POI" : "Додати POI"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            required
            value={current.name || ""}
            error={!!errors.name}
            helperText={errors.name}
            onChange={(e) =>
              setCurrent((f) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            select
            label="Category"
            fullWidth
            margin="dense"
            required
            value={current.category || ""}
            error={!!errors.category}
            helperText={errors.category}
            onChange={(e) =>
              setCurrent((f) => ({ ...f, category: e.target.value }))
            }
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Latitude"
            fullWidth
            margin="dense"
            required
            value={current.latitude ?? ""}
            error={!!errors.latitude}
            helperText={errors.latitude}
            onChange={(e) =>
              setCurrent((f) => ({ ...f, latitude: parseFloat(e.target.value) }))
            }
          />
          <TextField
            label="Longitude"
            fullWidth
            margin="dense"
            required
            value={current.longitude ?? ""}
            error={!!errors.longitude}
            helperText={errors.longitude}
            onChange={(e) =>
              setCurrent((f) => ({ ...f, longitude: parseFloat(e.target.value) }))
            }
          />
          <TextField
            label="OSM Type"
            fullWidth
            margin="dense"
            value={current.osmType || ""}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="OSM ID"
            fullWidth
            margin="dense"
            value={current.osmId ?? ""}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Скасувати</Button>
          <Button
            variant="contained"
            onClick={() => save(!current.id)}
          >
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PoisPage;

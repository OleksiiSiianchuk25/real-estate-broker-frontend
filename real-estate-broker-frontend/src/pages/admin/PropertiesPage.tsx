// src/pages/admin/PropertiesPage.tsx
import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import api from "../../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
  createdAt: string; // ISO рядок
}

const PropertiesPage: React.FC = () => {
  const [rows, setRows] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // стани для діалогів
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

  // відкриваємо відповідний діалог
  const handleView = (p: Property) => {
    setCurrent(p);
    setViewOpen(true);
  };
  const handleEdit = (p: Property) => {
    setCurrent(p);
    setEditOpen(true);
  };
  const handleAdd = () => {
    setCurrent({}); 
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
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => handleView(params.row as Property)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as Property)}
        />,
        <GridActionsCellItem
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

  // діалог перегляду
  const ViewDialog = () => (
    <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Перегляд оголошення</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="ID"
          fullWidth
          margin="dense"
          value={current.id ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Назва"
          fullWidth
          margin="dense"
          value={current.title ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Опис"
          fullWidth
          margin="dense"
          multiline
          rows={4}
          value={current.description ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Ціна"
          fullWidth
          margin="dense"
          value={current.price ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Тип"
          fullWidth
          margin="dense"
          value={current.type ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Статус"
          fullWidth
          margin="dense"
          value={current.status ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Адреса"
          fullWidth
          margin="dense"
          value={current.address ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Широта"
          fullWidth
          margin="dense"
          value={current.latitude ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Довгота"
          fullWidth
          margin="dense"
          value={current.longitude ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Місто"
          fullWidth
          margin="dense"
          value={current.city ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Realtor ID"
          fullWidth
          margin="dense"
          value={current.realtorId ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Image URL"
          fullWidth
          margin="dense"
          value={current.imageUrl ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Дата створення"
          fullWidth
          margin="dense"
          value={current.createdAt ?? ""}
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewOpen(false)}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );

  // діалог редагування / додавання
  const EditDialog = ({
    open,
    onClose,
    isNew,
  }: {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
  }) => {
    const [form, setForm] = useState<Partial<Property>>(current);

    useEffect(() => {
      setForm(current);
    }, [current]);

    const save = async () => {
      if (isNew) {
        await api.post("/properties", form);
      } else {
        await api.put(`/properties/${current.id}`, form);
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
          {/* Не редагуємо ID та createdAt */}
          <TextField
            label="Назва"
            fullWidth
            margin="dense"
            value={form.title ?? ""}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <TextField
            label="Опис"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={form.description ?? ""}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <TextField
            label="Ціна"
            type="number"
            fullWidth
            margin="dense"
            value={form.price ?? ""}
            onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
          />
          <TextField
            label="Тип"
            fullWidth
            margin="dense"
            value={form.type ?? ""}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
          />
          <TextField
            label="Статус"
            fullWidth
            margin="dense"
            value={form.status ?? ""}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
          />
          <TextField
            label="Адреса"
            fullWidth
            margin="dense"
            value={form.address ?? ""}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <TextField
            label="Широта"
            type="number"
            fullWidth
            margin="dense"
            value={form.latitude ?? ""}
            onChange={(e) => setForm(f => ({ ...f, latitude: Number(e.target.value) }))}
          />
          <TextField
            label="Довгота"
            type="number"
            fullWidth
            margin="dense"
            value={form.longitude ?? ""}
            onChange={(e) => setForm(f => ({ ...f, longitude: Number(e.target.value) }))}
          />
          <TextField
            label="Місто"
            fullWidth
            margin="dense"
            value={form.city ?? ""}
            onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
          />
          <TextField
            label="Realtor ID"
            type="number"
            fullWidth
            margin="dense"
            value={form.realtorId ?? ""}
            onChange={(e) => setForm(f => ({ ...f, realtorId: Number(e.target.value) }))}
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="dense"
            value={form.imageUrl ?? ""}
            onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
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
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Додати оголошення
      </Button>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
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

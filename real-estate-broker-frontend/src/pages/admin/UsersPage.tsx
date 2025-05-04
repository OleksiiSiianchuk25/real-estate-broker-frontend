// src/pages/admin/UsersPage.tsx

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
  Box,
  CircularProgress,
} from "@mui/material";
import api from "../../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  telegram?: string;
  role: "USER" | "REALTOR" | "ADMIN";
  agency?: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<User>>({});

  // Стан для пошуку
  const [searchText, setSearchText] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const resp = await api.get<User[]>("/admin/users");
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

  const handleView = (u: User) => {
    setCurrent(u);
    setViewOpen(true);
  };
  const handleEdit = (u: User) => {
    setCurrent(u);
    setEditOpen(true);
  };
  const handleAdd = () => {
    setCurrent({});
    setAddOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити користувача?")) {
      await api.delete(`/admin/users/${id}`);
      fetch();
    }
  };

  // Фільтрація за пошуковим текстом
  const filteredRows = rows.filter((u) => {
    const txt = searchText.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(txt) ||
      u.email.toLowerCase().includes(txt) ||
      u.phone.toLowerCase().includes(txt) ||
      (u.telegram?.toLowerCase().includes(txt) ?? false) ||
      u.role.toLowerCase().includes(txt) ||
      (u.agency?.toLowerCase().includes(txt) ?? false)
    );
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fullName", headerName: "Ім'я", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Телефон", flex: 1 },
    { field: "role", headerName: "Роль", width: 120 },
    { field: "telegram", headerName: "Telegram", flex: 1 },
    { field: "agency", headerName: "Агенція", flex: 1 },
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
          onClick={() => handleView(params.row as User)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as User)}
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

  const ViewDialog = () => (
    <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Перегляд користувача</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="ID"
          fullWidth
          margin="dense"
          value={current.id ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Ім'я"
          fullWidth
          margin="dense"
          value={current.fullName ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Email"
          fullWidth
          margin="dense"
          value={current.email ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Телефон"
          fullWidth
          margin="dense"
          value={current.phone ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Telegram"
          fullWidth
          margin="dense"
          value={current.telegram ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Роль"
          fullWidth
          margin="dense"
          value={current.role ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Агенція"
          fullWidth
          margin="dense"
          value={current.agency ?? ""}
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

  const EditDialog = ({
    open,
    onClose,
    isNew,
  }: {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
  }) => {
    const [form, setForm] = useState<Partial<User>>(current);

    useEffect(() => {
      setForm(current);
    }, [current]);

    const save = async () => {
      if (isNew) {
        await api.post("/admin/users", form);
      } else {
        await api.put(`/admin/users/${current.id}`, form);
      }
      onClose();
      fetch();
    };

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{isNew ? "Додати користувача" : "Редагувати користувача"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Ім'я"
            fullWidth
            margin="dense"
            value={form.fullName ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <TextField
            label="Телефон"
            fullWidth
            margin="dense"
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <TextField
            label="Telegram"
            fullWidth
            margin="dense"
            value={form.telegram ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
          />
          <TextField
            label="Роль"
            fullWidth
            margin="dense"
            value={form.role ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}
          />
          <TextField
            label="Агенція"
            fullWidth
            margin="dense"
            value={form.agency ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, agency: e.target.value }))}
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
    <Box p={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Пошук"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Додати користувача
        </Button>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        {loading ? (
          <Box
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        )}
      </div>

      <ViewDialog />
      <EditDialog open={editOpen} onClose={() => setEditOpen(false)} isNew={false} />
      <EditDialog open={addOpen} onClose={() => setAddOpen(false)} isNew={true} />
    </Box>
  );
};

export default UsersPage;

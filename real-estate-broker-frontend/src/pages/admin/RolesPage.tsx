// src/pages/admin/RolesPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../utils/api";

interface Role {
  id: number;
  name: string;
}

const RolesPage: React.FC = () => {
  const [rows, setRows] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Role>>({});

  // Fetch roles
  const fetch = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Role[]>("/api/admin/roles");
      setRows(resp.data);
    } catch {
      // fallback if endpoint unavailable
      setRows([
        { id: 1, name: "USER" },
        { id: 2, name: "REALTOR" },
        { id: 3, name: "ADMIN" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // Фільтруємо рядки за пошуковим терміном
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const handleView = (role: Role) => {
    setCurrent(role);
    setViewOpen(true);
  };
  const handleEdit = (role: Role) => {
    setCurrent(role);
    setEditOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити роль?")) {
      await api.delete(`/api/admin/roles/${id}`);
      fetch();
    }
  };
  const handleAdd = () => {
    setCurrent({});
    setAddOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Назва", flex: 1 },
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
          onClick={() => handleView(params.row as Role)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as Role)}
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

  // Діалоги перегляду/редагування/додавання
  const ViewDialog: React.FC = () => (
    <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth>
      <DialogTitle>Перегляд ролі</DialogTitle>
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
          value={current.name ?? ""}
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewOpen(false)}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );

  const EditDialog: React.FC<{ open: boolean; isNew: boolean }> = ({
    open,
    isNew,
  }) => {
    const [form, setForm] = useState<Partial<Role>>(current);

    useEffect(() => {
      setForm(current);
    }, [current]);

    const save = async () => {
      try {
        if (isNew) {
          await api.post("/api/admin/roles", { name: form.name });
        } else {
          await api.put(`/api/admin/roles/${current.id}`, { name: form.name });
        }
        fetch();
        isNew ? setAddOpen(false) : setEditOpen(false);
      } catch (error) {
        console.error("Save error:", error);
      }
    };

    const handleClose = () => {
      isNew ? setAddOpen(false) : setEditOpen(false);
    };

    return (
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{isNew ? "Додати роль" : "Редагувати роль"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Назва"
            fullWidth
            margin="dense"
            value={form.name ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button variant="contained" onClick={save}>
            {isNew ? "Додати" : "Зберегти"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Пошук */}
      <TextField
        label="Пошук ролі"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, width: "300px" }}
      />

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2, ml: 2 }}>
        Додати роль
      </Button>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
        />
      </div>

      <ViewDialog />
      <EditDialog open={editOpen} isNew={false} />
      <EditDialog open={addOpen} isNew={true} />
    </Box>
  );
};

export default RolesPage;

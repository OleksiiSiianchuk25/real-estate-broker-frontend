// src/pages/admin/RolesPage.tsx
import React, { useState, useEffect } from "react";
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

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Role>>({});

  // Fetch roles from backend (or fallback to hardcoded if endpoint unavailable)
  const fetch = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Role[]>("/api/admin/roles");
      setRows(resp.data);
    } catch {
      // fallback if no admin roles endpoint
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
      await api.delete(`/admin/roles/${id}`);
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
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => handleView(params.row as Role)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as Role)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Видалити"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  // View dialog
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

  // Add/Edit dialog
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
        <DialogTitle>
          {isNew ? "Додати роль" : "Редагувати роль"}
        </DialogTitle>
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
      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Додати роль
      </Button>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
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

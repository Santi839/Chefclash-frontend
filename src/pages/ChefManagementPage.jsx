import { useState, useEffect } from 'react';
import {
  getChefs,
  createChef,
  updateChef,
  deleteChef,
} from '../services/api';
import Swal from 'sweetalert2';

const emptyForm = { name: '', specialty: '', experienceYears: '' };

function ChefManagementPage({ user }) {
  const roleKey = (user?.user?.role || '').toLowerCase();
  const adminRoles = ['admin', 'chef_admin', 'chef-admin'];
  const isAdmin = adminRoles.includes(roleKey);
  const userToken = user?.token ?? null;
  if (!isAdmin) {
    return (
      <section className="page">
        <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
          <h1>Página para administradores</h1>
          <p>Esta sección no está disponible para usuarios visitantes.</p>
        </div>
      </section>
    );
  }

  const [chefs, setChefs] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChef, setEditingChef] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isAdmin || !userToken) {
      return;
    }
    loadChefs();
  }, [isAdmin, userToken]);

  const loadChefs = async () => {
    setListLoading(true);
    setError('');
    try {
  const response = await getChefs(userToken);
      setChefs(response.data);
    } catch (err) {
      setError('Error al cargar los chefs: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio.');
      Swal.fire({ icon: 'error', title: 'Error', text: 'El nombre es obligatorio.' });
      setActionLoading(false);
      return;
    }

    if (formData.experienceYears === '') {
      setError('Los años de experiencia son obligatorios.');
      Swal.fire({ icon: 'error', title: 'Error', text: 'Los años de experiencia son obligatorios.' });
      setActionLoading(false);
      return;
    }

    const parsedExperience = Number(formData.experienceYears);
    if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
      setError('Los años de experiencia deben ser un número mayor o igual a 0.');
      Swal.fire({ icon: 'error', title: 'Error', text: 'Los años de experiencia deben ser un número mayor o igual a 0.' });
      setActionLoading(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      specialty: formData.specialty.trim(),
      experience: parsedExperience,
      experienceYears: parsedExperience,
    };

    try {
      if (editingChef) {
        await updateChef(editingChef.id, payload, userToken);
      } else {
        await createChef(payload, userToken);
      }
      await loadChefs();
      setFormData(emptyForm);
      setIsFormOpen(false);
      setEditingChef(null);
      setSuccess('Chef guardado correctamente.');
      Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Chef guardado correctamente.' });
    } catch (err) {
      setError('Error al guardar el chef: ' + (err.response?.data?.message || err.message));
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (chef) => {
    setEditingChef(chef);
    setFormData({
      name: chef.name,
      specialty: chef.specialty || '',
      experienceYears:
        typeof chef.experience === 'number'
          ? chef.experience
          : chef.experienceYears || '',
    });
    setIsFormOpen(true);
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este chef?')) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
  await deleteChef(id, userToken);
      await loadChefs();
      setSuccess('Chef eliminado correctamente.');
      Swal.fire({ icon: 'success', title: '¡Eliminado!', text: 'Chef eliminado correctamente.' });
    } catch (err) {
      setError('Error al eliminar el chef: ' + (err.response?.data?.message || err.message));
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingChef(null);
    setFormData(emptyForm);
    setError('');
  };

  return (
    <div className="page chef-management">
      <h1>Administración de Chefs</h1>

      {error && (
        <div className="alert error-message" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert success-message" role="status">
          {success}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        disabled={actionLoading || isFormOpen}
      >
        Agregar Chef
      </button>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="card chef-form">
          <h2>{editingChef ? 'Editar Chef' : 'Nuevo Chef'}</h2>

          <div className="field">
            <label htmlFor="chef-name">Nombre</label>
            <input
              id="chef-name"
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="chef-specialty">Especialidad</label>
            <input
              id="chef-specialty"
              type="text"
              value={formData.specialty}
              onChange={(event) =>
                setFormData({ ...formData, specialty: event.target.value })
              }
              placeholder="Postres, Cocina italiana..."
            />
          </div>

          <div className="field">
            <label htmlFor="chef-experience">Años de experiencia</label>
            <input
              id="chef-experience"
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={(event) =>
                setFormData({ ...formData, experienceYears: event.target.value })
              }
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={handleCancel} disabled={actionLoading}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="content-card">
        {listLoading ? (
          <p className="muted">Cargando chefs...</p>
        ) : chefs.length > 0 ? (
          <div className="table-wrapper" role="region" aria-live="polite">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Experiencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {chefs.map((chef) => (
                  <tr key={chef.id}>
                    <td>{chef.name}</td>
                    <td>{chef.specialty || '—'}</td>
                    <td>
                      {typeof chef.experience === 'number'
                        ? `${chef.experience} años`
                        : chef.experienceYears
                        ? `${chef.experienceYears} años`
                        : '—'}
                    </td>
                    <td className="table-actions">
                      <button type="button" onClick={() => handleEdit(chef)} disabled={actionLoading}>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(chef.id)}
                        disabled={actionLoading}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No hay chefs registrados.</p>
        )}
      </div>
    </div>
  );
}

export default ChefManagementPage;

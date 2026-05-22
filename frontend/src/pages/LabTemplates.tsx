import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, FlaskConical } from 'lucide-react';
import { api } from '../utils/api';
import './LabTemplates.css';

interface LabExamDetail {
  id?: number;
  name: string;
  referenceValue: string;
}

interface LabExamTemplate {
  id: number;
  name: string;
  details: LabExamDetail[];
}

export const LabTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<LabExamTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LabExamTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDetails, setFormDetails] = useState<LabExamDetail[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<LabExamTemplate[]>('/lab-exams');
      setTemplates(data);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: LabExamTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    setError('');
  };

  const handleStartCreate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
    setFormName('');
    setFormDetails([{ name: '', referenceValue: '' }]);
    setError('');
  };

  const handleStartEdit = () => {
    if (!selectedTemplate) return;
    setIsEditing(true);
    setFormName(selectedTemplate.name);
    setFormDetails([...selectedTemplate.details]);
    setError('');
  };

  const handleAddDetailRow = () => {
    setFormDetails([...formDetails, { name: '', referenceValue: '' }]);
  };

  const handleRemoveDetailRow = (index: number) => {
    setFormDetails(formDetails.filter((_, idx) => idx !== index));
  };

  const handleDetailChange = (index: number, field: keyof LabExamDetail, value: string) => {
    setFormDetails(
      formDetails.map((detail, idx) =>
        idx === index ? { ...detail, [field]: value } : detail
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('El nombre de la plantilla es obligatorio.');
      return;
    }
    const cleanDetails = formDetails.filter(d => d.name.trim() !== '');
    if (cleanDetails.length === 0) {
      setError('Debe ingresar al menos un indicador/detalle de examen.');
      return;
    }

    setIsLoading(true);
    setError('');

    const payload = {
      name: formName,
      details: cleanDetails
    };

    try {
      if (selectedTemplate) {
        // Edit mode
        const updated = await api.put<LabExamTemplate>(`/lab-exams/${selectedTemplate.id}`, payload);
        setTemplates(templates.map(t => t.id === selectedTemplate.id ? updated : t));
        setSelectedTemplate(updated);
      } else {
        // Create mode
        const created = await api.post<LabExamTemplate>('/lab-exams', payload);
        setTemplates([...templates, created]);
        setSelectedTemplate(created);
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la plantilla.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    if (!window.confirm(`¿Está seguro de que desea eliminar la plantilla "${selectedTemplate.name}"?`)) return;

    setIsLoading(true);
    try {
      await api.delete(`/lab-exams/${selectedTemplate.id}`);
      setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
      setSelectedTemplate(null);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la plantilla.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lab-templates-container">
      <div className="templates-sidebar glass-panel">
        <div className="sidebar-title-row">
          <h3>Plantillas de Examen</h3>
          <button className="btn btn-primary btn-sm" onClick={handleStartCreate}>
            <Plus size={16} /> Nueva
          </button>
        </div>

        {isLoading && templates.length === 0 ? (
          <div className="loading-placeholder">Cargando plantillas...</div>
        ) : templates.length === 0 ? (
          <div className="empty-placeholder">No hay plantillas configuradas.</div>
        ) : (
          <div className="templates-list">
            {templates.map(t => (
              <div
                key={t.id}
                className={`template-item-card ${selectedTemplate?.id === t.id ? 'active' : ''}`}
                onClick={() => handleSelectTemplate(t)}
              >
                <FlaskConical size={16} className="template-icon" />
                <span className="template-name">{t.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="template-detail-view">
        {isEditing ? (
          <form className="template-form glass-panel" onSubmit={handleSave}>
            <div className="detail-header">
              <h2>{selectedTemplate ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}</h2>
              <div className="detail-header-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                  <X size={16} /> Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
                  <Save size={16} /> Guardar
                </button>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="form-group">
              <label>Nombre del Examen</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Hematología completa, Perfil lipídico..."
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
              />
            </div>

            <div className="indicators-section">
              <div className="section-header">
                <h4>Indicadores y Valores de Referencia</h4>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddDetailRow}>
                  <Plus size={14} /> Añadir Indicador
                </button>
              </div>

              <div className="indicators-grid-header">
                <span>Nombre del Indicador</span>
                <span>Valor / Rango de Referencia</span>
                <span style={{ textAlign: 'center' }}>Acción</span>
              </div>

              <div className="indicators-list">
                {formDetails.map((detail, index) => (
                  <div key={index} className="indicator-row">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. Hemoglobina, Colesterol..."
                      value={detail.name}
                      onChange={e => handleDetailChange(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. 12 - 16 g/dL, < 200 mg/dL..."
                      value={detail.referenceValue}
                      onChange={e => handleDetailChange(index, 'referenceValue', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => handleRemoveDetailRow(index)}
                      disabled={formDetails.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        ) : selectedTemplate ? (
          <div className="template-view glass-panel">
            <div className="detail-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FlaskConical size={24} color="var(--accent-color)" />
                <h2>{selectedTemplate.name}</h2>
              </div>
              <div className="detail-header-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleStartEdit}>
                  <Edit size={16} /> Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>

            <div className="indicators-table-wrapper">
              <table className="indicators-table">
                <thead>
                  <tr>
                    <th>Nombre del Indicador</th>
                    <th>Valor de Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTemplate.details.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.name}</strong></td>
                      <td><span className="ref-badge">{d.referenceValue}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="template-select-prompt glass-panel">
            <FlaskConical size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
            <p>Seleccione una plantilla de la lista o cree una nueva para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

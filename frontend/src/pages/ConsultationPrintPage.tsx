import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import './ConsultationPrintPage.css';

interface PatientData {
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: string;
  sex: string;
}

interface DoctorData {
  firstName: string;
  lastName: string;
  medicalLicense: string;
  specialty: string;
}

interface PrintData {
  datetime: string;
  weight: number;
  height: number;
  bloodPressure: string;
  heartRate: number;
  reason: string;
  symptoms: string;
  patient: PatientData;
  doctor: DoctorData;
  findings: any[];
  diagnoses: any[];
  treatments: any[];
  examsRequested: any[];
  clinic: {
    name: string;
    rif: string;
  };
}

export const ConsultationPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const printType = searchParams.get('type') || 'report'; // 'report', 'recipe', 'exams'

  const [data, setData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<PrintData>(`/consultations/${id}`);
        setData(res);
      } catch (err) {
        console.error('Error fetching consultation for print:', err);
        setError('No se pudo cargar la información para imprimir.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    // Cuando los datos terminen de cargar, disparamos la impresión.
    if (!loading && data) {
      setTimeout(() => {
        window.print();
      }, 500); // Pequeño retraso para asegurar el renderizado de estilos y fuentes
    }
  }, [loading, data]);

  if (loading) return <div className="print-loading">Cargando documento...</div>;
  if (error || !data) return <div className="print-loading">{error}</div>;

  const age = data.patient.dateOfBirth 
    ? new Date().getFullYear() - new Date(data.patient.dateOfBirth).getFullYear() 
    : 'N/A';

  // Configurar títulos dependiendo del tipo de documento
  let documentTitle = 'Informe Médico';
  if (printType === 'recipe') documentTitle = 'Récipe Médico';
  if (printType === 'exams') documentTitle = 'Orden de Exámenes';

  return (
    <div className="print-preview-container">
      <div className="paper-sheet">
        
        {/* Cabecera del Documento */}
        <header className="print-header">
          <div className="clinic-logo-placeholder">
            <div className="logo-box">X</div>
            <div>
              <h2>{data.clinic?.name || 'Xinapsis Medical'}</h2>
              <p>RIF: {data.clinic?.rif || 'J-000000000'}</p>
            </div>
          </div>
          <div className="document-title">
            <h1>{documentTitle}</h1>
            <p>Fecha: {new Date(data.datetime).toLocaleDateString('es-VE')}</p>
          </div>
        </header>

        {/* Datos del Paciente y Doctor */}
        <section className="info-grid">
          <div className="info-box">
            <p><strong>Paciente:</strong> {data.patient.firstName} {data.patient.lastName}</p>
            <p><strong>C.I.:</strong> {data.patient.dni}</p>
            <p><strong>Edad:</strong> {age} años</p>
            <p><strong>Sexo:</strong> {data.patient.sex}</p>
          </div>
          <div className="info-box">
            <p><strong>Médico:</strong> Dr/a. {data.doctor.firstName} {data.doctor.lastName}</p>
            <p><strong>Especialidad:</strong> {data.doctor.specialty}</p>
            <p><strong>Licencia/MPPS:</strong> {data.doctor.medicalLicense}</p>
            <p><strong>ID Consulta:</strong> #{id}</p>
          </div>
        </section>

        {/* CONTENIDO SEGÚN EL TIPO DE DOCUMENTO */}

        {/* 1. INFORME MÉDICO */}
        {printType === 'report' && (
          <>
            <section className="print-section">
              <h3 className="section-heading">Signos Vitales y Triaje</h3>
              <div className="vital-signs-grid">
                <div className="vital-sign-item">
                  <span className="label">Peso</span>
                  <span className="value">{data.weight ? `${data.weight} kg` : '--'}</span>
                </div>
                <div className="vital-sign-item">
                  <span className="label">Talla</span>
                  <span className="value">{data.height ? `${data.height} cm` : '--'}</span>
                </div>
                <div className="vital-sign-item">
                  <span className="label">T. Arterial</span>
                  <span className="value">{data.bloodPressure || '--'}</span>
                </div>
                <div className="vital-sign-item">
                  <span className="label">F. Cardíaca</span>
                  <span className="value">{data.heartRate ? `${data.heartRate} lpm` : '--'}</span>
                </div>
              </div>
            </section>

            <section className="print-section">
              <h3 className="section-heading">Anamnesis (Motivo y Síntomas)</h3>
              <p className="print-text"><strong>Motivo:</strong><br/>{data.reason}</p>
              {data.symptoms && <p className="print-text"><strong>Síntomas:</strong><br/>{data.symptoms}</p>}
            </section>

            {data.findings && data.findings.length > 0 && (
              <section className="print-section">
                <h3 className="section-heading">Hallazgos al Examen Físico</h3>
                <ul className="print-list">
                  {data.findings.map((f, i) => (
                    <li key={i} className="print-list-item">
                      <p>{f.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.diagnoses && data.diagnoses.length > 0 && (
              <section className="print-section">
                <h3 className="section-heading">Diagnósticos</h3>
                <ul className="print-list">
                  {data.diagnoses.map((d, i) => (
                    <li key={i} className="print-list-item">
                      <strong>{d.description}</strong>
                      {d.codeCIE10 && <p>CIE-10: {d.codeCIE10}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {/* 2. RÉCIPE MÉDICO (TRATAMIENTOS) */}
        {printType === 'recipe' && (
          <section className="print-section">
            <h3 className="section-heading">Plan de Tratamiento (Rp.)</h3>
            {(!data.treatments || data.treatments.length === 0) ? (
              <p className="print-text">No hay medicamentos prescritos en esta consulta.</p>
            ) : (
              <ul className="print-list">
                {data.treatments.map((t, i) => (
                  <li key={i} className="print-list-item">
                    <strong>{t.medication} {t.dosage ? `- ${t.dosage}` : ''}</strong>
                    <p>{t.instructions}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* 3. ORDEN DE EXÁMENES */}
        {printType === 'exams' && (
          <section className="print-section">
            <h3 className="section-heading">Órdenes de Exámenes y Paraclínicos</h3>
            {(!data.examsRequested || data.examsRequested.length === 0) ? (
              <p className="print-text">No hay exámenes solicitados en esta consulta.</p>
            ) : (
              <ul className="print-list">
                {data.examsRequested.map((e, i) => (
                  <li key={i} className="print-list-item">
                    <strong>{e.name}</strong>
                    <p>Tipo: {e.type}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Footer y Firma */}
        <footer className="print-footer">
          <div className="signature-box">
            <div className="signature-line"></div>
            <strong>Dr/a. {data.doctor.firstName} {data.doctor.lastName}</strong>
            <p>MPPS: {data.doctor.medicalLicense}</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

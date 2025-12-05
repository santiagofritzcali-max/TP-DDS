'use client';
import { useState } from 'react';

const TIPO_DOC_OPCIONES = ['DNI', 'LE', 'LC', 'Pasaporte', 'Otro'];

const initialSearchForm = {
  apellido: '',
  nombre: '',
  tipoDoc: '',
  nroDoc: '',
};

const styles = {
  appRoot: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#333',
  },
  topBar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '10px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  topBarMenuLink: {
    textDecoration: 'none',
    color: '#444',
    margin: '0 4px',
  },
  topBarSeparator: { color: '#ccc', margin: '0 2px' },
  btnSmallDark: {
    borderRadius: '20px',
    border: 'none',
    padding: '6px 18px',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  page: {
    maxWidth: '1100px',
    margin: '30px auto 40px',
    padding: '32px 40px 40px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  h1: { margin: 0, marginBottom: '24px', fontSize: '26px', fontWeight: 500 },
  alert: {
    padding: '10px 14px',
    borderRadius: '2px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertSuccess: {
    backgroundColor: '#e7f6e7',
    border: '1px solid #a3d7a3',
    color: '#256029',
  },
  alertError: {
    backgroundColor: '#fdecea',
    border: '1px solid #f5c2c0',
    color: '#b02a37',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalOverlayError: {
    backgroundColor: 'rgba(242,139,130,0.28)',
  },
  modalContent: {
    backgroundColor: '#fff8d6',
    padding: '20px 24px',
    borderRadius: 6,
    maxWidth: 420,
    width: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    fontSize: 14,
    border: '2px solid #f6c343',
  },
  modalContentError: {
    backgroundColor: '#ffecec',
    border: '2px solid #f28b82',
    color: '#5a1f1f',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    color: '#d39e00',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  modalTitleError: {
    color: '#b00020',
  },
  modalBody: {
    marginBottom: 16,
    color: '#5a4a1f',
    fontSize: 14,
  },
  modalBodyError: {
    color: '#5a1f1f',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    alignItems: 'center',
  },
  modalButtonBase: {
    minWidth: '140px',
    padding: '10px 18px',
    fontSize: '14px',
    borderRadius: '4px',
    border: 'none',
    height: '42px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    cursor: 'pointer',
  },
  modalButtonSecondary: {
    backgroundColor: '#e4e4e4',
    color: '#444',
  },
  modalButtonPrimary: {
    backgroundColor: '#c62828',
    color: '#fff',
  },
  formMainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr',
    columnGap: '40px',
    rowGap: '30px',
    alignItems: 'start',
  },
  formSection: { marginBottom: '24px' },
  formSectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#777',
    borderBottom: '1px solid #ddd',
    paddingBottom: '6px',
    marginBottom: '16px',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: '14px 24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
  },
  label: { marginBottom: '4px', color: '#555' },
  input: {
    padding: '8px 9px',
    borderRadius: '2px',
    border: '1px solid #ccc',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fff',
  },
  fieldError: { marginTop: '3px', fontSize: '11px', color: '#d9534f' },
  actions: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  btnPrimary: {
    minWidth: '120px',
    padding: '10px 18px',
    fontSize: '14px',
    borderRadius: '2px',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '18px',
  },
  btnPrimaryDanger: {
    backgroundColor: '#c62828',
  },
  btnSecondary: {
    minWidth: '120px',
    padding: '10px 18px',
    fontSize: '14px',
    borderRadius: '2px',
    border: 'none',
    backgroundColor: '#e0e0e0',
    color: '#444',
    cursor: 'pointer',
  },
  logoImage: {
    height: 90,
    width: 'auto',
  },
  resultsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'flex-start',
  },
  userList: {
    height: '190px', // Altura fija para alinear botones
    overflowY: 'scroll', // Agrega el scroll cuando sea necesario
    marginTop: 0,
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '15px',
    cursor: 'pointer',
  },
  userRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  userIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#ccc',
  },
  userIconImage: {
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    objectFit: 'cover',
    display: 'block',
  },
  userText: {
    flex: '1',
    fontSize: '14px',
  },
  userRadio: {
    width: 16,
    height: 16,
    cursor: 'pointer',
  },
  acceptButton: {
    padding: '5px 15px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  listActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 0,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
};

const BusquedaHuespedPage = () => {
  const [form, setForm] = useState(initialSearchForm);
  const [huespedes, setHuespedes] = useState([]);
  const [huespedSeleccionado, setHuespedSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarModalSinResultados, setMostrarModalSinResultados] = useState(false);
  const [mostrarModalSinSeleccion, setMostrarModalSinSeleccion] = useState(false);
  const [page, setPage] = useState(1); // Para la paginación
  const [loadingMore, setLoadingMore] = useState(false); // Para evitar múltiples cargas

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBuscar = async () => {
    setCargando(true);
    setMensaje('');

    try {
      const response = await fetch(
        `http://localhost:8080/api/huespedes/busqueda?apellido=${form.apellido}&nombre=${form.nombre}&nroDoc=${form.nroDoc}&tipoDoc=${form.tipoDoc}`
      );
      if (!response.ok) {
        setMensaje('Error al realizar la búsqueda.');
        return;
      }

      // Si el backend devuelve 204 (sin contenido), mostrar el modal sin intentar parsear JSON.
      if (response.status === 204) {
        setMensaje('');
        setHuespedes([]);
        setHuespedSeleccionado(null);
        setPage(1);
        setMostrarModalSinResultados(true);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length === 0) {
        setMensaje('');
        setHuespedes([]);
        setHuespedSeleccionado(null);
        setPage(1);
        setMostrarModalSinResultados(true);
      } else {
        setMostrarModalSinResultados(false);
        setHuespedes(data || []);
        setHuespedSeleccionado(null);
        setPage(1);
      }
    } catch (error) {
      setMensaje('Error al realizar la búsqueda.');
    } finally {
      setCargando(false);
    }
  };

  const handleScroll = async (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loadingMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);

      // Cargar siguiente página de resultados
      try {
        const response = await fetch(
          `http://localhost:8080/api/huespedes/busqueda?apellido=${form.apellido}&nombre=${form.nombre}&nroDoc=${form.nroDoc}&tipoDoc=${form.tipoDoc}&page=${page + 1}`
        );
        const data = await response.json();
        setHuespedes((prevHuespedes) => [...prevHuespedes, ...data]);
      } catch (error) {
        setMensaje('Error al cargar más resultados.');
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const handleAceptarSeleccion = () => {
    if (huespedes.length > 0 && !huespedSeleccionado) {
      setMostrarModalSinSeleccion(true);
      return;
    }
    if (!huespedSeleccionado) return;
    setMensaje(
      `Huesped seleccionado: ${huespedSeleccionado.apellido} - ${huespedSeleccionado.nombre} - ${huespedSeleccionado.nroDoc} (${huespedSeleccionado.tipoDoc})`
    );
  };

  const cerrarModalSinResultados = () => {
    setMostrarModalSinResultados(false);
  };

  const cerrarModalSinSeleccion = () => {
    setMostrarModalSinSeleccion(false);
  };

  const irAltaHuesped = () => {
    window.location.href = '/huespedes/alta';
  };

  return (
    <div style={styles.appRoot}>
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <img
            src="/logo-premier.png"    
            alt="Hotel Premier"
            style={styles.logoImage}
          />
        </div>
      </header>

      <main style={styles.page}>
        <h1 style={styles.h1}>Buscar Huésped</h1>

        {mensaje && <p style={styles.alert}>{mensaje}</p>}

        <form onSubmit={(e) => e.preventDefault()}>
          <div style={styles.formMainGrid}>
            <div>
              <section style={styles.formSection}>
                <div style={styles.formSectionTitle}>Buscar Huésped</div>
                <div style={styles.formGrid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido</label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Documento</label>
                    <select
                      name="tipoDoc"
                      value={form.tipoDoc}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      <option value="">Seleccionar tipo de documento</option>
                      {TIPO_DOC_OPCIONES.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Número de Documento</label>
                    <input
                      name="nroDoc"
                      value={form.nroDoc}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </section>

              <button
                type="button"
                style={styles.btnPrimary}
                onClick={handleBuscar}
                disabled={cargando}
              >
                {cargando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            <div style={styles.resultsColumn}>
              <div style={styles.userList} onScroll={handleScroll}>
                <section style={styles.formSection}>
                  <div style={styles.formSectionTitle}>Resultados de Búsqueda</div>
                  {huespedes.length === 0 ? (
                    <p>No se encontraron resultados.</p>
                  ) : (
                    huespedes.map((huesped) => (
                      <div
                        key={huesped.nroDoc}
                        style={styles.userItem}
                        onClick={() => setHuespedSeleccionado(huesped)}
                      >
                        <div style={styles.userRowLeft}>
                          <img
                            src="/logo-huesped.png"
                            alt={`Huésped ${huesped.apellido}`}
                            style={styles.userIconImage}
                          />
                          <div style={styles.userText}>
                            {`${huesped.apellido} - ${huesped.nombre} - ${huesped.nroDoc} (${huesped.tipoDoc})`}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="huespedSeleccionado"
                          checked={huespedSeleccionado?.nroDoc === huesped.nroDoc}
                          onChange={() => setHuespedSeleccionado(huesped)}
                          style={styles.userRadio}
                        />
                      </div>
                    ))
                  )}
                  {loadingMore && <p>Cargando más...</p>}
                </section>
              </div>
              <div style={styles.listActions}>
                <button
                  type="button"
                  style={styles.btnPrimary}
                  onClick={handleAceptarSeleccion}
                  disabled={huespedes.length === 0}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {mostrarModalSinResultados && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, ...styles.modalContentError }}>
            <div style={{ ...styles.modalTitle, ...styles.modalTitleError }}>
              Huésped no encontrado
            </div>
            <div style={{ ...styles.modalBody, ...styles.modalBodyError }}>
              No se encontraron registros que coincidan con la búsqueda. Verifique los datos ingresados o registre un nuevo huésped.
            </div>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButtonBase, ...styles.modalButtonSecondary }}
                onClick={cerrarModalSinResultados}
              >
                Cancelar
              </button>
              <button
                style={{ ...styles.modalButtonBase, ...styles.modalButtonPrimary }}
                onClick={irAltaHuesped}
              >
                Dar alta de huésped
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalSinSeleccion && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, ...styles.modalContentError }}>
            <div style={{ ...styles.modalTitle, ...styles.modalTitleError }}>
              Huésped no seleccionado
            </div>
            <div style={{ ...styles.modalBody, ...styles.modalBodyError }}>
              Debe seleccionar un huésped para continuar. Por favor, seleccione o registre un nuevo huésped.
            </div>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButtonBase, ...styles.modalButtonSecondary }}
                onClick={cerrarModalSinSeleccion}
              >
                Cancelar
              </button>
              <button
                style={{ ...styles.modalButtonBase, ...styles.modalButtonPrimary }}
                onClick={irAltaHuesped}
              >
                Dar alta de huésped
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusquedaHuespedPage;

import React, { useState } from 'react';
import '../styles/busquedaHuesped.css';
import '../styles/ui.css';
import { buscarHuespedes } from '../services/huespedService';
import { DOC_TYPES } from '../constants/docTypes';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';


const initialSearchForm = {
  apellido: '',
  nombre: '',
  tipoDoc: '',
  nroDoc: '',
};

const BusquedaHuespedPage = () => {
  const [form, setForm] = useState(initialSearchForm);
  const [huespedes, setHuespedes] = useState([]);
  const [huespedSeleccionado, setHuespedSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarModalSinResultados, setMostrarModalSinResultados] = useState(false);
  const [mostrarModalSinSeleccion, setMostrarModalSinSeleccion] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = async () => {
    setCargando(true);
    setMensaje('');
    setHasMore(true);

    try {
      const { status, data } = await buscarHuespedes(form, 1);

      if (status === 204 || (Array.isArray(data) && data.length === 0)) {
        setMensaje('');
        setHuespedes([]);
        setHuespedSeleccionado(null);
        setPage(1);
        setMostrarModalSinResultados(true);
        return;
      }

      setMostrarModalSinResultados(false);
      setHuespedes(data || []);
      setHuespedSeleccionado(null);
      setPage(1);
      setHasMore(Array.isArray(data) && data.length > 0);
    } catch (error) {
      setMensaje(error.message || 'Error al realizar la búsqueda.');
    } finally {
      setCargando(false);
    }
  };

  const handleScroll = async (e) => {
    if (!hasMore) return;
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loadingMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);

      try {
        const { data } = await buscarHuespedes(form, nextPage);

        if (!Array.isArray(data) || data.length === 0) {
          setHasMore(false);
        } else {
          const combinados = [...huespedes, ...data];
          const vistos = new Set();
          const unicos = [];
          combinados.forEach((h) => {
            const key = h?.nroDoc ?? JSON.stringify(h);
            if (!vistos.has(key)) {
              vistos.add(key);
              unicos.push(h);
            }
          });
          const agregados = unicos.length - huespedes.length;
          setHuespedes(unicos);
          if (agregados <= 0) {
            setHasMore(false);
          }
        }
      } catch (error) {
        setMensaje(error.message || 'Error al cargar más resultados.');
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
    navigate('/cu10', { state: { huesped: huespedSeleccionado } });
  };

  const cerrarModalSinResultados = () => {
    setMostrarModalSinResultados(false);
  };

  const cerrarModalSinSeleccion = () => {
    setMostrarModalSinSeleccion(false);
  };

  const irAltaHuesped = () => {
    const origen = huespedSeleccionado || form;
    const params = new URLSearchParams();

    if (origen.nombre) params.append('nombre', origen.nombre);
    if (origen.apellido) params.append('apellido', origen.apellido);
    if (origen.nroDoc) params.append('nroDoc', origen.nroDoc);
    if (origen.tipoDoc) params.append('tipoDoc', origen.tipoDoc);

    const query = params.toString();
    window.location.href = query ? `/cu09?${query}` : '/cu09';
  };

  const handleCancelar = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setForm(initialSearchForm);
    setHuespedes([]);
    setHuespedSeleccionado(null);
    setMensaje('');
    setMostrarModalSinResultados(false);
    setMostrarModalSinSeleccion(false);
    navigate('/'); // ir a la página principal
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  return (
    <div className="appRoot">
      <main className="page">
        <h1 className="h1">Buscar Huésped</h1>

        {mensaje && <p className="alert">{mensaje}</p>}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="formMainGrid">
            <div>
              <section className="formSection">
                <div className="formSectionTitle">Buscar Huésped</div>

                <div className="formGrid2 formGrid2Separated">
                  <div className="formGroup">
                    <label className="label">Apellido</label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label className="label">Nombre</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label className="label">Tipo de Documento</label>
                    <select
                      name="tipoDoc"
                      value={form.tipoDoc}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Seleccionar tipo de documento</option>
                      {DOC_TYPES.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>

                  <div className="formGroup">
                    <label className="label">Número de Documento</label>
                    <input
                      name="nroDoc"
                      value={form.nroDoc}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>
              </section>

              <div className="searchActions">
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={handleCancelar}
                  disabled={cargando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btnPrimary"
                  onClick={handleBuscar}
                  disabled={cargando}
                >
                  {cargando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            <div className="resultsColumn">
              <div className="userList" onScroll={handleScroll}>
                <section className="formSection">
                  <div className="formSectionTitle">Resultados de Búsqueda</div>

                  {huespedes.length === 0 ? (
                    <p>No se encontraron resultados.</p>
                  ) : (
                    huespedes.map((huesped) => (
                      <div
                        key={huesped.nroDoc}
                        className="userItem"
                        onClick={() => setHuespedSeleccionado(huesped)}
                      >
                        <div className="userRowLeft">
                          <img
                            src="/data/logo-huesped.png"
                            alt={`Huésped ${huesped.apellido}`}
                            className="userIconImage"
                          />
                          <div className="userText">
                            {`${huesped.apellido} - ${huesped.nombre} - ${huesped.nroDoc} (${huesped.tipoDoc})`}
                          </div>
                        </div>

                        <input
                          type="radio"
                          name="huespedSeleccionado"
                          checked={huespedSeleccionado?.nroDoc === huesped.nroDoc}
                          onChange={() => setHuespedSeleccionado(huesped)}
                          className="userRadio"
                        />
                      </div>
                    ))
                  )}

                  {loadingMore && <p>Cargando más...</p>}
                </section>
              </div>

              <div className="listActions">
                <button
                  type="button"
                  className="btnPrimary"
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

      <Modal
        open={mostrarModalSinResultados}
        title="CUIDADO"
        variant="warning"
        onClose={cerrarModalSinResultados}
        actions={
          <>
            <button className="btnSecondary" onClick={cerrarModalSinResultados} type="button">
              Cancelar
            </button>
            <button className="btnPrimary" onClick={irAltaHuesped} type="button">
              Dar alta de huésped
            </button>
          </>
        }
      >
        <p>No se encontraron registros que coincidan con la búsqueda.</p>
        <p>Verifique los datos ingresados o registre un nuevo huésped.</p>
      </Modal>

      <Modal
        open={mostrarModalSinSeleccion}
        title="Huésped no seleccionado"
        variant="danger"
        onClose={cerrarModalSinSeleccion}
        actions={
          <>
            <button className="btnSecondary" onClick={cerrarModalSinSeleccion} type="button">
              Cancelar
            </button>
            <button className="btnPrimary" onClick={irAltaHuesped} type="button">
              Dar alta de huésped
            </button>
          </>
        }
      >
        <p>Debe seleccionar un huésped para continuar.</p>
      </Modal>

      <Modal
        open={showCancelModal}
        title="CANCELAR"
        variant="success"
        onClose={handleCloseCancelModal}
        actions={
          <>
            <button className="btnSecondary" onClick={handleCloseCancelModal} type="button">
              No
            </button>
            <button className="btnPrimary" onClick={handleConfirmCancel} type="button">
              Sí
            </button>
          </>
        }
      >
        <p>¿Desea cancelar la búsqueda de huésped?</p>
      </Modal>
    </div>
  );
};

export default BusquedaHuespedPage;

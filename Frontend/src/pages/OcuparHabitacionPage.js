import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ocuparHabitacionStyle.css';
import { ocuparHabitacion } from '../services/estadiaService';
import { buscarHuespedes } from '../services/huespedService';

const OcuparHabitacionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lo que viene desde CU05 (asumimos formato "piso-habitacion", ej. "2-301")
  const {
    numeroHabitacion = '',
    fechaIngreso = '',
    fechaEgreso = '',
    ocupaSobreReserva = false, // por si viene desde el popup de "ocupar igualmente"
  } = location.state || {};

  // Derivamos nroPiso y nroHabitacion (enteros) a partir del string "piso-hab"
  const { nroPiso, nroHabitacion } = useMemo(() => {
    if (typeof numeroHabitacion === 'string' && numeroHabitacion.includes('-')) {
      const [pisoStr, habStr] = numeroHabitacion.split('-');
      const piso = parseInt(pisoStr, 10);
      const hab = parseInt(habStr, 10);
      if (!isNaN(piso) && !isNaN(hab)) {
        return { nroPiso: piso, nroHabitacion: hab };
      }
    }
    return { nroPiso: null, nroHabitacion: null };
  }, [numeroHabitacion]);

  // --- estados ---
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('DNI');
  const [filtroNroDoc, setFiltroNroDoc] = useState('');

  const [resultados, setResultados] = useState([]);
  const [huespedesSeleccionados, setHuespedesSeleccionados] = useState([]);

  const [ocuparIgualSiReservada, setOcuparIgualSiReservada] =
    useState(ocupaSobreReserva);

  const [puedeBuscar, setPuedeBuscar] = useState(true);
  const [mostrarAccionesPostAceptar, setMostrarAccionesPostAceptar] =
    useState(false);

  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeOk, setMensajeOk] = useState('');

  // --- BÚSQUEDA ---

  const handleBuscar = async (e) => {
    e.preventDefault();

    setError('');
    setMensajeOk('');
    setResultados([]);

    setBuscando(true);
    try {
      const { status, data } = await buscarHuespedes(
        {
          nombre: filtroNombre,
          apellido: filtroApellido,
          tipoDoc: filtroTipoDoc,
          nroDoc: filtroNroDoc,
        },
        1
      );

      if (status === 204 || !Array.isArray(data) || data.length === 0) {
        setError('No se encontraron huéspedes con esos datos.');
        setResultados([]);
        return;
      }

      setResultados(data);
    } catch (err) {
      console.error(err);
      setError('Error al buscar huéspedes.');
      setPuedeBuscar(true);
    } finally {
      setBuscando(false);
    }
  };

  // compara tipoDoc+nroDoc
  const esMismoHuesped = (a, b) =>
    a.tipoDoc === b.tipoDoc && a.nroDoc === b.nroDoc;

  // para la selección de los huéspedes
  const toggleSeleccionHuesped = (huesped) => {
    const candidato = { tipoDoc: huesped.tipoDoc, nroDoc: huesped.nroDoc };

    setHuespedesSeleccionados((prev) => {
      const yaEsta = prev.some((h) => esMismoHuesped(h, candidato));
      if (yaEsta) {
        return prev.filter((h) => !esMismoHuesped(h, candidato));
      }
      return [...prev, candidato];
    });
  };

  const estaSeleccionado = (huesped) =>
    huespedesSeleccionados.some((h) =>
      esMismoHuesped(h, { tipoDoc: huesped.tipoDoc, nroDoc: huesped.nroDoc })
    );

  // --- ACEPTAR (NO crea la estadía todavía) ---

  const handleAceptarSeleccion = () => {
    setError('');
    setMensajeOk('');

    if (!nroPiso || !nroHabitacion || !fechaIngreso || !fechaEgreso) {
      setError('Faltan datos de habitación o fechas.');
      return;
    }

    if (huespedesSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un huésped antes de continuar.');
      return;
    }

    // Solo mostramos los 3 botones de abajo
    setMostrarAccionesPostAceptar(true);
  };

  // --- construir body para ocuparHabitacion ---

  const buildRequestBody = () => ({
    nroPiso,
    nroHabitacion,
    fechaIngreso,
    fechaEgreso,
    huespedes: huespedesSeleccionados,
    ocuparIgualSiReservada,
  });

  // --- manejador de cancelar de la pantalla izq ---

  const handleCancelar = () => {
    navigate('/');
  };

  // --- manejador para seguir cargando (NO crea estadía) ---

  const handleSeguirCargando = () => {
    // No se crea estadía, solo reseteamos criterios y resultados
    setResultados([]);
    setFiltroNombre('');
    setFiltroApellido('');
    setFiltroTipoDoc('DNI');
    setFiltroNroDoc('');
    setError('');
    setMensajeOk('');
    setMostrarAccionesPostAceptar(false);
    setPuedeBuscar(true);
    // Importante: NO tocamos huespedesSeleccionados
  };

  // --- manejador para cargar otra habitación (CREA estadía + vuelve al CU05) ---

  const handleCargarOtraHabitacion = async () => {
    setError('');
    setMensajeOk('');
    setEnviando(true);

    try {
      const requestBody = buildRequestBody();
      const resp = await ocuparHabitacion(requestBody);

      setMensajeOk(resp.mensaje || 'Habitación ocupada correctamente.');

      // Luego de crear la estadía, volvemos a ejecutar el CU05 dentro del CU15
      navigate('/cu05', {
        state: {
          modo: 'desdeCU15',
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al ocupar la habitación.');
    } finally {
      setEnviando(false);
    }
  };

  // --- manejador para salir (CREA estadía + vuelve al home) ---

  const handleSalir = async () => {
    setError('');
    setMensajeOk('');
    setEnviando(true);

    try {
      const requestBody = buildRequestBody();
      const resp = await ocuparHabitacion(requestBody);

      setMensajeOk(resp.mensaje || 'Habitación ocupada correctamente.');

      // Volvemos al inicio de la app
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al ocupar la habitación.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="page-ocupar">
      <h1 className="page-title">Ocupar Habitación</h1>

      {/* Info de habitación y fechas */}
      <div className="info-habitacion">
        <div>
          <span className="info-label">Número de habitación: </span>
          <span className="info-value">{numeroHabitacion || '-'}</span>
        </div>
        <div>
          <span className="info-label">Desde: </span>
          <span className="info-value">{fechaIngreso || '-'}</span>
        </div>
        <div>
          <span className="info-label">Hasta: </span>
          <span className="info-value">{fechaEgreso || '-'}</span>
        </div>
      </div>

      <div className="layout-ocupar">
        {/* COLUMNA IZQUIERDA - Buscar huésped */}
        <section className="panel-left">
          <h2 className="panel-title">Buscar Huésped</h2>

          <form className="form-busqueda" onSubmit={handleBuscar}>
            <div className="form-row">
              <label>
                Nombre <br />
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Apellido
                <br />
                <input
                  type="text"
                  value={filtroApellido}
                  onChange={(e) => setFiltroApellido(e.target.value)}
                />
              </label>
            </div>

            <div className="form-row form-row-inline">
              <label>
                Tipo de Documento
                <select
                  value={filtroTipoDoc}
                  onChange={(e) => setFiltroTipoDoc(e.target.value)}
                >
                  <option value="DNI">DNI</option>
                  <option value="LC">LC</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </label>

              <label>
                Nro. de Documento
                <input
                  type="text"
                  value={filtroNroDoc}
                  onChange={(e) => setFiltroNroDoc(e.target.value)}
                />
              </label>
            </div>

            <div className="form-actions-left">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelar}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={buscando || !puedeBuscar}
              >
                {buscando ? 'Buscando...' : 'Aceptar'}
              </button>
            </div>
          </form>
        </section>

        {/* Resultados de la búsqueda */}
        <section className="panel-right">
          <h2 className="panel-title">Resultados de búsqueda</h2>

          <div className="tabla-wrapper">
            <table className="tabla-huespedes">
              <thead className="tabla-encabezado">
                <tr>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Tipo de Documento</th>
                  <th>Nro. de Documento</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {resultados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="tabla-empty">
                      No hay resultados para mostrar.
                    </td>
                  </tr>
                ) : (
                  resultados.map((h) => (
                    <tr key={`${h.tipoDoc}-${h.nroDoc}`}>
                      <td>{h.apellido}</td>
                      <td>{h.nombre}</td>
                      <td>{h.tipoDoc}</td>
                      <td>{h.nroDoc}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={estaSeleccionado(h)}
                          onChange={() => toggleSeleccionHuesped(h)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Aceptar (derecha) */}
          <div className="panel-footer-right">
            <div />
            <button
              type="button"
              className="btn-primary"
              onClick={handleAceptarSeleccion}
              disabled={enviando || mostrarAccionesPostAceptar}
            >
              Aceptar
            </button>
          </div>
          {/* Botones inferiores: sólo visibles después de Aceptar */}
          {mostrarAccionesPostAceptar && (
            <div className="panel-footer-bottom">
              <div className="panel-footer-bottom-left">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleSeguirCargando}
                >
                  Seguir cargando
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCargarOtraHabitacion}
                  disabled={enviando}
                >
                  {enviando ? 'Guardando...' : 'Cargar otra habitación'}
                </button>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSalir}
                disabled={enviando}
              >
                {enviando ? 'Guardando...' : 'Salir'}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mensajes */}
      {error && <div className="alert alert-error">{error}</div>}
      {mensajeOk && (
        <div className="alert alert-success">{mensajeOk}</div>
      )}
    </div>
  );
};

export default OcuparHabitacionPage;

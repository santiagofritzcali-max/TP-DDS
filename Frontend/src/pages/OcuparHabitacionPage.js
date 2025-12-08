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

  // Form de búsqueda de huésped
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('DNI');
  const [filtroNroDoc, setFiltroNroDoc] = useState('');

  // Resultados / selección
  const [resultados, setResultados] = useState([]);
  // ahora guardamos objetos { tipoDoc, nroDoc }
  const [huespedesSeleccionados, setHuespedesSeleccionados] = useState([]);
  const [ocuparIgualSiReservada, setOcuparIgualSiReservada] = useState(false);

  // Estado general
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeOk, setMensajeOk] = useState('');

  // --- BÚSQUEDA ---
  const handleBuscar = async (e) => {
  e.preventDefault();
  setError('');
  setMensajeOk('');
  setResultados([]);          // limpiamos solo los resultados que se ven
  // NO limpiamos huespedesSeleccionados

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
    setError('Error al buscar huéspedes.');
  } finally {
    setBuscando(false);
  }
};


  // helpers para comparar tipoDoc+nroDoc
  const esMismoHuesped = (a, b) =>
    a.tipoDoc === b.tipoDoc && a.nroDoc === b.nroDoc;

  // --- SELECCIÓN DE HUESPEDES ---
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

  // --- ACEPTAR (OCUPAR HABITACIÓN) ---
  const handleConfirmarOcupacion = async () => {
    setError('');
    setMensajeOk('');

    if (!nroPiso || !nroHabitacion || !fechaIngreso || !fechaEgreso) {
      setError(
        'Faltan datos de habitación o fechas (deberían venir desde el CU05).'
      );
      return;
    }

    if (huespedesSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un huésped.');
      return;
    }

    const requestBody = {
      nroPiso,
      nroHabitacion,
      fechaIngreso,   // "YYYY-MM-DD"
      fechaEgreso,    // "YYYY-MM-DD"
      huespedes: huespedesSeleccionados, // [{tipoDoc, nroDoc}]
      ocuparIgualSiReservada,
    };

    setEnviando(true);
    try {
      const resp = await ocuparHabitacion(requestBody);
      setMensajeOk(resp.mensaje || 'Habitación ocupada correctamente.');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  // --- CANCELAR (columna izquierda) ---
  const handleCancelar = () => {
    navigate('/'); // o a donde quieras salir del CU15
  };

  // --- SEGUIR CARGANDO ---
  const handleSeguirCargando = () => {
    setResultados([]);
    setFiltroNombre('');
    setFiltroApellido('');
    setFiltroTipoDoc('DNI');
    setFiltroNroDoc('');
    setError('');
    setMensajeOk('');
    // huespedesSeleccionados se mantiene
  };

  // --- CARGAR OTRA HABITACIÓN ---
  const handleCargarOtraHabitacion = () => {
    navigate('/cu05', {
      state: {
        numeroHabitacion,
        fechaIngreso,
        fechaEgreso,
        huespedesSeleccionados, // ahora pasamos los objetos, no ids
      },
    });
  };

  const handleSalir = () => {
    navigate('/');
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
                Apellido<br />
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
                disabled={buscando}
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

          {/* Checkbox + Aceptar (derecha) */}
          <div className="panel-footer-right">
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={ocuparIgualSiReservada}
                onChange={(e) =>
                  setOcuparIgualSiReservada(e.target.checked)
                }
              />
              Ocupar igual si está reservada
            </label>

            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmarOcupacion}
              disabled={enviando}
            >
              {enviando ? 'Ocupando...' : 'Aceptar'}
            </button>
          </div>

          {/* Botones inferiores */}
          <div className="panel-footer-bottom">
            <div className="panel-footer-bottom-left">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSeguirCargando}
                disabled={huespedesSeleccionados.length === 0}
              >
                Seguir cargando
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCargarOtraHabitacion}
                disabled={huespedesSeleccionados.length === 0}
              >
                Cargar otra habitación
              </button>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSalir}
            >
              Salir
            </button>
          </div>
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

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ocuparHabitacionStyle.css';
import { ocuparHabitacion } from '../services/estadiaService';
import { buscarHuespedes } from '../services/huespedService'; 

const OcuparHabitacionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Datos que vienen (o vendrán) desde CU05
  const {
    numeroHabitacion = '',
    fechaIngreso = '',
    fechaEgreso = '',
  } = location.state || {};

  // Form de búsqueda de huésped
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('DNI');
  const [filtroNroDoc, setFiltroNroDoc] = useState('');

  // Resultados / selección
  const [resultados, setResultados] = useState([]);
  const [idsSeleccionados, setIdsSeleccionados] = useState([]);
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
    setResultados([]);
    setIdsSeleccionados([]);

    setBuscando(true);
    try {
      const data = await buscarHuespedes(
        {
          nombre: filtroNombre,
          apellido: filtroApellido,
          tipoDoc: filtroTipoDoc,
          nroDoc: filtroNroDoc,
        },
        1
      );
      setResultados(data);

      if (data.length === 0) {
        setError('No se encontraron huéspedes con esos datos.');
      }
    } catch (err) {
      setError('Error al buscar huéspedes.');
    } finally {
      setBuscando(false);
    }
  };


  // --- SELECCIÓN DE HUESPEDES ---
  const toggleSeleccionHuesped = (id) => {
    setIdsSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --- ACEPTAR (OCUPAR HABITACIÓN) ---
  const handleConfirmarOcupacion = async () => {
    setError('');
    setMensajeOk('');

    if (!numeroHabitacion || !fechaIngreso || !fechaEgreso) {
      setError(
        'Faltan datos de habitación o fechas (deberían venir desde el CU05).'
      );
      return;
    }

    if (idsSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un huésped.');
      return;
    }

    const requestBody = {
      numeroHabitacion: String(numeroHabitacion),
      fechaIngreso,   // "YYYY-MM-DD"
      fechaEgreso,    // "YYYY-MM-DD"
      idsHuespedes: idsSeleccionados,
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
  // Deja guardados los idsSeleccionados y limpia la búsqueda/lista
  const handleSeguirCargando = () => {
    setResultados([]);
    setFiltroNombre('');
    setFiltroApellido('');
    setFiltroTipoDoc('DNI');
    setFiltroNroDoc('');
    setError('');
    setMensajeOk('');
    // idsSeleccionados se mantiene tal cual
  };

  // --- CARGAR OTRA HABITACIÓN ---
  // Vuelve al CU05, pasando los huéspedes seleccionados y datos actuales
  const handleCargarOtraHabitacion = () => {
    navigate('/cu05', {
      state: {
        numeroHabitacion,
        fechaIngreso,
        fechaEgreso,
        idsHuespedesSeleccionados: idsSeleccionados,
      },
    });
  };

  const handleSalir = () => {
    navigate('/'); // si no usás "Salir", podés borrar este handler
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
                Nombre <br/>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Apellido<br/>
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

        {/*Resultados de la busqueda */}
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
                    <tr key={h.id}>
                      <td>{h.apellido}</td>
                      <td>{h.nombre}</td>
                      <td>{h.tipoDoc}</td>
                      <td>{h.nroDoc}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={idsSeleccionados.includes(h.id)}
                          onChange={() => toggleSeleccionHuesped(h.id)}
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

          {/* Botones inferiores: seguir cargando / cargar otra habitación / salir */}
          <div className="panel-footer-bottom">
            <div className="panel-footer-bottom-left">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSeguirCargando}
                disabled={idsSeleccionados.length === 0}
              >
                Seguir cargando
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCargarOtraHabitacion}
                disabled={idsSeleccionados.length === 0}
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

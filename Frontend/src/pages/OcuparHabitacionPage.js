import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ocuparHabitacionStyle.css';
import '../styles/ui.css';
import Modal from '../components/Modal';
import { ocuparHabitacion } from '../services/estadiaService';
import { buscarHuespedes } from '../services/huespedService';
import Button from '../components/Button';
import Alert from '../components/Alert';
import DataTable from '../components/DataTable';
import { formatFecha } from '../utils/date';
import { validarOcuparHabitacion } from '../validators/validarOcuparHabitacion';
import { parseOcuparNavigationState } from '../utils/ocupacionState';
import { DOC_TYPES } from '../constants/docTypes';

const OcuparHabitacionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lo que viene desde CU05 (asumimos formato "piso-habitacion", ej. "2-301")
  const {
    numeroHabitacion = '',
    fechaIngreso = '',
    fechaEgreso = '',
    ocupaSobreReserva = false, // por si viene desde el popup de "ocupar igualmente"
    reservaInfo = null,
  } = parseOcuparNavigationState(location.state || {});

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
  const [filtroTipoDoc, setFiltroTipoDoc] = useState(DOC_TYPES[0]);
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
  const [conflictoReserva, setConflictoReserva] = useState(null);
  const [accionTrasOcupar, setAccionTrasOcupar] = useState(null);

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

    const validacion = validarOcuparHabitacion(buildRequestBody());
    if (validacion.length > 0) {
      setError(validacion[0]);
      return;
    }

    // Solo mostramos los 3 botones de abajo
    setMostrarAccionesPostAceptar(true);
  };

  // --- construir body para ocuparHabitacion ---

  const buildRequestBody = (forzarReserva = false) => ({
    nroPiso,
    nroHabitacion,
    fechaIngreso,
    fechaEgreso,
    huespedes: huespedesSeleccionados,
    ocuparIgualSiReservada: forzarReserva || ocuparIgualSiReservada,
  });


  const buildReservaLabel = (info) => {
    if (!info) return 'Reserva existente';
    const { apellido, nombre, telefono } = info;
    const titular = [apellido, nombre].filter(Boolean).join(' ').trim();
    const contacto = telefono ? ` - ${telefono}` : '';
    return (titular || 'Reserva existente') + contacto;
  };

  const navegarDespuesDeOcupar = (accion) => {
    if (accion === 'otra') {
      navigate('/cu05', {
        state: {
          modo: 'desdeCU15',
        },
      });
    } else if (accion === 'salir') {
      navigate('/');
    }
  };

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
    setConflictoReserva(null);
    setAccionTrasOcupar(null);
    // Importante: NO tocamos huespedesSeleccionados
  };

  const ejecutarOcupacion = async (accion, forzarReserva = false) => {
    setError('');
    setMensajeOk('');
    setConflictoReserva(null);

    const requestBody = buildRequestBody(forzarReserva);
    const validacion = validarOcuparHabitacion(requestBody);
    if (validacion.length > 0) {
      setError(validacion[0]);
      return;
    }

    setEnviando(true);
    setAccionTrasOcupar(accion);

    try {
      if (forzarReserva) {
        setOcuparIgualSiReservada(true);
      }

      const result = await ocuparHabitacion(requestBody);

      if (result.status === 409) {
        const data = result.data || {};
        setConflictoReserva({
          rango: {
            desde: data.fechaIngreso || fechaIngreso,
            hasta: data.fechaEgreso || fechaEgreso,
          },
          reservaInfo: data.reservaInfo,
          mensaje: data.mensaje,
        });
        return;
      }

      const resp = (result && result.data) || {};
      setMensajeOk(resp.mensaje || 'Habitacion ocupada correctamente.');

      navegarDespuesDeOcupar(accion);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al ocupar la habitacion.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCargarOtraHabitacion = async () => {
    await ejecutarOcupacion('otra');
  };

  const handleSalir = async () => {
    await ejecutarOcupacion('salir');
  };

  const cerrarConflicto = () => {
    setConflictoReserva(null);
  };

  const handleOcuparIgual = async () => {
    cerrarConflicto();
    await ejecutarOcupacion(accionTrasOcupar || 'otra', true);
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
                  {DOC_TYPES.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
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
              <Button variant="secondary" type="button" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={buscando || !puedeBuscar}>
                {buscando ? 'Buscando...' : 'Aceptar'}
              </Button>
            </div>
          </form>
        </section>

        {/* Resultados de la búsqueda */}
        <section className="panel-right">
          <h2 className="panel-title">Resultados de búsqueda</h2>

          <div className="tabla-wrapper">
            <DataTable
              headers={[
                'Apellido',
                'Nombre',
                'Tipo de Documento',
                'Nro. de Documento',
                'Seleccionar',
              ]}
              data={resultados}
              className="tabla-huespedes"
              headerClassName="tabla-encabezado"
              emptyClassName="tabla-empty"
              emptyMessage="No hay resultados para mostrar."
              renderRow={(h) => (
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
              )}
            />
          </div>

          {/* Aceptar (derecha) */}
          <div className="panel-footer-right">
            <div />
            <Button
              type="button"
              variant="primary"
              onClick={handleAceptarSeleccion}
              disabled={enviando || mostrarAccionesPostAceptar}
            >
              Aceptar
            </Button>
          </div>
          {/* Botones inferiores: sólo visibles después de Aceptar */}
          {mostrarAccionesPostAceptar && (
            <div className="panel-footer-bottom">
              <div className="panel-footer-bottom-left">
                <Button variant="secondary" type="button" onClick={handleSeguirCargando}>
                  Seguir cargando
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleCargarOtraHabitacion}
                  disabled={enviando}
                >
                  {enviando ? 'Guardando...' : 'Cargar otra habitación'}
                </Button>
              </div>
              <Button variant="secondary" type="button" onClick={handleSalir} disabled={enviando}>
                {enviando ? 'Guardando...' : 'Salir'}
              </Button>
            </div>
          )}
        </section>
      </div>

      {conflictoReserva && (
        <Modal
          open
          title="CUIDADO"
          variant="warning"
          onClose={cerrarConflicto}
          actions={
            <>
              <Button type="button" variant="secondary" onClick={cerrarConflicto}>
                Volver
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleOcuparIgual}
                disabled={enviando}
              >
                {enviando ? "Ocupando..." : "Ocupar igualmente"}
              </Button>
            </>
          }
        >
          <p>En el rango seleccionado hay días donde la habitación está reservada.</p>
          <p>
            Desde: {formatFecha(conflictoReserva.rango?.desde)} Hasta:{" "}
            {formatFecha(conflictoReserva.rango?.hasta)}
          </p>
          <p>Reservado por: {buildReservaLabel(conflictoReserva.reservaInfo)}</p>
          {conflictoReserva.mensaje && <p>{conflictoReserva.mensaje}</p>}
        </Modal>
      )}

      {/* Mensajes */}
      {error && <Alert type="error">{error}</Alert>}
      {mensajeOk && <Alert type="success">{mensajeOk}</Alert>}
    </div>
  );
};

export default OcuparHabitacionPage;

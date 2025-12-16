import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/facturacionStyle.css";
import "../styles/ui.css";
import { buscarReservasPorApellido, cancelarReservas } from "../services/reservaService";
import Modal from "../components/Modal";

const formatTipoHabitacion = (tipo) => {
  if (!tipo) return "";
  return tipo
    .toString()
    .split("_")
    .map((t) => t.charAt(0) + t.slice(1).toLowerCase())
    .join(" ");
};

const CancelarReservaPage = () => {
  const navigate = useNavigate();
  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");
  const [errores, setErrores] = useState({});
  const [buscando, setBuscando] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [errorModal, setErrorModal] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [confirmarModal, setConfirmarModal] = useState(false);
  const [exitoModal, setExitoModal] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [busquedaHecha, setBusquedaHecha] = useState(false);

  const reset = () => {
    setApellido("");
    setNombre("");
    setErrores({});
    setReservas([]);
    setSeleccionadas([]);
    setErrorModal(null);
    setInfoModal(null);
    setConfirmarModal(false);
    setExitoModal(false);
    setMensajeExito("");
    setBuscando(false);
    setCancelando(false);
    setBusquedaHecha(false);
  };

  const validar = () => {
    const errs = {};
    if (!apellido.trim()) errs.apellido = "El campo apellido no puede estar vacio";
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBuscar = async () => {
    if (!validar()) return;
    setBuscando(true);
    setBusquedaHecha(false);
    setErrores({});
    setReservas([]);
    setSeleccionadas([]);
    try {
      let hayResultados = false;
      const { ok, data, status, error } = await buscarReservasPorApellido(
        apellido.trim(),
        nombre.trim()
      );
      if (!ok) {
        if (status === 404) {
          setInfoModal("No existen reservas para los criterios de busqueda");
        } else {
          setErrorModal(error || "No se pudo buscar reservas.");
        }
        return;
      }
      const lista = Array.isArray(data)
        ? data.map((item, idx) => ({
            id: item.idReserva ?? item.id ?? idx,
            apellido: item.apellido,
            nombre: item.nombre,
            numeroHabitacion: item.numeroHabitacion,
            tipoHabitacion: item.tipoHabitacion,
            fechaInicio: item.fechaInicio,
            fechaFin: item.fechaFin,
          }))
        : [];
      setReservas(lista);
      hayResultados = lista.length > 0;
      if (!hayResultados) {
        setInfoModal("No existen reservas para los criterios de busqueda");
      }
      setBusquedaHecha(hayResultados);
    } catch (e) {
      setErrorModal(e.message || "No se pudo buscar reservas.");
    } finally {
      setBuscando(false);
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAceptar = async () => {
    if (seleccionadas.length === 0) {
      setInfoModal("Seleccione al menos una reserva para cancelar.");
      return;
    }
    setConfirmarModal(true);
  };

  const confirmarCancelacion = async () => {
    setConfirmarModal(false);
    setCancelando(true);
    try {
      const { ok, error } = await cancelarReservas(seleccionadas);
      if (!ok) {
        setErrorModal(error || "No se pudieron cancelar las reservas.");
        return;
      }
      setMensajeExito("Reservas cancelada/s. PRESIONE UNA TECLA PARA CONTINUAR...");
      setExitoModal(true);
    } catch (e) {
      setErrorModal(e.message || "No se pudieron cancelar las reservas.");
    } finally {
      setCancelando(false);
    }
  };

  const columnas = [
    { key: "apellido", label: "Apellido" },
    { key: "nombre", label: "Nombre" },
    { key: "numeroHabitacion", label: "Nro. Hab" },
    { key: "tipoHabitacion", label: "Tipo Hab" },
    { key: "fechaInicio", label: "Fecha inicio" },
    { key: "fechaFin", label: "Fecha fin" },
  ];

  return (
    <div className="factura-wrapper">
      <div className="factura-page">
      <section className="factura-panel left">
        <h2>Cancelar reserva</h2>
        <label className="field-label">
          <span className="label-row">
            Apellido <span className="required">*</span>
          </span>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className={errores.apellido ? "input-error" : ""}
            placeholder="Apellido"
          />
          {errores.apellido && <div className="error-inline">{errores.apellido}</div>}
        </label>
        <label className="field-label">
          Nombres
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombres"
          />
        </label>
        <div className="actions-row">
          <button className="btn btn-secondary" type="button" onClick={() => { reset(); navigate("/"); }}>
            Cancelar
          </button>
          <button
            className={`btn btn-primary ${buscando ? "btn-loading" : ""}`}
            type="button"
            onClick={handleBuscar}
            disabled={buscando}
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </section>

      {busquedaHecha && reservas.length > 0 && (
        <section className="factura-panel right">
          <h2>Resultados</h2>
          <div className="lista-ocupantes reservas-grid">
            <div className="ocupante-item encabezado">
              <span></span>
              <span>Apellido</span>
              <span>Nombre</span>
              <span>Nro. Hab.</span>
              <span>Tipo Habitacion</span>
              <span>Fecha inicio</span>
              <span>Fecha fin</span>
            </div>
            {reservas.map((r) => (
              <div key={r.id} className="ocupante-item fila">
                <input
                  type="checkbox"
                  checked={seleccionadas.includes(r.id)}
                  onChange={() => toggleSeleccion(r.id)}
                />
                <span>{r.apellido}</span>
                <span>{r.nombre}</span>
                <span>{r.numeroHabitacion}</span>
                <span>{formatTipoHabitacion(r.tipoHabitacion)}</span>
                <span>{r.fechaInicio}</span>
                <span>{r.fechaFin}</span>
              </div>
            ))}
          </div>
          <div className="actions-row right-align">
            <button className="btn btn-secondary" type="button" onClick={() => { setSeleccionadas([]); setReservas([]); setBusquedaHecha(false); }}>
              Limpiar
            </button>
            <button className="btn btn-primary" type="button" onClick={handleAceptar} disabled={cancelando}>
              {cancelando ? "Procesando..." : "Aceptar"}
            </button>
          </div>
        </section>
      )}
      </div>

      <Modal
        open={!!errorModal}
        title="ERROR"
        variant="danger"
        onClose={() => setErrorModal(null)}
        actions={<button className="btn btn-primary" type="button" onClick={() => setErrorModal(null)}>Cerrar</button>}
      >
        <p>{errorModal}</p>
      </Modal>

      <Modal
        open={!!infoModal}
        title="AVISO"
        variant="info"
        onClose={() => setInfoModal(null)}
        actions={<button className="btn btn-primary" type="button" onClick={() => setInfoModal(null)}>Aceptar</button>}
      >
        <p>{infoModal}</p>
      </Modal>

      <Modal
        open={confirmarModal}
        title="CONFIRMAR"
        variant="warning"
        onClose={() => setConfirmarModal(false)}
        actions={
          <>
            <button className="btn btn-secondary" type="button" onClick={() => setConfirmarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" type="button" onClick={confirmarCancelacion}>Aceptar</button>
          </>
        }
      >
        <p>¿Desea cancelar las reservas seleccionadas?</p>
      </Modal>

      <Modal
        open={exitoModal}
        title="CONFIRMACION"
        variant="success"
        onClose={() => { setExitoModal(false); reset(); }}
        actions={<button className="btn btn-primary" type="button" onClick={() => { setExitoModal(false); reset(); }}>Aceptar</button>}
      >
        <p>{mensajeExito || "Reservas canceladas."}</p>
      </Modal>
    </div>
  );
};

export default CancelarReservaPage;

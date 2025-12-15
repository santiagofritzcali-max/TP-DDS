import React, { useMemo, useState } from "react";
import "../styles/facturacionStyle.css";
import "../styles/ui.css";
import "../styles/responsableStyle.css";
import { listarFacturasPendientes, registrarPago } from "../services/pagosService";
import Modal from "../components/Modal";

const tipoMedioOptions = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA_DEBITO", label: "Tarjeta Debito" },
  { value: "TARJETA_CREDITO", label: "Tarjeta Credito" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "MONEDA_EXTRANJERA", label: "Moneda Extranjera" },
];

const medioInicial = {
  tipo: "EFECTIVO",
  monto: "",
  tipoMoneda: "",
  cotizacion: "",
  nombre: "",
  apellido: "",
  codigo: "",
  nroTarjeta: "",
  fechaVencimiento: "",
  cuotas: "",
  nroCheque: "",
  nombrePropietario: "",
  banco: "",
  plazo: "",
  fechaCobro: "",
};

const isLetters = (val) => !!val && /^[A-Za-z\s]+$/.test(val.trim());
const isDigits = (val) => !!val && /^[0-9]+$/.test(val.trim());
const isPositiveNumber = (val) => {
  if (val === null || val === undefined) return false;
  const num = parseFloat(val);
  return !isNaN(num) && num > 0;
};

const IngresarPagoPage = () => {
  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [errorHabitacion, setErrorHabitacion] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const [seleccionFactura, setSeleccionFactura] = useState(null);
  const [medioForm, setMedioForm] = useState(medioInicial);
  const [medios, setMedios] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [errorsMedio, setErrorsMedio] = useState({});

  const totalFactura = seleccionFactura?.total || 0;

  const acumulado = useMemo(
    () => medios.reduce((acc, m) => acc + (parseFloat(m.monto) || 0), 0),
    [medios]
  );

  const faltante = Math.max(0, totalFactura - acumulado);
  const vuelto = acumulado > totalFactura ? acumulado - totalFactura : 0;

  const handleBuscar = async () => {
    setErrorModal(null);
    setErrorHabitacion(null);

    const habValue = numeroHabitacion?.toString().trim() || "";

    if (!habValue) {
      setErrorHabitacion("El campo Numero de habitacion es requerido.");
      return;
    }

    if (!/^[0-9]+$/.test(habValue)) {
      setErrorHabitacion("El campo Numero de habitacion debe ser numerico entero y mayor a 0.");
      return;
    }

    const nro = parseInt(habValue, 10);
    if (isNaN(nro) || nro <= 0) {
      setErrorHabitacion("El campo Numero de habitacion debe ser numerico y mayor a 0.");
      return;
    }

    const nroHabitacionBase = nro;
    setBuscando(true);
    const { ok, data, error } = await listarFacturasPendientes(nroHabitacionBase);
    setBuscando(false);
    if (!ok) {
      setErrorModal(error || "No se pudo obtener facturas pendientes.");
      return;
    }
    setPendientes(data || []);
    setSeleccionFactura(null);
    setMedios([]);
  };

  const handleAgregarMedio = () => {
    const errores = {};
    const montoVal = medioForm.monto?.toString().trim();
    if (!montoVal) {
      errores.monto = "El campo Monto es requerido.";
    } else if (!isPositiveNumber(montoVal)) {
      errores.monto = "El campo Monto debe ser numerico y mayor a 0.";
    }
    switch (medioForm.tipo) {
      case "MONEDA_EXTRANJERA":
        if (!medioForm.tipoMoneda?.toString().trim()) {
          errores.tipoMoneda = "El campo Tipo de moneda es requerido.";
        }
        if (!medioForm.cotizacion?.toString().trim()) {
          errores.cotizacion = "El campo Cotizacion es requerido.";
        } else if (!isPositiveNumber(medioForm.cotizacion)) {
          errores.cotizacion = "El campo Cotizacion debe ser numerico y mayor a 0.";
        }
        break;
      case "CHEQUE":
        if (!medioForm.nroCheque?.toString().trim()) {
          errores.nroCheque = "El campo Nro Cheque es requerido.";
        } else if (!isDigits(medioForm.nroCheque)) {
          errores.nroCheque = "El campo Nro Cheque debe ser numerico.";
        }
        if (!medioForm.nombrePropietario?.toString().trim()) {
          errores.nombrePropietario = "El campo Nombre propietario es requerido.";
        } else if (!isLetters(medioForm.nombrePropietario)) {
          errores.nombrePropietario = "El campo Nombre propietario solo acepta letras.";
        }
        if (!medioForm.banco?.toString().trim()) {
          errores.banco = "El campo Banco es requerido.";
        }
        if (!medioForm.plazo?.toString().trim()) {
          errores.plazo = "El campo Plazo es requerido.";
        }
        if (!medioForm.fechaCobro?.toString().trim()) {
          errores.fechaCobro = "El campo Fecha cobro es requerido.";
        }
        break;
      case "TARJETA_DEBITO":
      case "TARJETA_CREDITO":
        if (!medioForm.nombre?.toString().trim()) {
          errores.nombre = "El campo Nombre es requerido.";
        } else if (!isLetters(medioForm.nombre)) {
          errores.nombre = "El campo Nombre solo acepta letras.";
        }
        if (!medioForm.apellido?.toString().trim()) {
          errores.apellido = "El campo Apellido es requerido.";
        } else if (!isLetters(medioForm.apellido)) {
          errores.apellido = "El campo Apellido solo acepta letras.";
        }
        if (!medioForm.codigo?.toString().trim()) {
          errores.codigo = "El campo Codigo es requerido.";
        } else if (!isDigits(medioForm.codigo)) {
          errores.codigo = "El campo Codigo debe ser numerico.";
        }
        if (!medioForm.nroTarjeta?.toString().trim()) {
          errores.nroTarjeta = "El campo Nro Tarjeta es requerido.";
        } else if (!isDigits(medioForm.nroTarjeta)) {
          errores.nroTarjeta = "El campo Nro Tarjeta debe ser numerico.";
        }
        if (!medioForm.fechaVencimiento?.toString().trim()) {
          errores.fechaVencimiento = "El campo Fecha vencimiento es requerido.";
        }
        if (medioForm.tipo === "TARJETA_CREDITO") {
          if (!medioForm.cuotas?.toString().trim()) {
            errores.cuotas = "El campo Cuotas es requerido.";
          } else if (!isDigits(medioForm.cuotas) || parseInt(medioForm.cuotas, 10) <= 0) {
            errores.cuotas = "El campo Cuotas debe ser numerico y mayor a 0.";
          }
        }
        break;
      default:
        break;
    }
    if (Object.keys(errores).length > 0) {
      setErrorsMedio(errores);
      return;
    }
    setErrorsMedio({});
    const medioAGuardar = { ...medioForm };
    setMedios((prev) => [...prev, medioAGuardar]);
    setMedioForm({ ...medioInicial, tipo: medioForm.tipo });
    setErrorsMedio({});
  };

  const handleRegistrarPago = async () => {
    if (!seleccionFactura) {
      setErrorModal("Seleccione una factura pendiente.");
      return;
    }
    if (medios.length === 0) {
      setErrorModal("Agregue al menos un medio de pago.");
      return;
    }
    if (acumulado < totalFactura) {
      setErrorModal("El monto total cargado es menor al total de la factura.");
      return;
    }
    const payload = {
      facturaId: seleccionFactura.facturaId,
      medios: medios.map((m) => ({
        tipo: m.tipo,
        monto: m.monto ? parseFloat(m.monto) : null,
        tipoMoneda: m.tipo === "MONEDA_EXTRANJERA" ? m.tipoMoneda || null : null,
        cotizacion: m.tipo === "MONEDA_EXTRANJERA" && m.cotizacion ? parseFloat(m.cotizacion) : null,
        nombre: m.tipo.startsWith("TARJETA") ? m.nombre || null : null,
        apellido: m.tipo.startsWith("TARJETA") ? m.apellido || null : null,
        codigo: m.tipo.startsWith("TARJETA") && m.codigo ? parseInt(m.codigo, 10) : null,
        nroTarjeta: m.tipo.startsWith("TARJETA") ? m.nroTarjeta || null : null,
        fechaVencimiento: m.tipo.startsWith("TARJETA") ? m.fechaVencimiento || null : null,
        cuotas: m.tipo === "TARJETA_CREDITO" && m.cuotas ? parseInt(m.cuotas, 10) : null,
        nroCheque: m.tipo === "CHEQUE" ? m.nroCheque || null : null,
        nombrePropietario: m.tipo === "CHEQUE" ? m.nombrePropietario || null : null,
        banco: m.tipo === "CHEQUE" ? m.banco || null : null,
        plazo: m.tipo === "CHEQUE" ? m.plazo || null : null,
        fechaCobro: m.tipo === "CHEQUE" ? m.fechaCobro || null : null,
      })),
    };

    setEnviando(true);
    const { ok, data, error } = await registrarPago(payload);
    setEnviando(false);
    if (!ok) {
      setErrorModal(error || "No se pudo registrar el pago.");
      return;
    }
    setSuccessModal(
      `Factura ${data.numeroFactura || data.facturaId} pagada. Vuelto: $${(data.vuelto || 0).toFixed(2)}`
    );
    setMedios([]);
    setPendientes((prev) => prev.filter((f) => f.facturaId !== seleccionFactura.facturaId));
    setSeleccionFactura(null);
  };

  const renderCamposMedio = () => {
    switch (medioForm.tipo) {
      case "TARJETA_DEBITO":
      case "TARJETA_CREDITO":
        return (
            <>
              <label className="field-label">
                <span>
                  Nombre <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.nombre}
                  onChange={(e) => setMedioForm({ ...medioForm, nombre: e.target.value })}
                  style={errorsMedio.nombre ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.nombre && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.nombre}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Apellido <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.apellido}
                  onChange={(e) => setMedioForm({ ...medioForm, apellido: e.target.value })}
                  style={errorsMedio.apellido ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.apellido && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.apellido}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Codigo <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  type="number"
                  value={medioForm.codigo}
                  onChange={(e) => setMedioForm({ ...medioForm, codigo: e.target.value })}
                  style={errorsMedio.codigo ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.codigo && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.codigo}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Nro Tarjeta <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.nroTarjeta}
                  onChange={(e) => setMedioForm({ ...medioForm, nroTarjeta: e.target.value })}
                  style={errorsMedio.nroTarjeta ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.nroTarjeta && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.nroTarjeta}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Fecha vencimiento <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  type="date"
                  value={medioForm.fechaVencimiento}
                  onChange={(e) => setMedioForm({ ...medioForm, fechaVencimiento: e.target.value })}
                  style={errorsMedio.fechaVencimiento ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.fechaVencimiento && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.fechaVencimiento}
                  </div>
                )}
              </label>
              {medioForm.tipo === "TARJETA_CREDITO" && (
                <label className="field-label">
                  <span>
                    Cuotas <span style={{ color: "#c62828" }}>*</span>
                  </span>
                  <input
                    type="number"
                    value={medioForm.cuotas}
                    onChange={(e) => setMedioForm({ ...medioForm, cuotas: e.target.value })}
                    style={errorsMedio.cuotas ? { borderColor: "#c62828" } : undefined}
                  />
                  {errorsMedio.cuotas && (
                    <div className="error-inline" style={{ marginTop: "4px" }}>
                      {errorsMedio.cuotas}
                    </div>
                  )}
                </label>
              )}
            </>
          );
        case "CHEQUE":
          return (
            <>
              <label className="field-label">
                <span>
                  Nro Cheque <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.nroCheque}
                  onChange={(e) => setMedioForm({ ...medioForm, nroCheque: e.target.value })}
                  style={errorsMedio.nroCheque ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.nroCheque && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.nroCheque}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Nombre propietario <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.nombrePropietario}
                  onChange={(e) => setMedioForm({ ...medioForm, nombrePropietario: e.target.value })}
                  style={errorsMedio.nombrePropietario ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.nombrePropietario && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.nombrePropietario}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Banco <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.banco}
                  onChange={(e) => setMedioForm({ ...medioForm, banco: e.target.value })}
                  style={errorsMedio.banco ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.banco && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.banco}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Plazo <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.plazo}
                  onChange={(e) => setMedioForm({ ...medioForm, plazo: e.target.value })}
                  style={errorsMedio.plazo ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.plazo && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.plazo}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Fecha cobro <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  type="date"
                  value={medioForm.fechaCobro}
                  onChange={(e) => setMedioForm({ ...medioForm, fechaCobro: e.target.value })}
                  style={errorsMedio.fechaCobro ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.fechaCobro && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.fechaCobro}
                  </div>
                )}
              </label>
            </>
          );
        case "MONEDA_EXTRANJERA":
          return (
            <>
              <label className="field-label">
                <span>
                  Tipo de moneda <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  value={medioForm.tipoMoneda}
                  onChange={(e) => setMedioForm({ ...medioForm, tipoMoneda: e.target.value })}
                  style={errorsMedio.tipoMoneda ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.tipoMoneda && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.tipoMoneda}
                  </div>
                )}
              </label>
              <label className="field-label">
                <span>
                  Cotizacion <span style={{ color: "#c62828" }}>*</span>
                </span>
                <input
                  type="number"
                  value={medioForm.cotizacion}
                  onChange={(e) => setMedioForm({ ...medioForm, cotizacion: e.target.value })}
                  style={errorsMedio.cotizacion ? { borderColor: "#c62828" } : undefined}
                />
                {errorsMedio.cotizacion && (
                  <div className="error-inline" style={{ marginTop: "4px" }}>
                    {errorsMedio.cotizacion}
                  </div>
                )}
              </label>
            </>
          );
        default:
          return null;
    }
  };

  return (
    <div className="factura-wrapper">
      <div className="factura-page">
        <section className="factura-panel left">
          <h2>Ingresar pago</h2>
          <label className="field-label">
            <span>
              Nro de habitacion <span style={{ color: "#c62828" }}>*</span>
            </span>
            <input
              type="number"
              value={numeroHabitacion}
              onChange={(e) => setNumeroHabitacion(e.target.value)}
              placeholder="Ej: 401"
              style={errorHabitacion ? { borderColor: "#c62828" } : undefined}
            />
          </label>
          {errorHabitacion && <div className="error-inline">{errorHabitacion}</div>}
          <div className="actions-row">
            <button className="btn btn-secondary" type="button" onClick={() => window.history.back()}>
              Volver
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleBuscar}
              disabled={buscando}
            >
              {buscando ? "Buscando..." : "Buscar pendientes"}
            </button>
          </div>

          <h3>Facturas pendientes</h3>
          {pendientes.length === 0 ? (
            <p className="muted small">No hay facturas pendientes para esta habitacion.</p>
          ) : (
            <ul className="lista-ocupantes">
              {pendientes.map((f) => (
                <li key={f.facturaId} className="ocupante-item">
                  <label className="radio-line">
                    <input
                      type="radio"
                      name="factura"
                      checked={seleccionFactura?.facturaId === f.facturaId}
                      onChange={() => setSeleccionFactura(f)}
                    />
                    <span>
                      Nro Factura: {f.numeroFactura} - Total: ${f.total?.toFixed(2) || f.total} - Resp. Pago:{" "}
                      {f.responsable}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="factura-panel right">
          <h2>Medios de pago</h2>

          {seleccionFactura ? (
            <>
              <p className="muted small">
                Factura Nro {seleccionFactura.numeroFactura} | Total ${totalFactura.toFixed(2)}
              </p>

              <div className="form-grid">
                <label className="field-label">
                  Medio
                  <select
                    value={medioForm.tipo}
                    onChange={(e) => {
                      setMedioForm({ ...medioForm, tipo: e.target.value });
                      setErrorsMedio({});
                    }}
                  >
                    {tipoMedioOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-label">
                  <span>
                    Monto <span style={{ color: "#c62828" }}>*</span>
                  </span>
                  <input
                    type="number"
                    value={medioForm.monto}
                    onChange={(e) => setMedioForm({ ...medioForm, monto: e.target.value })}
                    style={errorsMedio.monto ? { borderColor: "#c62828" } : undefined}
                  />
                  {errorsMedio.monto && (
                    <div className="error-inline" style={{ marginTop: "4px" }}>
                      {errorsMedio.monto}
                    </div>
                  )}
                </label>

                {renderCamposMedio()}
              </div>

              <div className="actions-row">
                <button className="btn btn-secondary" type="button" onClick={() => setMedios([])}>
                  Limpiar medios
                </button>
                <button className="btn btn-primary" type="button" onClick={handleAgregarMedio}>
                  Agregar medio
                </button>
              </div>

              <h4>Medios cargados</h4>
              {medios.length === 0 ? (
                <p className="muted small">Aun no agregaste medios.</p>
              ) : (
                <ul className="lista-ocupantes">
                  {medios.map((m, idx) => (
                    <li key={idx} className="ocupante-item">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong>{m.tipo}</strong> - ${parseFloat(m.monto || 0).toFixed(2)}
                        </div>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => setMedios((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="detalle-line">
                <span>Acumulado</span>
                <strong>${acumulado.toFixed(2)}</strong>
              </div>
              <div className="detalle-line">
                <span>Faltante</span>
                <strong>${faltante.toFixed(2)}</strong>
              </div>
              <div className="detalle-line">
                <span>Vuelto</span>
                <strong>${vuelto.toFixed(2)}</strong>
              </div>

              <div className="actions-row right-align">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleRegistrarPago}
                  disabled={enviando}
                >
                  {enviando ? "Registrando..." : "Registrar pago"}
                </button>
              </div>
            </>
          ) : (
            <p className="muted small">Selecciona una factura pendiente para cargar pagos.</p>
          )}
        </section>
      </div>

      <Modal
        open={!!errorModal}
        title="Error"
        variant="danger"
        onClose={() => setErrorModal(null)}
        actions={
          <button className="btn btn-primary" onClick={() => setErrorModal(null)} type="button">
            Cerrar
          </button>
        }
      >
        <p>{errorModal}</p>
      </Modal>

      <Modal
        open={!!successModal}
        title="Pago registrado"
        variant="success"
        onClose={() => setSuccessModal(null)}
        actions={
          <button className="btn btn-primary" onClick={() => setSuccessModal(null)} type="button">
            Aceptar
          </button>
        }
      >
        <p>{successModal}</p>
      </Modal>
    </div>
  );
};

export default IngresarPagoPage;

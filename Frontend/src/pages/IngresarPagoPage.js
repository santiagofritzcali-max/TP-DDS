import React, { useMemo, useState } from "react";
import "../styles/facturacionStyle.css";
import "../styles/ui.css";
import "../styles/responsableStyle.css";
import { listarFacturasPendientes, registrarPago } from "../services/pagosService";
import Modal from "../components/Modal";

const tipoMedioOptions = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA_DEBITO", label: "Tarjeta DÃ©bito" },
  { value: "TARJETA_CREDITO", label: "Tarjeta CrÃ©dito" },
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

const IngresarPagoPage = () => {
  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [pendientes, setPendientes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const [seleccionFactura, setSeleccionFactura] = useState(null);
  const [medioForm, setMedioForm] = useState(medioInicial);
  const [medios, setMedios] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const totalFactura = seleccionFactura?.total || 0;

  const acumulado = useMemo(
    () =>
      medios.reduce((acc, m) => acc + (parseFloat(m.monto) || 0), 0),
    [medios]
  );

  const faltante = Math.max(0, totalFactura - acumulado);
  const vuelto = acumulado > totalFactura ? acumulado - totalFactura : 0;

  const handleBuscar = async () => {
    setErrorModal(null);
    if (!numeroHabitacion) {
      setErrorModal("Ingrese un número de habitación.");
      return;
    }
    const nro = parseInt(numeroHabitacion, 10);
    const nroHabitacionBase = isNaN(nro) ? numeroHabitacion : (nro % 100 || nro);
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
    if (!medioForm.monto || parseFloat(medioForm.monto) <= 0) {
      setErrorModal("Ingrese un monto vÃ¡lido para el medio de pago.");
      return;
    }
    const medioAGuardar = { ...medioForm };
    setMedios((prev) => [...prev, medioAGuardar]);
    setMedioForm({ ...medioInicial, tipo: medioForm.tipo }); // conserva tipo seleccionado
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
              Nombre
              <input
                value={medioForm.nombre}
                onChange={(e) => setMedioForm({ ...medioForm, nombre: e.target.value })}
              />
            </label>
            <label className="field-label">
              Apellido
              <input
                value={medioForm.apellido}
                onChange={(e) => setMedioForm({ ...medioForm, apellido: e.target.value })}
              />
            </label>
            <label className="field-label">
              CÃ³digo
              <input
                type="number"
                value={medioForm.codigo}
                onChange={(e) => setMedioForm({ ...medioForm, codigo: e.target.value })}
              />
            </label>
            <label className="field-label">
              NÂº Tarjeta
              <input
                value={medioForm.nroTarjeta}
                onChange={(e) => setMedioForm({ ...medioForm, nroTarjeta: e.target.value })}
              />
            </label>
            <label className="field-label">
              Fecha vencimiento
              <input
                type="date"
                value={medioForm.fechaVencimiento}
                onChange={(e) => setMedioForm({ ...medioForm, fechaVencimiento: e.target.value })}
              />
            </label>
            {medioForm.tipo === "TARJETA_CREDITO" && (
              <label className="field-label">
                Cuotas
                <input
                  type="number"
                  value={medioForm.cuotas}
                  onChange={(e) => setMedioForm({ ...medioForm, cuotas: e.target.value })}
                />
              </label>
            )}
          </>
        );
      case "CHEQUE":
        return (
          <>
            <label className="field-label">
              NÂº Cheque
              <input
                value={medioForm.nroCheque}
                onChange={(e) => setMedioForm({ ...medioForm, nroCheque: e.target.value })}
              />
            </label>
            <label className="field-label">
              Nombre propietario
              <input
                value={medioForm.nombrePropietario}
                onChange={(e) => setMedioForm({ ...medioForm, nombrePropietario: e.target.value })}
              />
            </label>
            <label className="field-label">
              Banco
              <input
                value={medioForm.banco}
                onChange={(e) => setMedioForm({ ...medioForm, banco: e.target.value })}
              />
            </label>
            <label className="field-label">
              Plazo
              <input
                value={medioForm.plazo}
                onChange={(e) => setMedioForm({ ...medioForm, plazo: e.target.value })}
              />
            </label>
            <label className="field-label">
              Fecha cobro
              <input
                type="date"
                value={medioForm.fechaCobro}
                onChange={(e) => setMedioForm({ ...medioForm, fechaCobro: e.target.value })}
              />
            </label>
          </>
        );
      case "MONEDA_EXTRANJERA":
        return (
          <>
            <label className="field-label">
              Tipo de moneda
              <input
                value={medioForm.tipoMoneda}
                onChange={(e) => setMedioForm({ ...medioForm, tipoMoneda: e.target.value })}
              />
            </label>
            <label className="field-label">
              CotizaciÃ³n
              <input
                type="number"
                value={medioForm.cotizacion}
                onChange={(e) => setMedioForm({ ...medioForm, cotizacion: e.target.value })}
              />
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
            Nro de habitación
            <input
              type="number"
              value={numeroHabitacion}
              onChange={(e) => setNumeroHabitacion(e.target.value)}
              placeholder="Ej: 401"
            />
          </label>
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
            <p className="muted small">No hay facturas pendientes para esta habitación.</p>
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
                      NÂº {f.numeroFactura} - Total ${f.total?.toFixed(2) || f.total} - Resp.: {f.responsable}
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
                Factura NÂº {seleccionFactura.numeroFactura} | Total ${totalFactura.toFixed(2)}
              </p>

              <div className="form-grid">
                <label className="field-label">
                  Medio
                  <select
                    value={medioForm.tipo}
                    onChange={(e) => setMedioForm({ ...medioForm, tipo: e.target.value })}
                  >
                    {tipoMedioOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-label">
                  Monto
                  <input
                    type="number"
                    value={medioForm.monto}
                    onChange={(e) => setMedioForm({ ...medioForm, monto: e.target.value })}
                  />
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
                <p className="muted small">AÃºn no agregaste medios.</p>
              ) : (
                <ul className="lista-ocupantes">
                  {medios.map((m, idx) => (
                    <li key={idx} className="ocupante-item">
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "8px", alignItems: "center" }}>
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

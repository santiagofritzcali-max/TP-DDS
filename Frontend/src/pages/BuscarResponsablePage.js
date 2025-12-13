import React, { useState } from "react";
import "../styles/responsableStyle.css";
import "../styles/ui.css";
import { useNavigate } from "react-router-dom";
import { buscarResponsables } from "../services/responsablePagoService";
import Modal from "../components/Modal";

const BuscarResponsablePage = () => {
  const [razonSocial, setRazonSocial] = useState("");
  const [cuit, setCuit] = useState("");
  const [resultado, setResultado] = useState([]);
  const [seleccionId, setSeleccionId] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const navigate = useNavigate();

  const handleBuscar = async () => {
    const { ok, data, status } = await buscarResponsables({ razonSocial, cuit });
    if (!ok && status !== 204) {
      setErrorModal("No se pudo buscar responsables.");
      return;
    }
    const lista = data || [];
    setResultado(lista);
    setSeleccionId(null);
    if (status === 204 || lista.length === 0) {
      setErrorModal("No se encontraron responsables. Puede dar de alta uno nuevo.");
    }
  };

  const handleSiguiente = () => {
    if (!seleccionId) {
      navigate("/cu12");
      return;
    }
    navigate(`/cu13/${seleccionId}`);
  };

  return (
    <div className="responsable-wrapper">
      <section className="responsable-panel left">
        <h2>Buscar Responsable de Pago</h2>
        <label className="field-label">
          Razón social
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            placeholder="Razón social"
          />
        </label>

        <label className="field-label">
          CUIT
          <input
            type="text"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            placeholder="CUIT"
          />
        </label>

        <div className="actions-row">
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button className="btn btn-primary" type="button" onClick={handleBuscar}>
            Buscar
          </button>
        </div>
      </section>

      <section className="responsable-panel right">
        <div className="header-row">
          <h3>Resultados</h3>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/cu12")}>
            Alta nuevo
          </button>
        </div>

        {resultado.length === 0 ? (
          <p className="muted">No hay resultados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Razón social</th>
                <th>CUIT</th>
                <th>IVA</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r) => (
                <tr key={r.id}>
                  <td>
                    <input
                      type="radio"
                      name="resp"
                      checked={seleccionId === r.id}
                      onChange={() => setSeleccionId(r.id)}
                    />
                  </td>
                  <td>{r.razonSocial}</td>
                  <td>{r.cuit}</td>
                  <td>{r.posicionIVA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="actions-row right-align">
          <button className="btn btn-primary" type="button" onClick={handleSiguiente}>
            Siguiente
          </button>
        </div>
      </section>

      <Modal
        open={!!errorModal}
        title="Información"
        variant="warning"
        onClose={() => setErrorModal(null)}
      >
        <p>{errorModal}</p>
      </Modal>
    </div>
  );
};

export default BuscarResponsablePage;


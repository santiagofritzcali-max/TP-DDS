import { useState } from 'react';
import '../styles/busquedaHuesped.css';
import { buscarHuespedes } from '../services/huespedService';

const TIPO_DOC_OPCIONES = ['DNI', 'LE', 'LC', 'Pasaporte', 'Otro'];

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
  const [page, setPage] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = async () => {
    setCargando(true);
    setMensaje('');

    try {
      const data = await buscarHuespedes(form, 1);
      setHuespedes(data);
      setPage(1);
      setHuespedSeleccionado(null);
    } catch (e) {
      setMensaje('Error al realizar la búsqueda.');
    } finally {
      setCargando(false);
    }
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

                <div className="formGrid2">
                  <div className="formGroup">
                    <label className="label">Apellido</label>
                    <input name="apellido" value={form.apellido} onChange={handleChange} className="input" />
                  </div>

                  <div className="formGroup">
                    <label className="label">Nombre</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className="input" />
                  </div>

                  <div className="formGroup">
                    <label className="label">Tipo de Documento</label>
                    <select name="tipoDoc" value={form.tipoDoc} onChange={handleChange} className="input">
                      <option value="">Seleccionar</option>
                      {TIPO_DOC_OPCIONES.map(op => <option key={op}>{op}</option>)}
                    </select>
                  </div>

                  <div className="formGroup">
                    <label className="label">Número de Documento</label>
                    <input name="nroDoc" value={form.nroDoc} onChange={handleChange} className="input" />
                  </div>
                </div>
              </section>

              <button className="btnPrimary" onClick={handleBuscar} disabled={cargando}>
                {cargando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            <div className="resultsColumn">
              <div className="userList">
                {huespedes.map(h => (
                  <div key={h.nroDoc} className="userItem" onClick={() => setHuespedSeleccionado(h)}>
                    <div className="userRowLeft">
                      <img src="/data/logo-huesped.png" alt="Huésped" className="userIconImage" />
                      <div className="userText">
                        {h.apellido} - {h.nombre} - {h.nroDoc} ({h.tipoDoc})
                      </div>
                    </div>
                    <input type="radio" checked={huespedSeleccionado?.nroDoc === h.nroDoc} readOnly className="userRadio" />
                  </div>
                ))}
              </div>

              <button className="btnPrimary" disabled={!huespedSeleccionado}>
                Aceptar
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BusquedaHuespedPage;

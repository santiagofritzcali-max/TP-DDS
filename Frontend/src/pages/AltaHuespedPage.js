'use client';

import React, { useState, useEffect } from 'react';
import '../styles/altaHuespedStyle.css';
import { validarAltaHuesped } from '../validators/validarAltaHuesped';
import { crearHuesped } from '../services/huespedService';
//import ModalExito from '../components/modalExito';
//import { useSearchParams } from 'react-router-dom'; 
import { useNavigate, useSearchParams } from 'react-router-dom';

const TIPO_DOC_OPCIONES = ['DNI', 'LE', 'LC', 'Pasaporte', 'Otro'];
const POSICION_IVA_OPCIONES = [
  'ConsumidorFinal',
  'ResponsableInscripto',
  'Monotributista',
  'Exento',
  'NoCorresponde',
];

const initialForm = {
  apellido: '',
  nombre: '',
  tipoDoc: 'DNI',
  nroDoc: '',
  cuit: '',
  posicionIVA: 'ConsumidorFinal',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  ocupacion: '',
  nacionalidad: '',
  direccion: {
    calle: '',
    numero: '',
    departamento: '',
    piso: '',
    codigoPostal: '',
    localidad: '',
    provincia: '',
    pais: '',
    ciudad: '',
  },
};

const normalizeTipoDoc = (value) => {
  if (!value) return '';
  const upper = value.toUpperCase();
  if (upper === 'PASAPORTE') return 'PASAPORTE';
  if (upper === 'OTRO') return 'OTRO';
  if (['DNI', 'LE', 'LC'].includes(upper)) return upper;
  return value;
};

export default function AltaHuespedPage() {

  const [searchParams] = useSearchParams();
  const [nombreHuesped, setNombreHuesped] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [docDuplicado, setDocDuplicado] = useState(false);
  const [docDuplicadoMsg, setDocDuplicadoMsg] = useState('');
  const [modalExito, setModalExito] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nombre = searchParams.get('nombre') || '';
    const apellido = searchParams.get('apellido') || '';
    const nroDoc = searchParams.get('nroDoc') || '';
    const tipoDoc = normalizeTipoDoc(searchParams.get('tipoDoc'));

    if (!nombre && !apellido && !nroDoc && !tipoDoc) return;

    setForm((prev) => ({
      ...prev,
      nombre: nombre || prev.nombre,
      apellido: apellido || prev.apellido,
      nroDoc: nroDoc || prev.nroDoc,
      tipoDoc: tipoDoc || prev.tipoDoc,
    }));
  }, [searchParams]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('direccion.')) {
      const campo = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        direccion: {
          ...prev.direccion,
          [campo]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMensaje('');
  setDocDuplicado(false);
  setDocDuplicadoMsg('');

  const errs = validarAltaHuesped(form);
  setErrores(errs);
  if (Object.keys(errs).length > 0) return;

  setCargando(true);
  try {
    const { resp, data } = await crearHuesped(form);

    if (resp.status === 409) {
      setDocDuplicado(true);
      setDocDuplicadoMsg(
        (data && data.message) ||
          'Ya existe un huésped con ese tipo y número de documento.'
      );
      setCargando(false);
      return;
    }

    if (!resp.ok) {
      throw new Error((data && data.message) || 'Error al registrar huésped');
    }

    setNombreHuesped(`${data.nombre} ${data.apellido}`);
    setModalExito(true);
    setForm(initialForm);
    setErrores({});
  } catch (err) {
    setMensaje(err.message || 'Error desconocido al registrar el huésped.');
  } finally {
    setCargando(false);
  }
};

 const handleCancelar = () => {
  setShowCancelModal(true);
};

const handleConfirmCancel = () => {
  // limpia si querés
  setForm(initialForm);
  setErrores({});
  setMensaje('');
  // vuelve a la pantalla inicial
  navigate('/');
};

const handleCloseCancelModal = () => {
  setShowCancelModal(false);
};

  const handleAceptarIgualmente = async () => {
  const errs = validarAltaHuesped(form); // misma validación centralizada
  setErrores(errs);
  if (Object.keys(errs).length > 0) {
    setDocDuplicado(false);
    return;
  }

  setCargando(true);
  setMensaje('');

  try {
    const { resp, data } = await crearHuesped(form, { aceptarDuplicado: true });

    if (!resp.ok) {
      throw new Error((data && data.message) || 'Error al registrar huésped');
    }

    if (data && data.nombre && data.apellido) {
      setNombreHuesped(`${data.nombre} ${data.apellido}`);
      setModalExito(true);
    } else {
      setMensaje('Huésped registrado, pero no se encontraron datos completos.');
    }

    setForm(initialForm);
    setErrores({});
    setDocDuplicado(false);
    setDocDuplicadoMsg('');
  } catch (err) {
    setMensaje(err.message || 'Error desconocido al registrar el huésped.');
  } finally {
    setCargando(false);
  }
};

const handleConfirm = () => {
  setModalExito(false); // Cierra el modal
  // Lógica para continuar con la carga de otro huésped, reseteando el formulario si es necesario
  setForm(initialForm);
};

const handleClose = () => {
  setModalExito(false); 
};

 const classInput = (hasError) => (hasError ? 'input inputError' : 'input');

  return (
  <div className="appRoot">
   {/* Modal Éxito integrado directamente */}
    {modalExito && (
      <div className="modalOverlay">
        <div className="modalSuccess">
          
          <div className="modalTitleSuccess">
            Alta de huésped exitosa
          </div>

          <div className="modalBodySuccess">
            <p>
              El huésped <strong>{nombreHuesped}</strong> ha sido creado satisfactoriamente.
              ¿Desea cargar otro?
            </p>
          </div>

          <div className="modalButtonsSuccess">
            <button 
              className="btnSecondary" 
              onClick={handleClose}
            >
              No
            </button>

            <button 
              className="btnPrimary" 
              onClick={handleConfirm}
            >
              Sí
            </button>
          </div>

        </div>
      </div>
    )}

   {showCancelModal && (
  <div className="modalOverlay">
    <div className="modalContent modalCancel">
      <div className="modalTitle modalCancelTitle">CANCELAR</div>
      <div className="modalBody modalCancelBody">
        <p>¿Desea cancelar el alta de Huésped?</p>
      </div>
      <div className="modalButtons modalCancelButtons">
        <button
          className="modalButtonBase modalButtonSecondary"
          onClick={handleCloseCancelModal}
        >
          No
        </button>
        <button
          className="modalButtonBase modalButtonPrimary"
          onClick={handleConfirmCancel}
        >
          Sí
        </button>
      </div>
    </div>
  </div>
)}




    {docDuplicado && (
      <div className="modalOverlay">
        <div className="modalContent">
          <div className="modalTitle">CUIDADO</div>
          <div className="modalBody">
            <strong>
              El tipo y número de documento ya existen en el sistema.
            </strong>
            {docDuplicadoMsg && (
              <>
                <br />
                <span>{docDuplicadoMsg}</span>
              </>
            )}
          </div>
          <div className="modalButtons">
            <button
              type="button"
              className="btnSecondary"
              onClick={() => setDocDuplicado(false)}
            >
              Corregir
            </button>
            <button
              type="button"
              className={`btnPrimary ${cargando ? 'btnPrimaryDisabled' : ''}`}
              onClick={handleAceptarIgualmente}
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : 'Aceptar igualmente'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CONTENIDO PRINCIPAL */}
    <main className="page">
      <h1 className="h1">Dar Alta de Huésped</h1>

      {mensaje && (
        <p
          className={`alert ${
            mensaje.startsWith('El huésped') ? 'alertSuccess' : 'alertError'
          }`}
        >
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="formMainGrid">
          {/* COLUMNA IZQUIERDA */}
          <div>
            {/* Información Personal */}
            <section className="formSection">
              <div className="formSectionTitle">Información Personal</div>
              <div className="formGrid2">
                {/* Nombre */}
                <div className="formGroup">
                  <label className="label">
                    Nombre
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={
                      errores.nombre ? 'input inputError' : 'input'
                    }
                  />
                  {errores.nombre && (
                    <div className="fieldError">{errores.nombre}</div>
                  )}
                </div>

                {/* Apellido */}
                <div className="formGroup">
                  <label className="label">
                    Apellido
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    className={
                      errores.apellido ? 'input inputError' : 'input'
                    }
                  />
                  {errores.apellido && (
                    <div className="fieldError">{errores.apellido}</div>
                  )}
                </div>

                {/* Tipo Doc */}
                <div className="formGroup">
                  <label className="label">
                    Tipo de Documento
                    <span className="labelRequired">*</span>
                  </label>
                  <select
                    name="tipoDoc"
                    value={form.tipoDoc}
                    onChange={handleChange}
                    className={
                      errores.tipoDoc ? 'input inputError' : 'input'
                    }
                  >
                    {TIPO_DOC_OPCIONES.map((op) => (
                      <option
                        key={op}
                        value={
                          op === 'Pasaporte'
                            ? 'PASAPORTE'
                            : op === 'Otro'
                            ? 'OTRO'
                            : op
                        }
                      >
                        {op}
                      </option>
                    ))}
                  </select>
                  {errores.tipoDoc && (
                    <div className="fieldError">{errores.tipoDoc}</div>
                  )}
                </div>

                {/* Nro Doc */}
                <div className="formGroup">
                  <label className="label">
                    Nro. de Documento
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="nroDoc"
                    value={form.nroDoc}
                    onChange={handleChange}
                    className={
                      errores.nroDoc ? 'input inputError' : 'input'
                    }
                  />
                  {errores.nroDoc && (
                    <div className="fieldError">{errores.nroDoc}</div>
                  )}
                </div>

                {/* CUIT */}
                <div className="formGroup">
                  <label className="label">CUIT</label>
                  <input
                    name="cuit"
                    value={form.cuit}
                    onChange={handleChange}
                    className={errores.cuit ? 'input inputError' : 'input'}
                  />
                  {errores.cuit && (
                    <div className="fieldError">{errores.cuit}</div>
                  )}
                </div>

                {/* Posición IVA */}
                <div className="formGroup">
                  <label className="label">
                    Posición frente al IVA
                    <span className="labelRequired">*</span>
                  </label>
                  <select
                    name="posicionIVA"
                    value={form.posicionIVA}
                    onChange={handleChange}
                    className={
                      errores.posicionIVA ? 'input inputError' : 'input'
                    }
                  >
                    {POSICION_IVA_OPCIONES.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  {errores.posicionIVA && (
                    <div className="fieldError">
                      {errores.posicionIVA}
                    </div>
                  )}
                </div>

                {/* Fecha de nacimiento */}
                <div className="formGroup">
                  <label className="label">
                    Fecha de nacimiento
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    className={
                      errores.fechaNacimiento
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores.fechaNacimiento && (
                    <div className="fieldError">
                      {errores.fechaNacimiento}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Dirección */}
            <section className="formSection">
              <div className="formSectionTitle">Dirección</div>
              <div className="formGrid2">
                {/* Calle */}
                <div className="formGroup">
                  <label className="label">
                    Calle
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.calle"
                    value={form.direccion.calle}
                    onChange={handleChange}
                    className={
                      errores['direccion.calle']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.calle'] && (
                    <div className="fieldError">
                      {errores['direccion.calle']}
                    </div>
                  )}
                </div>

                {/* Número */}
                <div className="formGroup">
                  <label className="label">
                    Número
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.numero"
                    value={form.direccion.numero}
                    onChange={handleChange}
                    className={
                      errores['direccion.numero']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.numero'] && (
                    <div className="fieldError">
                      {errores['direccion.numero']}
                    </div>
                  )}
                </div>

                {/* Departamento */}
                <div className="formGroup">
                  <label className="label">Departamento</label>
                  <input
                    name="direccion.departamento"
                    value={form.direccion.departamento}
                    onChange={handleChange}
                    className={
                      errores['direccion.departamento']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.departamento'] && (
                    <div className="fieldError">
                      {errores['direccion.departamento']}
                    </div>
                  )}
                </div>

                {/* Piso */}
                <div className="formGroup">
                  <label className="label">Piso</label>
                  <input
                    name="direccion.piso"
                    value={form.direccion.piso}
                    onChange={handleChange}
                    className={
                      errores['direccion.piso']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.piso'] && (
                    <div className="fieldError">
                      {errores['direccion.piso']}
                    </div>
                  )}
                </div>

                {/* Código Postal */}
                <div className="formGroup">
                  <label className="label">
                    Código Postal
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.codigoPostal"
                    value={form.direccion.codigoPostal}
                    onChange={handleChange}
                    className={
                      errores['direccion.codigoPostal']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.codigoPostal'] && (
                    <div className="fieldError">
                      {errores['direccion.codigoPostal']}
                    </div>
                  )}
                </div>

                {/* Localidad */}
                <div className="formGroup">
                  <label className="label">
                    Localidad
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.localidad"
                    value={form.direccion.localidad}
                    onChange={handleChange}
                    className={
                      errores['direccion.localidad']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.localidad'] && (
                    <div className="fieldError">
                      {errores['direccion.localidad']}
                    </div>
                  )}
                </div>

                {/* Provincia */}
                <div className="formGroup">
                  <label className="label">
                    Provincia
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.provincia"
                    value={form.direccion.provincia}
                    onChange={handleChange}
                    className={
                      errores['direccion.provincia']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.provincia'] && (
                    <div className="fieldError">
                      {errores['direccion.provincia']}
                    </div>
                  )}
                </div>

                {/* País */}
                <div className="formGroup">
                  <label className="label">
                    País
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.pais"
                    value={form.direccion.pais}
                    onChange={handleChange}
                    className={
                      errores['direccion.pais']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.pais'] && (
                    <div className="fieldError">
                      {errores['direccion.pais']}
                    </div>
                  )}
                </div>

                {/* Ciudad */}
                <div className="formGroup">
                  <label className="label">
                    Ciudad <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="direccion.ciudad"
                    value={form.direccion.ciudad}
                    onChange={handleChange}
                    className={
                      errores['direccion.ciudad']
                        ? 'input inputError'
                        : 'input'
                    }
                  />
                  {errores['direccion.ciudad'] && (
                    <div className="fieldError">
                      {errores['direccion.ciudad']}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div>
            {/* Contacto */}
            <section className="formSection">
              <div className="formSectionTitle">
                Información de Contacto
              </div>
              <div className="formGrid1">
                {/* Teléfono */}
                <div className="formGroup">
                  <label className="label">
                    Teléfono
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className={
                      errores.telefono ? 'input inputError' : 'input'
                    }
                  />
                  {errores.telefono && (
                    <div className="fieldError">{errores.telefono}</div>
                  )}
                </div>

                {/* Mail */}
                <div className="formGroup">
                  <label className="label">Mail</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={
                      errores.email ? 'input inputError' : 'input'
                    }
                  />
                  {errores.email && (
                    <div className="fieldError">{errores.email}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Información extra */}
            <section className="formSection">
              <div className="formSectionTitle">Información Extra</div>
              <div className="formGrid1">
                {/* Ocupación */}
                <div className="formGroup">
                  <label className="label">
                    Ocupación
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="ocupacion"
                    value={form.ocupacion}
                    onChange={handleChange}
                    className={
                      errores.ocupacion ? 'input inputError' : 'input'
                    }
                  />
                  {errores.ocupacion && (
                    <div className="fieldError">{errores.ocupacion}</div>
                  )}
                </div>

                {/* Nacionalidad */}
                <div className="formGroup">
                  <label className="label">
                    Nacionalidad
                    <span className="labelRequired">*</span>
                  </label>
                  <input
                    name="nacionalidad"
                    value={form.nacionalidad}
                    onChange={handleChange}
                    className={
                      errores.nacionalidad ? 'input inputError' : 'input'
                    }
                  />
                  {errores.nacionalidad && (
                    <div className="fieldError">
                      {errores.nacionalidad}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* BOTONES */}
        <div className="actions">
          <button
            type="button"
            className="btnSecondary"
            onClick={handleCancelar}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`btnPrimary ${
              cargando ? 'btnPrimaryDisabled' : ''
            }`}
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Siguiente'}
          </button>
        </div>

        <p className="hintObligatorios">
          Los campos marcados con (*) son obligatorios.
        </p>
      </form>
    </main>
  </div>
);

}

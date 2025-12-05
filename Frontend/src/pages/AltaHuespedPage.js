'use client';

import React, { useState } from 'react';
import '../styles/altaHuespedStyle.css';
import { validarAltaHuesped } from '../validators/validarAltaHuesped';
import { crearHuesped } from '../services/huespedService';
import ModalExito from '../components/modalExito';

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

export default function AltaHuespedPage() {
  const [nombreHuesped, setNombreHuesped] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [docDuplicado, setDocDuplicado] = useState(false);
  const [docDuplicadoMsg, setDocDuplicadoMsg] = useState('');
  const [modalExito, setModalExito] = useState(false);

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
        throw new Error(
          (data && data.message) || 'Error al registrar huésped'
        );
      }

      if (data && data.nombre && data.apellido) {
        setNombreHuesped(`${data.nombre} ${data.apellido}`);
        setModalExito(true);
      } else {
        setMensaje(
          'Huésped registrado, pero la respuesta no tiene nombre/apellido.'
        );
      }

      setForm(initialForm);
      setErrores({});
    } catch (err) {
      setMensaje(err.message || 'Error desconocido al registrar el huésped.');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = () => {
    if (window.confirm('¿Desea cancelar el alta del huésped?')) {
      setForm(initialForm);
      setErrores({});
      setMensaje('');
    }
  };

  const handleAceptarIgualmente = async () => {
    const errs = validarAltaHuesped(form);
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      setDocDuplicado(false);
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const { resp, data } = await crearHuesped(form, {
        aceptarDuplicado: true,
      });

      if (!resp.ok) {
        throw new Error(
          (data && data.message) || 'Error al registrar huésped'
        );
      }

      if (data && data.nombre && data.apellido) {
        setNombreHuesped(`${data.nombre} ${data.apellido}`);
        setModalExito(true);
      } else {
        setMensaje(
          'Huésped registrado, pero no se encontraron datos completos.'
        );
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
    setModalExito(false);
    setForm(initialForm);
  };

  const handleClose = () => {
    setModalExito(false);
  };

  const classInput = (hasError) =>
    `input${hasError ? ' inputError' : ''}`;

  return (
    <div className="appRoot">
      {/* Modal de éxito */}
      <ModalExito
        isOpen={modalExito}
        onClose={handleClose}
        onConfirm={handleConfirm}
        nombreHuesped={nombreHuesped}
      />

      {/* Modal documento duplicado */}
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
                className={`btnPrimary ${
                  cargando ? 'btnPrimaryDisabled' : ''
                }`}
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
              mensaje.startsWith('El huésped')
                ? 'alertSuccess'
                : 'alertError'
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
                      className={classInput(!!errores.nombre)}
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
                      className={classInput(!!errores.apellido)}
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
                      className={classInput(!!errores.tipoDoc)}
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
                      className={classInput(!!errores.nroDoc)}
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
                      className={classInput(!!errores.cuit)}
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
                      className={classInput(!!errores.posicionIVA)}
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
                      className={classInput(!!errores.fechaNacimiento)}
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
                      className={classInput(
                        !!errores['direccion.calle']
                      )}
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
                      className={classInput(
                        !!errores['direccion.numero']
                      )}
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
                      className={classInput(
                        !!errores['direccion.departamento']
                      )}
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
                      className={classInput(
                        !!errores['direccion.piso']
                      )}
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
                      className={classInput(
                        !!errores['direccion.codigoPostal']
                      )}
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
                      className={classInput(
                        !!errores['direccion.localidad']
                      )}
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
                      className={classInput(
                        !!errores['direccion.provincia']
                      )}
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
                      className={classInput(
                        !!errores['direccion.pais']
                      )}
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
                      Ciudad
                      <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="direccion.ciudad"
                      value={form.direccion.ciudad}
                      onChange={handleChange}
                      className={classInput(
                        !!errores['direccion.ciudad']
                      )}
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
                      className={classInput(!!errores.telefono)}
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
                      className={classInput(!!errores.email)}
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
                      className={classInput(!!errores.ocupacion)}
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
                      className={classInput(!!errores.nacionalidad)}
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

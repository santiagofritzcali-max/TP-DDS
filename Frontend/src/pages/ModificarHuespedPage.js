'use client';

import React, { useState, useEffect } from 'react';
import '../styles/altaHuespedStyle.css';
import '../styles/ui.css';
import Modal from '../components/Modal';
import { validarAltaHuesped } from '../validators/validarAltaHuesped';
import { actualizarHuesped, eliminarHuesped, puedeEliminarHuesped } from '../services/huespedService';
import { useNavigate, useLocation } from 'react-router-dom';
import { DOC_TYPES } from '../constants/docTypes';

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
    if (upper === 'PASAPORTE') return 'Pasaporte';
    if (upper === 'OTRO') return 'Otro';
    if (['DNI', 'LE', 'LC'].includes(upper)) return upper;
    return 'DNI';
};

export default function ModificarHuespedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const huespedDesdeBusqueda = location.state?.huesped;

  const [form, setForm] = useState(initialForm);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // para CU10 – doc duplicado
  const [docDuplicado, setDocDuplicado] = useState(false);
  const [docDuplicadoMsg, setDocDuplicadoMsg] = useState('');

  // modal de éxito (operación ha culminado con éxito)
  const [modalExito, setModalExito] = useState(false);
  const [nombreHuesped, setNombreHuesped] = useState('');

  // cancelar modificación
  const [showCancelModal, setShowCancelModal] = useState(false);

  // borrar (dispara CU11)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteResultModal, setShowDeleteResultModal] = useState(false);
  const [deleteResultMessage, setDeleteResultMessage] = useState('');
  const [deleteResultIsError, setDeleteResultIsError] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    // Si entran sin haber pasado por CU02, los mandamos de vuelta
    if (!huespedDesdeBusqueda) {
      navigate('/cu02'); // o la ruta de búsqueda que uses
      return;
    }

    // Pre-cargar el formulario con los datos del huésped
    setForm({
      apellido: huespedDesdeBusqueda.apellido ?? '',
      nombre: huespedDesdeBusqueda.nombre ?? '',
      tipoDoc: normalizeTipoDoc(huespedDesdeBusqueda.tipoDoc) || 'DNI',
      nroDoc: huespedDesdeBusqueda.nroDoc ?? '',
      cuit: huespedDesdeBusqueda.cuit ?? '',
      posicionIVA: huespedDesdeBusqueda.posicionIVA || 'ConsumidorFinal',
      fechaNacimiento: huespedDesdeBusqueda.fechaNacimiento ?? '',
      telefono: huespedDesdeBusqueda.telefono ?? '',
      email: huespedDesdeBusqueda.email ?? '',
      ocupacion: huespedDesdeBusqueda.ocupacion ?? '',
      nacionalidad: huespedDesdeBusqueda.nacionalidad ?? '',
      direccion: {
        calle: huespedDesdeBusqueda.direccion?.calle ?? '',
        numero: huespedDesdeBusqueda.direccion?.numero ?? '',
        departamento: huespedDesdeBusqueda.direccion?.departamento ?? '',
        piso: huespedDesdeBusqueda.direccion?.piso ?? '',
        codigoPostal: huespedDesdeBusqueda.direccion?.codigoPostal ?? '',
        localidad: huespedDesdeBusqueda.direccion?.localidad ?? '',
        provincia: huespedDesdeBusqueda.direccion?.provincia ?? '',
        pais: huespedDesdeBusqueda.direccion?.pais ?? '',
        ciudad: huespedDesdeBusqueda.direccion?.ciudad ?? '',
      },
    });

    setNombreHuesped(
      `${huespedDesdeBusqueda.nombre ?? ''} ${huespedDesdeBusqueda.apellido ?? ''}`.trim()
    );
  }, [huespedDesdeBusqueda, navigate]);

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

  // SIGUIENTE – guardar cambios
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
      const result = await actualizarHuesped(form, {
        original: {
          tipoDoc: huespedDesdeBusqueda.tipoDoc,
          nroDoc: huespedDesdeBusqueda.nroDoc,
        },
      });

      if (result.status === 409) {
        // tipo+nro doc duplicado
        setDocDuplicado(true);
        setDocDuplicadoMsg(
          (result.data && result.data.message) ||
            'Ya existe un huésped con ese tipo y número de documento.'
        );
        setCargando(false);
        return;
      }

      if (!result.ok) {
        throw new Error(
          (result.data && result.data.message) ||
            'Error al modificar datos del huésped.'
        );
      }

      const data = result.data || {};
      const nombreCompleto = `${data.nombre ?? form.nombre} ${data.apellido ?? form.apellido}`.trim();
      setNombreHuesped(nombreCompleto);
      setModalExito(true);
    } catch (err) {
      setMensaje(err.message || 'Error desconocido al modificar el huésped.');
    } finally {
      setCargando(false);
    }
  };

  // CANCELAR modificación
  const handleCancelar = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate('/'); // vuelve a home
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  // Éxito – operación culminada
  const handleCloseExito = () => {
    setModalExito(false);
    navigate('/'); // vuelve a home
  };

  // BORRAR – dispara CU11
  const handleBorrarClick = async () => {
    setMensaje('');
    try {
      await puedeEliminarHuesped(form.tipoDoc, form.nroDoc);
      setShowDeleteConfirmModal(true);
    } catch (error) {
      const baseMsg =
        error.message ||
        'El huésped no puede ser eliminado pues se ha alojado en el Hotel en alguna oportunidad.';
      const texto = baseMsg.toLowerCase().includes('presione cualquier tecla')
        ? baseMsg
        : `${baseMsg} Presione cualquier tecla para continuar.`;
      setDeleteResultMessage(texto);
      setDeleteResultIsError(true);
      setShowDeleteResultModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    setEliminando(true);
    setDeleteResultIsError(false);
    try {
      const msg = await eliminarHuesped(form.tipoDoc, form.nroDoc);
      const texto = (msg && msg.toLowerCase().includes('presione cualquier tecla'))
        ? msg
        : `${msg || 'Los datos del huésped han sido eliminados del sistema.'} Presione cualquier tecla para continuar.`;
      setDeleteResultMessage(texto);
      setDeleteResultIsError(false);
    } catch (error) {
      const baseMsg =
        error.message ||
        'No se pudo eliminar el huésped. Intente nuevamente.';
      const texto = baseMsg.toLowerCase().includes('presione cualquier tecla')
        ? baseMsg
        : `${baseMsg} Presione cualquier tecla para continuar.`;
      setDeleteResultMessage(texto);
      setDeleteResultIsError(true);
    } finally {
      setEliminando(false);
      setShowDeleteConfirmModal(false);
      setShowDeleteResultModal(true);
    }
  };

  const handleCloseDeleteResultModal = () => {
    setShowDeleteResultModal(false);
    // después de éxito o error, volvemos a home
    navigate('/');
  };

  // Permite cerrar el modal de resultado con cualquier tecla (CU11)
  useEffect(() => {
    if (!showDeleteResultModal) return;
    const onKeyDown = () => handleCloseDeleteResultModal();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showDeleteResultModal]);

  const classInput = (hasError) => (hasError ? 'input inputError' : 'input');

  return (
    <div className="appRoot">
      {/* Modal Éxito modificación */}
      <Modal
        open={modalExito}
        title="Modificación de huésped exitosa"
        variant="success"
        onClose={handleCloseExito}
        actions={
          <>
            <button
              className="btnPrimary"
              onClick={handleCloseExito}
              type="button"
            >
              Aceptar
            </button>
          </>
        }
      >
        <p>
          Los datos del huésped{' '}
          <strong>{nombreHuesped}</strong> han sido modificados
          satisfactoriamente.
        </p>
        <p>La operación ha culminado con éxito.</p>
      </Modal>

      {/* Modal cancelar modificación */}
      <Modal
        open={showCancelModal}
        title="CANCELAR"
        variant="success"
        onClose={handleCloseCancelModal}
        actions={
          <>
            <button
              className="btnSecondary"
              onClick={handleCloseCancelModal}
              type="button"
            >
              No
            </button>
            <button
              className="btnPrimary"
              onClick={handleConfirmCancel}
              type="button"
            >
              Sí
            </button>
          </>
        }
      >
        <p>¿Desea cancelar la modificación del huésped?</p>
      </Modal>

      {/* Modal documento duplicado */}
      <Modal
        open={docDuplicado}
        title="CUIDADO"
        variant="warning"
        onClose={() => setDocDuplicado(false)}
        actions={
          <>
            <button
              type="button"
              className="btnSecondary"
              onClick={() => setDocDuplicado(false)}
            >
              Aceptar
            </button>
          </>
        }
      >
        <strong>
          El tipo y número de documento ya existen en el sistema.
        </strong>
        {docDuplicadoMsg && (
          <>
            <br />
            <span>{docDuplicadoMsg}</span>
          </>
        )}
      </Modal>

      {/* Modal confirmación borrar (CU11) */}
      <Modal
        open={showDeleteConfirmModal}
        title="Eliminar huésped"
        variant="warning"
        onClose={() => setShowDeleteConfirmModal(false)}
        actions={
          <>
            <button
              className="btnSecondary"
              onClick={() => setShowDeleteConfirmModal(false)}
              type="button"
              disabled={eliminando}
            >
              Cancelar
            </button>
            <button
              className="btnPrimary"
              onClick={handleConfirmDelete}
              type="button"
              disabled={eliminando}
            >
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </>
        }
      >
        <p>
          Los datos del huésped{' '}
          <strong>
            {form.apellido} {form.nombre}, {form.tipoDoc} {form.nroDoc}
          </strong>{' '}
          serán eliminados del sistema.
        </p>
        <p>¿Desea continuar?</p>
      </Modal>

      {/* Modal resultado borrar */}
      <Modal
        open={showDeleteResultModal}
        title="Resultado de la operación"
        variant={deleteResultIsError ? 'danger' : 'success'}
        onClose={handleCloseDeleteResultModal}
        actions={<></>} // sin botones; se cierra con cualquier tecla
      >
        <p>
          {deleteResultMessage?.replace(/presione cualquier tecla.*/i, '').trim()}
        </p>
        {deleteResultMessage?.toLowerCase().includes('presione cualquier tecla') && (
          <p style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.02em' }}>
            PRESIONE CUALQUIER TECLA PARA CONTINUAR
          </p>
        )}
      </Modal>

      {/* CONTENIDO PRINCIPAL */}
      <main className="page">
        <h1 className="h1">Modificar Huésped</h1>

        {mensaje && (
          <p
            className={`alert ${
              mensaje.startsWith('Los datos') ? 'alertSuccess' : 'alertError'
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
                      Nombre <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className={classInput(errores.nombre)}
                    />
                    {errores.nombre && (
                      <div className="fieldError">{errores.nombre}</div>
                    )}
                  </div>

                  {/* Apellido */}
                  <div className="formGroup">
                    <label className="label">
                      Apellido <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      className={classInput(errores.apellido)}
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
                      className={classInput(errores.tipoDoc)}
                    >
                      {DOC_TYPES.map((op) => (
                        <option key={op} value={op}>
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
                      className={classInput(errores.nroDoc)}
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
                      className={classInput(errores.cuit)}
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
                      className={classInput(errores.posicionIVA)}
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
                      className={classInput(errores.fechaNacimiento)}
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
                      Calle <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="direccion.calle"
                      value={form.direccion.calle}
                      onChange={handleChange}
                      className={classInput(errores['direccion.calle'])}
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
                      Número <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="direccion.numero"
                      value={form.direccion.numero}
                      onChange={handleChange}
                      className={classInput(errores['direccion.numero'])}
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
                        errores['direccion.departamento']
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
                      className={classInput(errores['direccion.piso'])}
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
                        errores['direccion.codigoPostal']
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
                      Localidad <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="direccion.localidad"
                      value={form.direccion.localidad}
                      onChange={handleChange}
                      className={classInput(
                        errores['direccion.localidad']
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
                      Provincia <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="direccion.provincia"
                      value={form.direccion.provincia}
                      onChange={handleChange}
                      className={classInput(
                        errores['direccion.provincia']
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
                      País <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="direccion.pais"
                      value={form.direccion.pais}
                      onChange={handleChange}
                      className={classInput(errores['direccion.pais'])}
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
                      className={classInput(errores['direccion.ciudad'])}
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
                      Teléfono <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      className={classInput(errores.telefono)}
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
                      className={classInput(errores.email)}
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
                      Ocupación <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="ocupacion"
                      value={form.ocupacion}
                      onChange={handleChange}
                      className={classInput(errores.ocupacion)}
                    />
                    {errores.ocupacion && (
                      <div className="fieldError">{errores.ocupacion}</div>
                    )}
                  </div>

                  {/* Nacionalidad */}
                  <div className="formGroup">
                    <label className="label">
                      Nacionalidad <span className="labelRequired">*</span>
                    </label>
                    <input
                      name="nacionalidad"
                      value={form.nacionalidad}
                      onChange={handleChange}
                      className={classInput(errores.nacionalidad)}
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
              type="button"
              className="btnSecondary btnDanger"
              onClick={handleBorrarClick}
              disabled={eliminando}
            >
              Borrar
            </button>

            <button
              type="submit"
              className={`btnPrimary ${cargando ? 'btnPrimaryDisabled' : ''}`}
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

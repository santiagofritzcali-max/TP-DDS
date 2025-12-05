'use client';

import { useState } from 'react';

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

const styles = {
  appRoot: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#333',
  },
  topBar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '10px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  topBarMenuLink: {
    textDecoration: 'none',
    color: '#444',
    margin: '0 4px',
  },
  topBarSeparator: { color: '#ccc', margin: '0 2px' },
  btnSmallDark: {
    borderRadius: '20px',
    border: 'none',
    padding: '6px 18px',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  page: {
    maxWidth: '1100px',
    margin: '30px auto 40px',
    padding: '32px 40px 40px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  h1: { margin: 0, marginBottom: '24px', fontSize: '26px', fontWeight: 500 },
  alert: {
    padding: '10px 14px',
    borderRadius: '2px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertSuccess: {
    backgroundColor: '#e7f6e7',
    border: '1px solid #a3d7a3',
    color: '#256029',
  },
  alertError: {
    backgroundColor: '#fdecea',
    border: '1px solid #f5c2c0',
    color: '#b02a37',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
    modalContent: {
        backgroundColor: '#fff8d6',  
        padding: '20px 24px',
        borderRadius: 6,
        maxWidth: 420,
        width: '90%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        fontSize: 14,
        border: '2px solid #f6c343' 
},

modalTitle: {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 8,
  color: '#d39e00', 
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
},

modalBody: {
  marginBottom: 16,
  color: '#5a4a1f', 
  fontSize: 14,
},

 modalSuccess: {
    backgroundColor: '#e7f3ff',  
    border: '2px solid #007bff',  
    color: '#0056b3',  
    padding: '20px 24px',
    borderRadius: 6,
    maxWidth: 420,
    width: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    fontSize: 14,
  },

  modalTitleSuccess: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    color: '#007bff',  
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  modalBodySuccess: {
    marginBottom: 16,
    color: '#333',  
    fontSize: 14,
  },

  modalButtonsSuccess: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },

  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },

  formMainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr',
    columnGap: '40px',
    rowGap: '30px',
  },
  formSection: { marginBottom: '24px' },
  formSectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#777',
    borderBottom: '1px solid #ddd',
    paddingBottom: '6px',
    marginBottom: '16px',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: '14px 24px',
  },
  formGrid1: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr)',
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
  },
  label: { marginBottom: '4px', color: '#555' },
  labelRequired: { color: '#d9534f', marginLeft: '2px' },
  input: {
    padding: '8px 9px',
    borderRadius: '2px',
    border: '1px solid #ccc',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fff',
  },
  inputError: { border: '1px solid #d9534f', backgroundColor: '#fff7f7'},
  fieldError: { marginTop: '3px', fontSize: '11px', color: '#d9534f' },
  actions: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  btnPrimary: {
    minWidth: '120px',
    padding: '10px 18px',
    fontSize: '14px',
    borderRadius: '2px',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
  },
  btnPrimaryDisabled: { opacity: 0.6, cursor: 'default' },
  btnSecondary: {
    minWidth: '120px',
    padding: '10px 18px',
    fontSize: '14px',
    borderRadius: '2px',
    border: 'none',
    backgroundColor: '#e0e0e0',
    color: '#444',
    cursor: 'pointer',
  },
  hintObligatorios: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#777',
    textAlign: 'right',
  },
  logoImage: {
  height: 90,     
  width: 'auto',
},

};

const ModalExito = ({isOpen, onClose, onConfirm, nombreHuesped}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalSuccess}>
        <div style={styles.modalTitleSuccess}>Alta de huésped exitosa</div>
        <div style={styles.modalBodySuccess}>
          <p>El huésped {nombreHuesped} ha sido creado satisfactoriamente. ¿Desea cargar otro?</p>
        </div>
        <div style={styles.modalButtonsSuccess}>
          <button 
            style={styles.btnSecondary} 
            onClick={onClose}>
            No
          </button>
          <button 
            style={styles.btnPrimary} 
            onClick={onConfirm}>
            Sí
          </button>
        </div>
      </div>
    </div>
  );
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

  const validar = () => {
    const errs = {};
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
    const soloNumeros = /^[0-9]+$/;
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;

    // Datos personales
     
    //Apellido
    if (!form.apellido.trim()) {errs.apellido = 'El campo Apellido es requerido';}
    else if (!soloLetras.test(form.apellido)) {errs.apellido = "El apellido solo puede contener letras";}
    //Nombre
    if (!form.nombre.trim()) {errs.nombre = 'El campo Nombre es requerido';}
    else if (!soloLetras.test(form.nombre)) { errs.nombre = "El nombre solo puede contener letras";}
    //Tipo Documento
    if (!form.tipoDoc) {errs.tipoDoc = 'El campo Tipo de documento es requerido';}
    //Nro Documento
    if (!form.nroDoc.trim()) {errs.nroDoc = 'El campo Nro. de documento es requerido';}
    else if (!soloNumeros.test(form.nroDoc)) {errs.nroDoc = "El DNI debe contener solo números";}
    //Fecha
    if (!form.fechaNacimiento) {errs.fechaNacimiento = 'El campo Fecha de nacimiento es requerido';}
    // Posicion IVA
    if (!form.posicionIVA) {errs.posicionIVA = 'El campo Posición frente al IVA es requerido';}
    //Ocupacion
    if (!form.ocupacion.trim()) {errs.ocupacion = 'El campo Ocupación es requerido';}
    else if (!soloLetras.test(form.ocupacion)) {errs.ocupacion = "La ocupacion solo puede contener letras";}
    //Nacionalidad
    if (!form.nacionalidad.trim()) {errs.nacionalidad = 'El campo Nacionalidad es requerido';}
    else if (!soloLetras.test(form.nacionalidad)) {errs.nacionalidad = "La nacionalidad solo puede contener letras";}
    //CUIT  
    if (form.cuit.trim() && !/^\d{2}-\d{8}-\d{1}$/.test(form.cuit.trim())) {errs.cuit = "El CUIT no tiene un formato válido (XX-XXXXXXXX-X)";}

    // Contacto

    //Telefono
    if (!form.telefono.trim()) {errs.telefono = 'El campo Teléfono es requerido';}
    else if (!soloNumeros.test(form.telefono)) {errs.telefono = "El teléfono contiene caracteres inválidos";}
    //Email
      if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {errs.email = "El correo electrónico no tiene un formato válido";}

    
    // Dirección 

    //Calle
    if (!form.direccion.calle.trim()) {errs['direccion.calle'] = 'El campo Calle es requerido';}
    else if (!soloLetras.test(form.direccion.calle.trim())) {errs['direccion.calle'] = 'La calle solo puede contener letras';}
    //Numero
    if (!form.direccion.numero.trim()) {errs['direccion.numero'] = 'El campo Número es requerido';}
    else if (!soloNumeros.test(form.direccion.numero.trim())) {errs['direccion.numero'] = 'El número solo puede contener números';}
    //Localidad
    if (!form.direccion.localidad.trim()) {errs['direccion.localidad'] = 'El campo Localidad es requerido';}
    else if (!soloLetras.test(form.direccion.localidad.trim())) {errs['direccion.localidad'] = 'La localidad solo puede contener letras';}
    //Provincia
    if (!form.direccion.provincia.trim()) {errs['direccion.provincia'] = 'El campo Provincia es requerido';}
    else if (!soloLetras.test(form.direccion.provincia.trim())) {errs['direccion.provincia'] = 'La provincia solo puede contener letras';}
    //Pais
    if (!form.direccion.pais.trim()) {errs['direccion.pais'] = 'El campo País es requerido';}
    else if (!soloLetras.test(form.direccion.pais.trim())) {errs['direccion.pais'] = 'El país solo puede contener letras';}
    //Ciudad
    if (!form.direccion.ciudad.trim()) {errs['direccion.ciudad'] = 'El campo Ciudad es requerido';}
    else if (!soloLetras.test(form.direccion.ciudad)) {errs["direccion.ciudad"] = "La ciudad solo puede contener letras";}
    //CodigoPostal
    if (!form.direccion.codigoPostal.trim()) {errs['direccion.codigoPostal'] = 'El campo Código Postal es requerido';}
    else if (!/^[0-9]{4,5}$/.test(form.direccion.codigoPostal.trim())) {errs["direccion.codigoPostal"] = "El código postal debe ser numérico y tener entre 4 y 5 dígitos";} 
    //Piso
    if (form.direccion.piso.trim() && !/^[0-9]+$/.test(form.direccion.piso.trim())) {errs["direccion.piso"] = "El campo piso solo puede contener números";}
    //Departamento
    if (form.direccion.departamento.trim() && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(form.direccion.departamento.trim())) {errs["direccion.departamento"] = "El campo Departamento solo puede contener letras y espacios";}

    return errs;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMensaje('');
  setDocDuplicado(false);
  setDocDuplicadoMsg('');

  // Realizamos la validación en el frontend
  const errs = validar();
  setErrores(errs);

  // Si hay errores, no enviamos el formulario al backend
  if (Object.keys(errs).length > 0) return;

  setCargando(true);
  try {
    const resp = await fetch('http://localhost:8080/api/huespedes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    // Caso documento duplicado (409)
    if (resp.status === 409) {
      const data = await resp.json().catch(() => ({}));
      setDocDuplicado(true);
      setDocDuplicadoMsg(
        data.message ||
          'Ya existe un huésped con ese tipo y número de documento.'
      );
      setCargando(false);
      return; // NO seguimos, dejamos que corrija
    }

    // Otros errores
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || 'Error al registrar huésped');
    }

    // Caso de éxito
    const data = await resp.json();
    setNombreHuesped(`${data.nombre} ${data.apellido}`); // Aquí guardamos el nombre completo
    setModalExito(true); // Mostrar el modal de éxito
    setForm(initialForm); // Resetear el formulario
    setErrores({}); // Limpiar errores
  } catch (err) {
    setMensaje(err.message || "Error desconocido al registrar el huésped.");
  } finally {
    setCargando(false);
  }
};



  const handleCancelar = () => {
    if (confirm('¿Desea cancelar el alta del huésped?')) {
      setForm(initialForm);
      setErrores({});
      setMensaje('');
    }
  };

const handleAceptarIgualmente = async () => {
  // Por las dudas, revalidamos el formulario
  const errs = validar();
  setErrores(errs);
  if (Object.keys(errs).length > 0) {
    // Si hay errores, cierro el modal y dejo que el usuario corrija
    setDocDuplicado(false);
    return;
  }

  setCargando(true);
  setMensaje('');

  try {
    const resp = await fetch('http://localhost:8080/api/huespedes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        aceptarDuplicado: true, 
      }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || 'Error al registrar huésped');
    }

    const data = await resp.json();

    // Mostrar el modal de éxito con el nombre y apellido del huésped
    if (data && data.nombre && data.apellido) {
      // Actualizamos el nombre del huésped en el estado
      setNombreHuesped(`${data.nombre} ${data.apellido}`);
      setModalExito(true); // Mostrar el modal
    } else {
      setMensaje("Huésped registrado, pero no se encontraron datos completos.");
    }

    // Limpiar el formulario y los errores
    setForm(initialForm);
    setErrores({});
    setDocDuplicado(false);
    setDocDuplicadoMsg('');

  } catch (err) {
    setMensaje(err.message || "Error desconocido al registrar el huésped.");
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



  const inputBaseStyle = styles.input;

  const inputWithError = (hasError) =>
    hasError ? { ...inputBaseStyle, ...styles.inputError } : inputBaseStyle;

  return (
    <div style={styles.appRoot}>
      {/* Modal de "Alta Exitosa" */}
        <ModalExito 
          isOpen={modalExito} 
          onClose={handleClose} 
          onConfirm={handleConfirm} 
          nombreHuesped={nombreHuesped}
        />
      {/* BARRA SUPERIOR */}
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
            <img
                src="/logo-premier.png"    
                alt="Hotel Premier"
                style={styles.logoImage}
            />
            </div>
        <div style={styles.topBarRight}>
          <nav>
            <a href="#" style={styles.topBarMenuLink}>
              Inicio
            </a>
            <span style={styles.topBarSeparator}>|</span>
            <a href="#" style={styles.topBarMenuLink}>
              Reservas
            </a>
            <span style={styles.topBarSeparator}>|</span>
            <a href="#" style={styles.topBarMenuLink}>
              Ayuda
            </a>
          </nav>
          <button style={styles.btnSmallDark}>Conserje</button>
        </div>
      </header>

    {docDuplicado && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.modalTitle}>CUIDADO</div>
          <div style={styles.modalBody}>
            <strong>El tipo y número de documento ya existen en el sistema.</strong>
            {docDuplicadoMsg && (
              <>
                <br />
                <span>{docDuplicadoMsg}</span>
              </>
            )}
          </div>
          <div style={styles.modalButtons}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => setDocDuplicado(false)}
            >
              Corregir
            </button>
            <button
              type="button"
              style={styles.btnPrimary}
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
      <main style={styles.page}>
        <h1 style={styles.h1}>Dar Alta de Huésped</h1>


        {mensaje && (
          <p
            style={{
              ...styles.alert,
              ...(mensaje.startsWith('El huésped')
                ? styles.alertSuccess
                : styles.alertError),
            }}
          >
            {mensaje}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formMainGrid}>
            {/* COLUMNA IZQUIERDA */}
            <div>
              {/* Información Personal */}
              <section style={styles.formSection}>
                <div style={styles.formSectionTitle}>Información Personal</div>
                <div style={styles.formGrid2}>
                  {/* Nombre */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nombre
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      style={inputWithError(!!errores.nombre)}
                    />
                    {errores.nombre && (
                      <div style={styles.fieldError}>{errores.nombre}</div>
                    )}
                  </div>

                  {/* Apellido */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Apellido
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      style={inputWithError(!!errores.apellido)}
                    />
                    {errores.apellido && (
                      <div style={styles.fieldError}>{errores.apellido}</div>
                    )}
                  </div>

                  {/* Tipo Doc */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Tipo de Documento
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <select
                      name="tipoDoc"
                      value={form.tipoDoc}
                      onChange={handleChange}
                      style={inputWithError(!!errores.tipoDoc)}
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
                      <div style={styles.fieldError}>{errores.tipoDoc}</div>
                    )}
                  </div>

                  {/* Nro Doc */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nro. de Documento
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="nroDoc"
                      value={form.nroDoc}
                      onChange={handleChange}
                      style={inputWithError(!!errores.nroDoc)}
                    />
                    {errores.nroDoc && (
                      <div style={styles.fieldError}>{errores.nroDoc}</div>
                    )}
                  </div>

                  {/* CUIT */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>CUIT</label>
                    <input
                      name="cuit"
                      value={form.cuit}
                      onChange={handleChange}
                      style={inputWithError(!!errores.cuit)}
                    />
                    {errores.cuit && (
                      <div style={styles.fieldError}>{errores.cuit}</div>
                    )}
                  </div>

                  {/* Posición IVA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Posición frente al IVA
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <select
                      name="posicionIVA"
                      value={form.posicionIVA}
                      onChange={handleChange}
                      style={inputWithError(!!errores.posicionIVA)}
                    >
                      {POSICION_IVA_OPCIONES.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    {errores.posicionIVA && (
                      <div style={styles.fieldError}>
                        {errores.posicionIVA}
                      </div>
                    )}
                  </div>

                  {/* Fecha de nacimiento */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Fecha de nacimiento
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                      style={inputWithError(!!errores.fechaNacimiento)}
                    />
                    {errores.fechaNacimiento && (
                      <div style={styles.fieldError}>
                        {errores.fechaNacimiento}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Dirección */}
              <section style={styles.formSection}>
                <div style={styles.formSectionTitle}>Dirección</div>
                <div style={styles.formGrid2}>
                  {/* Calle */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Calle
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="direccion.calle"
                      value={form.direccion.calle}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.calle'])}
                    />
                    {errores['direccion.calle'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.calle']}
                      </div>
                    )}
                  </div>

                  {/* Número */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Número
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="direccion.numero"
                      value={form.direccion.numero}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.numero'])}
                    />
                    {errores['direccion.numero'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.numero']}
                      </div>
                    )}
                  </div>

                  {/* Departamento */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Departamento</label>
                    <input
                      name="direccion.departamento"
                      value={form.direccion.departamento}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.departamento'])}
                    />
                    {errores['direccion.departamento'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.departamento']}
                      </div>
                    )}
                  </div>

                  {/* Piso */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Piso</label>
                    <input
                      name="direccion.piso"
                      value={form.direccion.piso}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.piso'])}
                    />
                    {errores['direccion.piso'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.piso']}
                      </div>
                    )}
                  </div>

                  {/* Código Postal */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Código Postal
                      <span style={styles.labelRequired}>*</span>
                      </label>
                    <input
                      name="direccion.codigoPostal"
                      value={form.direccion.codigoPostal}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.codigoPostal'])}
                    />
                     {errores['direccion.codigoPostal'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.codigoPostal']}
                      </div>
                    )}
                  </div>

                  {/* Localidad */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Localidad
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="direccion.localidad"
                      value={form.direccion.localidad}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.localidad'])}
                    />
                    {errores['direccion.localidad'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.localidad']}
                      </div>
                    )}
                  </div>

                  {/* Provincia */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Provincia
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="direccion.provincia"
                      value={form.direccion.provincia}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.provincia'])}
                    />
                    {errores['direccion.provincia'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.provincia']}
                      </div>
                    )}
                  </div>

                  {/* País */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      País
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="direccion.pais"
                      value={form.direccion.pais}
                      onChange={handleChange}
                      style={inputWithError(!!errores['direccion.pais'])}
                    />
                    {errores['direccion.pais'] && (
                      <div style={styles.fieldError}>
                        {errores['direccion.pais']}
                      </div>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Ciudad <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                        name="direccion.ciudad"
                        value={form.direccion.ciudad}
                        onChange={handleChange}
                        style={inputWithError(!!errores['direccion.ciudad'])}
                    />
                    {errores['direccion.ciudad'] && (
                        <div style={styles.fieldError}>{errores['direccion.ciudad']}</div>
                    )}
                </div>
                
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}
            <div>
              {/* Contacto */}
              <section style={styles.formSection}>
                <div style={styles.formSectionTitle}>
                  Información de Contacto
                </div>
                <div style={styles.formGrid1}>
                  {/* Teléfono */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Teléfono
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      style={inputWithError(!!errores.telefono)}
                    />
                    {errores.telefono && (
                      <div style={styles.fieldError}>{errores.telefono}</div>
                    )}
                  </div>

                  {/* Mail (no obligatorio) */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mail</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      style={inputWithError(!!errores.email)}
                    />
                    {errores.email && (
                      <div style={styles.fieldError}>
                        {errores.email}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Información extra */}
              <section style={styles.formSection}>
                <div style={styles.formSectionTitle}>Información Extra</div>
                <div style={styles.formGrid1}>
                  {/* Ocupación */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Ocupación
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="ocupacion"
                      value={form.ocupacion}
                      onChange={handleChange}
                      style={inputWithError(!!errores.ocupacion)}
                    />
                    {errores.ocupacion && (
                      <div style={styles.fieldError}>{errores.ocupacion}</div>
                    )}
                  </div>

                  {/* Nacionalidad */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nacionalidad
                      <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      name="nacionalidad"
                      value={form.nacionalidad}
                      onChange={handleChange}
                      style={inputWithError(!!errores.nacionalidad)}
                    />
                    {errores.nacionalidad && (
                      <div style={styles.fieldError}>
                        {errores.nacionalidad}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* BOTONES */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={handleCancelar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                ...styles.btnPrimary,
                ...(cargando ? styles.btnPrimaryDisabled : {}),
              }}
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : 'Siguiente'}
            </button>
          </div>
          <p style={styles.hintObligatorios}>
            Los campos marcados con (*) son obligatorios.
          </p>
        </form>
      </main>
    </div>
  );
}

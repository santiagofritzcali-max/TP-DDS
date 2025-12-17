export const validarAltaHuesped = (form) => {
  const errs = {};
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/;
  const soloNumeros = /^[0-9]+$/;
  const letrasYNumeros = /^[A-Za-z0-9]+$/;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Datos personales
  const apellidoTrim = form.apellido.trim();
  if (!apellidoTrim) errs.apellido = "El campo Apellido es requerido";
  else if (!soloLetras.test(apellidoTrim)) errs.apellido = "El apellido solo puede contener letras";

  const nombreTrim = form.nombre.trim();
  if (!nombreTrim) errs.nombre = "El campo Nombre es requerido";
  else if (!soloLetras.test(nombreTrim)) errs.nombre = "El nombre solo puede contener letras";

  if (!form.tipoDoc) errs.tipoDoc = "El campo Tipo de documento es requerido";

  const nroDocTrim = form.nroDoc.trim();
  if (!nroDocTrim) errs.nroDoc = "El campo Nro. de documento es requerido";
  else {
    const tipo = (form.tipoDoc || '').toUpperCase();
    const esPasaporte = tipo === 'PASAPORTE';
    const regex = esPasaporte ? letrasYNumeros : soloNumeros;
    if (!regex.test(nroDocTrim)) {
      errs.nroDoc = esPasaporte
        ? "El pasaporte solo puede contener letras y números"
        : "El Nro. de documento debe contener solo números";
    }
  }

  if (!form.fechaNacimiento) {
    errs.fechaNacimiento = "El campo Fecha de nacimiento es requerido";
  } else {
    const fn = new Date(form.fechaNacimiento);
    if (Number.isNaN(fn.getTime())) {
      errs.fechaNacimiento = "El campo Fecha de nacimiento es inválido";
    } else {
      fn.setHours(0, 0, 0, 0);
      if (fn > hoy) errs.fechaNacimiento = "La fecha de nacimiento no puede ser posterior a hoy";
    }
  }

  if (!form.posicionIVA) errs.posicionIVA = "El campo Posición frente al IVA es requerido";

  const ocupacionTrim = form.ocupacion.trim();
  if (!ocupacionTrim) errs.ocupacion = "El campo Ocupación es requerido";
  else if (!soloLetras.test(ocupacionTrim)) errs.ocupacion = "La ocupación solo puede contener letras";

  const nacionalidadTrim = form.nacionalidad.trim();
  if (!nacionalidadTrim) errs.nacionalidad = "El campo Nacionalidad es requerido";
  else if (!soloLetras.test(nacionalidadTrim)) errs.nacionalidad = "La nacionalidad solo puede contener letras";

  const cuitTrim = form.cuit.trim();
  if (form.posicionIVA === "ResponsableInscripto" && !cuitTrim) {
    errs.cuit = "El CUIT es obligatorio para Responsable Inscripto";
  } else if (
    cuitTrim &&
    !(/^[0-9]{2}-[0-9]{8}-[0-9]{1}$/.test(cuitTrim) || /^[0-9]{11}$/.test(cuitTrim))
  ) {
    errs.cuit = "El CUIT no tiene un formato válido (XX-XXXXXXXX-X)";
  }

  // Contacto
  const telTrim = form.telefono.trim();
  if (!telTrim) errs.telefono = "El campo Teléfono es requerido";
  else {
    const telRegex = /^[0-9]{3,4}-?[0-9]+$/; // admite guion opcional después de 3/4 dígitos
    if (!telRegex.test(telTrim)) errs.telefono = "El teléfono contiene caracteres inválidos";
  }

  const emailTrim = form.email.trim();
  if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
    errs.email = "El correo electrónico no tiene un formato válido";
  }

  // Dirección
  const calleTrim = form.direccion.calle.trim();
  if (!calleTrim) errs["direccion.calle"] = "El campo Calle es requerido";
  else if (!soloLetras.test(calleTrim)) errs["direccion.calle"] = "La calle solo puede contener letras";

  const numeroTrim = form.direccion.numero.trim();
  if (!numeroTrim) errs["direccion.numero"] = "El campo Número es requerido";
  else if (!soloNumeros.test(numeroTrim)) errs["direccion.numero"] = "El número solo puede contener números";

  const localidadTrim = form.direccion.localidad.trim();
  if (!localidadTrim) errs["direccion.localidad"] = "El campo Localidad es requerido";
  else if (!soloLetras.test(localidadTrim)) errs["direccion.localidad"] = "La localidad solo puede contener letras";

  const provinciaTrim = form.direccion.provincia.trim();
  if (!provinciaTrim) errs["direccion.provincia"] = "El campo Provincia es requerido";
  else if (!soloLetras.test(provinciaTrim)) errs["direccion.provincia"] = "La provincia solo puede contener letras";

  const paisTrim = form.direccion.pais.trim();
  if (!paisTrim) errs["direccion.pais"] = "El campo País es requerido";
  else if (!soloLetras.test(paisTrim)) errs["direccion.pais"] = "El país solo puede contener letras";

  const ciudadTrim = form.direccion.ciudad.trim();
  if (!ciudadTrim) errs["direccion.ciudad"] = "El campo Ciudad es requerido";
  else if (!soloLetras.test(ciudadTrim)) errs["direccion.ciudad"] = "La ciudad solo puede contener letras";

  const cpTrim = form.direccion.codigoPostal.trim();
  if (!cpTrim) errs["direccion.codigoPostal"] = "El campo Código Postal es requerido";
  else if (!/^[0-9]{4,5}$/.test(cpTrim)) {
    errs["direccion.codigoPostal"] = "El código postal debe ser numérico y tener entre 4 y 5 dígitos";
  }

  const pisoTrim = form.direccion.piso.trim();
  if (pisoTrim && !/^[0-9]+$/.test(pisoTrim)) {
    errs["direccion.piso"] = "El campo piso solo puede contener números";
  }

  const deptoTrim = form.direccion.departamento.trim();
  if (deptoTrim && !soloLetras.test(deptoTrim)) {
    errs["direccion.departamento"] = "El campo Departamento solo puede contener letras y espacios";
  }

  return errs;
};

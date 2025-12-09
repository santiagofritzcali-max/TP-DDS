export const validarAltaHuesped = (form) => {
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

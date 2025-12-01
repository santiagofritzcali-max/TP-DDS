package ar.edu.utn.frsf.sistemahotelero.modelo;


public class Usuario {
    
    private final String nombreUsuario;
    private final String contrasenaUsuario;

    public Usuario(String nombreUsuario, String contrasenaUsuario) {
        this.nombreUsuario = nombreUsuario;
        this.contrasenaUsuario = contrasenaUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public String getContrasenaUsuario() {
        return contrasenaUsuario;
    }


}



package ar.edu.utn.frsf.sistemahotelero.config;

import ar.edu.utn.frsf.sistemahotelero.model.Usuario;
import ar.edu.utn.frsf.sistemahotelero.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {

    @Value("${app.auth.admin.user:admin}")
    private String adminUser;

    @Value("${app.auth.admin.pass:admin123}")
    private String adminPass;

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository usuarioRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.count() == 0) {
                Usuario admin = new Usuario(
                        adminUser,
                        passwordEncoder.encode(adminPass),
                        "CONSERJE",
                        true
                );
                usuarioRepository.save(admin);
            }
        };
    }
}

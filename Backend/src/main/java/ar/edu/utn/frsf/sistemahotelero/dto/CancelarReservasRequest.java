package ar.edu.utn.frsf.sistemahotelero.dto;

import java.util.List;
import lombok.Data;

// UI -----> BDD
@Data
public class CancelarReservasRequest {
    private List<Long> idsReservas;
}

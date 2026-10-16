package com.faculdade.localizacaointeligente.dto;

import lombok.Data;

@Data
public class PreferenciasDTO {
    private String regiao;
    private String lingua;
    private String clima;
    private String moeda;

    /** Número mínimo de habitantes (inclusive). Vazio = sem limite. */
    private Long populacaoMinima;

    /** Número máximo de habitantes (inclusive). Vazio = sem limite. */
    private Long populacaoMaxima;
}

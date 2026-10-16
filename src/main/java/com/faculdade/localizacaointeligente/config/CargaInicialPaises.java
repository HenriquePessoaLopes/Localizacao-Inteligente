package com.faculdade.localizacaointeligente.config;

import com.faculdade.localizacaointeligente.service.PaisService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Ao iniciar a aplicação, carrega no banco (H2 em memória) os países do arquivo
 * data/paises.json, para as buscas já funcionarem sem internet e sem precisar
 * clicar em "Atualizar Base".
 */
@Component
public class CargaInicialPaises implements ApplicationRunner {

    private final PaisService paisService;

    public CargaInicialPaises(PaisService paisService) {
        this.paisService = paisService;
    }

    @Override
    public void run(ApplicationArguments args) {
        paisService.atualizarBaseDePaises();
    }
}

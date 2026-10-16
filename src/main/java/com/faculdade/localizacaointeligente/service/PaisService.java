package com.faculdade.localizacaointeligente.service;

import com.faculdade.localizacaointeligente.dto.OpcoesDTO;
import com.faculdade.localizacaointeligente.dto.PreferenciasDTO;
import com.faculdade.localizacaointeligente.model.Pais;
import java.util.List;

public interface PaisService {
    List<Pais> buscarPaisesPorPreferencias(PreferenciasDTO preferencias);
    void atualizarBaseDePaises();

    /** Idiomas e moedas disponíveis para pesquisa, com o número de países de cada um. */
    OpcoesDTO listarOpcoes();
}

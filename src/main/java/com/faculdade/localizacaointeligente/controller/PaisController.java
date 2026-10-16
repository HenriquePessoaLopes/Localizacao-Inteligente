package com.faculdade.localizacaointeligente.controller;

import com.faculdade.localizacaointeligente.service.PaisService;
import com.faculdade.localizacaointeligente.dto.PreferenciasDTO;
import com.faculdade.localizacaointeligente.model.Pais;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Collections;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/paises")
@CrossOrigin(origins = "*")
public class PaisController {

    @Autowired
    private PaisService paisService;

    @PostMapping("/atualizar-base")
    public ResponseEntity<?> atualizarBaseDePaises() {
        try {
            log.info("Iniciando atualização da base de países");
            paisService.atualizarBaseDePaises();
            log.info("Base de países atualizada com sucesso");
            return ResponseEntity.ok("Base de países atualizada com sucesso");
        } catch (Exception e) {
            log.error("Erro ao atualizar base de países: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar base de países: " + e.getMessage());
        }
    }

    /** Idiomas e moedas disponíveis para pesquisa (com o número de países de cada um). */
    @GetMapping("/opcoes")
    public ResponseEntity<?> listarOpcoes() {
        try {
            return ResponseEntity.ok(paisService.listarOpcoes());
        } catch (Exception e) {
            log.error("Erro ao listar as opções de busca", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/buscar")
    public ResponseEntity<?> buscarPaisesPorPreferencias(@RequestBody PreferenciasDTO preferencias) {
        String erroDePopulacao = validarPopulacao(preferencias);
        if (erroDePopulacao != null) {
            log.warn("Busca recusada: {}", erroDePopulacao);
            return ResponseEntity.badRequest().body(Map.of("mensagem", erroDePopulacao));
        }

        try {
            log.info("Recebendo requisição de busca com preferências: {}", preferencias);
            List<Pais> paises = paisService.buscarPaisesPorPreferencias(preferencias);
            
            if (paises.isEmpty()) {
                log.info("Nenhum país encontrado para as preferências informadas");
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            log.info("Encontrados {} países", paises.size());
            return ResponseEntity.ok(paises);
        } catch (Exception e) {
            log.error("Erro ao buscar países", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /** Devolve a mensagem de erro se os limites de população forem inválidos, ou null se estiver tudo certo. */
    private String validarPopulacao(PreferenciasDTO preferencias) {
        Long minima = preferencias.getPopulacaoMinima();
        Long maxima = preferencias.getPopulacaoMaxima();
        if ((minima != null && minima < 0) || (maxima != null && maxima < 0)) {
            return "A população não pode ser negativa.";
        }
        if (minima != null && maxima != null && minima > maxima) {
            return "A população mínima não pode ser maior que a máxima.";
        }
        return null;
    }
}
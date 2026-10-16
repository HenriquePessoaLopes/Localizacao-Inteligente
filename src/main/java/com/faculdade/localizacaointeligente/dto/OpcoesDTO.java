package com.faculdade.localizacaointeligente.dto;

import java.util.List;

/**
 * Tudo o que dá para pesquisar: os idiomas e as moedas existentes nos dados, cada um com o
 * número de países que o usam. Alimenta a página "Sobre" e as sugestões dos campos de busca.
 */
public record OpcoesDTO(int totalPaises, List<Idioma> idiomas, List<Moeda> moedas) {

    /** Um idioma (nome em inglês, como nos dados) e quantos países o têm entre os seus idiomas. */
    public record Idioma(String nome, int quantidade) {
    }

    /** Uma moeda (código e nome em inglês) e quantos países a usam. */
    public record Moeda(String codigo, String nome, int quantidade) {
    }
}

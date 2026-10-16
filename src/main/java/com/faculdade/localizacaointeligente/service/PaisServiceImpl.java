package com.faculdade.localizacaointeligente.service;

import com.faculdade.localizacaointeligente.dto.OpcoesDTO;
import com.faculdade.localizacaointeligente.dto.PreferenciasDTO;
import com.faculdade.localizacaointeligente.model.Pais;
import com.faculdade.localizacaointeligente.repository.PaisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaisServiceImpl implements PaisService {

    /**
     * Arquivo com os dados fixos dos países, dentro de src/main/resources.
     * Usa o mesmo formato que a antiga API restcountries v3.1 devolvia
     * (name.common, region, languages e currencies).
     */
    static final String ARQUIVO_PAISES = "data/paises.json";

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PaisRepository paisRepository;

    @Override
    public void atualizarBaseDePaises() {
        try {
            log.info("Iniciando atualização da base de países");

            List<Pais> paises = Arrays.asList(lerPaisesDoArquivo());
            log.info("Lidos {} países do arquivo {}", paises.size(), ARQUIVO_PAISES);

            paises.forEach(pais -> {
                log.debug("Processando país: {}", pais.getNome());
                pais.processarDadosAPI();
            });

            paisRepository.deleteAll();
            paisRepository.saveAll(paises);
            log.info("Base atualizada com sucesso. Total de países: {}", paises.size());

        } catch (Exception e) {
            log.error("Erro ao atualizar base de países", e);
            throw new RuntimeException("Falha ao atualizar base de países: " + e.getMessage());
        }
    }

    /** Lê o arquivo de dados fixos (ainda sem passar por processarDadosAPI). */
    private Pais[] lerPaisesDoArquivo() throws IOException {
        try (InputStream arquivo = new ClassPathResource(ARQUIVO_PAISES).getInputStream()) {
            return objectMapper.readValue(arquivo, Pais[].class);
        }
    }

    @Override
    public OpcoesDTO listarOpcoes() {
        Pais[] paises;
        try {
            paises = lerPaisesDoArquivo();
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível ler o arquivo " + ARQUIVO_PAISES, e);
        }

        Map<String, Integer> paisesPorIdioma = new HashMap<>();
        Map<String, Integer> paisesPorMoeda = new HashMap<>();
        Map<String, String> nomeDaMoeda = new HashMap<>();

        for (Pais pais : paises) {
            if (pais.getLanguages() != null) {
                // distinct(): um idioma conta uma vez por país
                pais.getLanguages().values().stream().distinct()
                        .forEach(idioma -> paisesPorIdioma.merge(idioma, 1, Integer::sum));
            }
            if (pais.getCurrencies() != null) {
                pais.getCurrencies().forEach((codigo, detalhes) -> {
                    paisesPorMoeda.merge(codigo, 1, Integer::sum);
                    nomeDaMoeda.putIfAbsent(codigo, extrairNomeDaMoeda(codigo, detalhes));
                });
            }
        }

        List<OpcoesDTO.Idioma> idiomas = paisesPorIdioma.entrySet().stream()
                .map(e -> new OpcoesDTO.Idioma(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(OpcoesDTO.Idioma::nome, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        List<OpcoesDTO.Moeda> moedas = paisesPorMoeda.entrySet().stream()
                .map(e -> new OpcoesDTO.Moeda(e.getKey(), nomeDaMoeda.get(e.getKey()), e.getValue()))
                .sorted(Comparator.comparing(OpcoesDTO.Moeda::codigo))
                .collect(Collectors.toList());

        return new OpcoesDTO(paises.length, idiomas, moedas);
    }

    /** O nome da moeda vem em currencies.<codigo>.name; se não houver, usa o próprio código. */
    private String extrairNomeDaMoeda(String codigo, Object detalhes) {
        if (detalhes instanceof Map<?, ?> mapa && mapa.get("name") instanceof String nome && !nome.isBlank()) {
            return nome;
        }
        return codigo;
    }

    /** O país tem o idioma entre todos os seus idiomas? (parte do nome, sem diferenciar maiúsculas) */
    private boolean temIdioma(Pais pais, String procurado) {
        String idiomas = pais.getLinguas() != null ? pais.getLinguas() : pais.getLingua();
        return idiomas != null && idiomas.toLowerCase().contains(procurado.trim().toLowerCase());
    }

    /** O país usa a moeda (código exato, sem diferenciar maiúsculas) entre todas as suas moedas? */
    private boolean temMoeda(Pais pais, String codigo) {
        String moedas = pais.getMoedas() != null ? pais.getMoedas() : pais.getMoeda();
        return moedas != null && Arrays.stream(moedas.split(","))
                .anyMatch(moeda -> moeda.trim().equalsIgnoreCase(codigo.trim()));
    }

    @Override
    public List<Pais> buscarPaisesPorPreferencias(PreferenciasDTO preferencias) {
        List<Pais> todosPaises = paisRepository.findAll();
        log.info("Total de países na base: {}", todosPaises.size());
        log.info("Preferências recebidas: {}", preferencias);

        List<Pais> paisesFiltrados = todosPaises.stream()
                .filter(pais -> {
                    boolean match = true;

                    if (preferencias.getRegiao() != null && !preferencias.getRegiao().isEmpty()) {
                        match = pais.getRegiao() != null && 
                               pais.getRegiao().equalsIgnoreCase(preferencias.getRegiao());
                        log.debug("País: {}, Match região: {}", pais.getNome(), match);
                    }

                    if (match && preferencias.getLingua() != null && !preferencias.getLingua().isEmpty()) {
                        match = temIdioma(pais, preferencias.getLingua());
                        log.debug("País: {}, Match língua: {}", pais.getNome(), match);
                    }

                    if (match && preferencias.getClima() != null && !preferencias.getClima().isEmpty()) {
                        match = pais.getClima() != null && 
                               pais.getClima().equalsIgnoreCase(preferencias.getClima());
                        log.debug("País: {}, Match clima: {}", pais.getNome(), match);
                    }

                    if (match && preferencias.getMoeda() != null && !preferencias.getMoeda().isEmpty()) {
                        match = temMoeda(pais, preferencias.getMoeda());
                        log.debug("País: {}, Match moeda: {}", pais.getNome(), match);
                    }

                    // Países sem população publicada ficam de fora quando há limite de habitantes
                    if (match && preferencias.getPopulacaoMinima() != null) {
                        match = pais.getPopulacao() != null
                                && pais.getPopulacao() >= preferencias.getPopulacaoMinima();
                        log.debug("País: {}, Match população mínima: {}", pais.getNome(), match);
                    }

                    if (match && preferencias.getPopulacaoMaxima() != null) {
                        match = pais.getPopulacao() != null
                                && pais.getPopulacao() <= preferencias.getPopulacaoMaxima();
                        log.debug("País: {}, Match população máxima: {}", pais.getNome(), match);
                    }

                    return match;
                })
                .collect(Collectors.toList());

        log.info("Total de países encontrados após filtro: {}", paisesFiltrados.size());
        return paisesFiltrados;
    }
}
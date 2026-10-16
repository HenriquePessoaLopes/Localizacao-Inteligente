package com.faculdade.localizacaointeligente;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Testes de ponta a ponta: sobem a aplicação inteira (H2 em memória + carga inicial do arquivo
 * data/paises.json) e chamam a API HTTP do mesmo jeito que o front-end React faz.
 */
@SpringBootTest
@AutoConfigureMockMvc
class BuscaPaisesIntegrationTest {

    private static final String BUSCAR = "/api/paises/buscar";
    private static final String ATUALIZAR = "/api/paises/atualizar-base";
    private static final String OPCOES = "/api/paises/opcoes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ResultActions buscar(String preferenciasJson) throws Exception {
        // UTF-8 explícito: há idiomas com acento (ex.: "Cook Islands Māori"), como o navegador envia
        return mockMvc.perform(post(BUSCAR)
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding(StandardCharsets.UTF_8)
                .content(preferenciasJson.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void cargaInicialTrazOsPaisesDoArquivo() throws Exception {
        buscar("{}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(200)))
                .andExpect(jsonPath("$[*].nome", hasItems("Brazil", "Portugal", "Japan")));
    }

    @Test
    void filtraPorRegiaoSemDiferenciarMaiusculas() throws Exception {
        // o front envia a região em minúsculas ("europe"); o banco guarda "Europe"
        buscar("{\"regiao\":\"europe\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(30)))
                .andExpect(jsonPath("$[*].regiao", everyItem(is("Europe"))))
                .andExpect(jsonPath("$[*].nome", hasItems("Portugal", "France")))
                .andExpect(jsonPath("$[*].nome", not(hasItem("Brazil"))));
    }

    @Test
    void filtraPorClima() throws Exception {
        buscar("{\"clima\":\"Temperado\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].clima", everyItem(is("Temperado"))))
                .andExpect(jsonPath("$[*].nome", hasItem("Portugal")));
    }

    @Test
    void filtraPorIdioma() throws Exception {
        buscar("{\"lingua\":\"portuguese\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", hasItems("Brazil", "Portugal", "Angola", "Mozambique")))
                .andExpect(jsonPath("$[*].nome", not(hasItem("Japan"))));
    }

    @Test
    void filtraPorMoeda() throws Exception {
        buscar("{\"moeda\":\"EUR\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", hasItems("Portugal", "France", "Germany")))
                .andExpect(jsonPath("$[*].moedas", everyItem(containsString("EUR"))));
    }

    @Test
    void combinaVariosFiltros() throws Exception {
        buscar("{\"regiao\":\"americas\",\"lingua\":\"portuguese\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome", is("Brazil")))
                .andExpect(jsonPath("$[0].moeda", is("BRL")))
                .andExpect(jsonPath("$[0].lingua", is("Portuguese")));
    }

    @Test
    void buscaEmTodosOsIdiomasDoPaisNaoSoNoPrimeiro() throws Exception {
        // Latin é o 2º idioma do Vaticano (o 1º é Italian): só aparece se a busca olhar todos os idiomas
        buscar("{\"lingua\":\"latin\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome", is("Vatican City")))
                .andExpect(jsonPath("$[0].lingua", is("Italian")))
                .andExpect(jsonPath("$[0].linguas", is("Italian, Latin")));

        // Italian é o 3º idioma da Suíça
        buscar("{\"lingua\":\"italian\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", hasItems("Italy", "Switzerland", "San Marino", "Vatican City")));
    }

    @Test
    void buscaEmTodasAsMoedasDoPaisNaoSoNaPrimeira() throws Exception {
        // ZAR é a 8ª moeda do Zimbabwe (a 1ª é BWP)
        buscar("{\"moeda\":\"zar\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[*].nome", hasItems("South Africa", "Zimbabwe", "Lesotho", "Namibia", "Eswatini")))
                .andExpect(jsonPath("$[?(@.nome=='Zimbabwe')].moeda", contains("BWP")));
    }

    @Test
    void opcoesListamIdiomasEMoedasDisponiveis() throws Exception {
        mockMvc.perform(get(OPCOES))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPaises", is(250)))
                .andExpect(jsonPath("$.idiomas.length()", is(155)))
                .andExpect(jsonPath("$.moedas.length()", is(161)))
                .andExpect(jsonPath("$.idiomas[?(@.nome=='Latin')].quantidade", contains(1)))
                .andExpect(jsonPath("$.idiomas[?(@.nome=='Portuguese')].quantidade", contains(10)))
                .andExpect(jsonPath("$.moedas[?(@.codigo=='BRL')].nome", contains("Brazilian real")))
                .andExpect(jsonPath("$.moedas[?(@.codigo=='USD')].nome", contains("United States dollar")))
                .andExpect(jsonPath("$.moedas[?(@.codigo=='USD')].quantidade", contains(20)));
    }

    @Test
    void tudoQueAListaDeOpcoesMostraPodeSerPesquisado() throws Exception {
        String corpo = mockMvc.perform(get(OPCOES)).andExpect(status().isOk()).andReturn().getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
        JsonNode opcoes = objectMapper.readTree(corpo);

        for (JsonNode idioma : opcoes.get("idiomas")) {
            String nome = idioma.get("nome").asText();
            int encontrados = objectMapper.readTree(
                    buscar("{\"lingua\":\"" + nome + "\"}").andReturn().getResponse().getContentAsString()).size();
            // a busca é por "parte do nome" (German também acha Swiss German), então pode achar mais, nunca menos
            assertTrue(encontrados >= idioma.get("quantidade").asInt(), "Idioma não pesquisável: " + nome);
        }

        for (JsonNode moeda : opcoes.get("moedas")) {
            String codigo = moeda.get("codigo").asText();
            int encontrados = objectMapper.readTree(
                    buscar("{\"moeda\":\"" + codigo + "\"}").andReturn().getResponse().getContentAsString()).size();
            // a moeda é buscada pelo código exato: o número tem de bater
            assertEquals(moeda.get("quantidade").asInt(), encontrados, "Moeda com contagem diferente: " + codigo);
        }
    }

    @Test
    void respostaTrazAPopulacaoDoPais() throws Exception {
        buscar("{\"regiao\":\"americas\",\"lingua\":\"portuguese\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome", is("Brazil")))
                .andExpect(jsonPath("$[0].populacao", is(211140729)));
    }

    @Test
    void filtraPorPopulacaoMinima() throws Exception {
        buscar("{\"populacaoMinima\":1000000000}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].nome", hasItems("India", "China")));
    }

    @Test
    void filtraPorPopulacaoMaxima() throws Exception {
        buscar("{\"regiao\":\"europe\",\"populacaoMaxima\":50000}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", hasItems("Liechtenstein", "Monaco", "San Marino")))
                .andExpect(jsonPath("$[*].nome", not(hasItem("Portugal"))))
                .andExpect(jsonPath("$[*].populacao", everyItem(lessThanOrEqualTo(50000))));
    }

    @Test
    void filtraPorFaixaDePopulacaoCombinadaComMoeda() throws Exception {
        // moeda BRL + população entre 100 e 300 milhões: só o Brasil
        buscar("{\"moeda\":\"brl\",\"populacaoMinima\":100000000,\"populacaoMaxima\":300000000}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome", is("Brazil")));

        // moeda EUR com pelo menos 100 milhões de habitantes: nenhum país (a maior, a Alemanha, tem cerca de 83 milhões)
        buscar("{\"moeda\":\"EUR\",\"populacaoMinima\":100000000}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void paisesSemPopulacaoSaemQuandoHaLimiteDeHabitantes() throws Exception {
        // Taiwan (TWD) não tem população publicada: aparece sem limite e some com limite
        buscar("{\"moeda\":\"TWD\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome", is("Taiwan")))
                .andExpect(jsonPath("$[0].populacao").doesNotExist());

        buscar("{\"moeda\":\"TWD\",\"populacaoMinima\":0}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void limitesDePopulacaoInvalidosRetornam400ComMensagem() throws Exception {
        buscar("{\"populacaoMinima\":500,\"populacaoMaxima\":100}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem", containsString("mínima")));

        buscar("{\"populacaoMinima\":-1}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem", containsString("negativa")));
    }

    @Test
    void semResultadosRetornaListaVazia() throws Exception {
        buscar("{\"lingua\":\"klingon\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void atualizarBaseRecarregaSemDuplicarPaises() throws Exception {
        int antes = objectMapper.readTree(buscar("{}").andReturn().getResponse().getContentAsString()).size();

        mockMvc.perform(post(ATUALIZAR)).andExpect(status().isOk());

        int depois = objectMapper.readTree(buscar("{}").andReturn().getResponse().getContentAsString()).size();
        assertEquals(antes, depois);
    }
}

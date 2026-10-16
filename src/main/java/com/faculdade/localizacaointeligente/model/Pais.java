package com.faculdade.localizacaointeligente.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Entity
@Data
@Slf4j
@JsonIgnoreProperties(ignoreUnknown = true)
public class Pais {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "regiao")
    private String regiao;

    @Column(name = "lingua")
    private String lingua;

    @Column(name = "clima")
    private String clima;

    @Column(name = "moeda")
    private String moeda;

    /** Todos os idiomas do país, separados por vírgula (ex.: "Portuguese, English"). Usado na busca por idioma. */
    @Column(name = "linguas", length = 1000)
    private String linguas;

    /** Códigos de todas as moedas do país, separados por vírgula (ex.: "BRL,USD"). Usado na busca por moeda. */
    @Column(name = "moedas", length = 500)
    private String moedas;

    /** Número de habitantes (Banco Mundial, 2023). Fica nulo para os países sem dado publicado. */
    @Column(name = "populacao")
    private Long populacao;

    @Transient
    private Map<String, Object> name;

    @Transient
    private Map<String, Object> currencies;

    @Transient
    private Map<String, String> languages;

    @Transient
    private String region;

    @Transient
    private Long population;

    public void processarDadosAPI() {
        log.debug("Iniciando processamento dos dados do país");

        try {
            // Processa o nome
            if (name != null && name.containsKey("common")) {
                this.nome = (String) name.get("common");
                log.debug("Nome definido: {}", this.nome);
            } else {
                log.warn("Nome não encontrado para o país");
            }

            // Processa a região
            if (this.region != null) {
                this.regiao = this.region;
                log.debug("Região definida: {}", this.regiao);
            } else {
                log.warn("Região não encontrada para o país: {}", this.nome);
            }

            // Processa a moeda
            if (currencies != null && !currencies.isEmpty()) {
                Map.Entry<String, Object> entry = currencies.entrySet().iterator().next();
                this.moeda = entry.getKey();
                this.moedas = String.join(",", currencies.keySet());
                log.debug("Moeda definida: {} (todas: {})", this.moeda, this.moedas);
            } else {
                log.warn("Moeda não encontrada para o país: {}", this.nome);
            }

            // Processa o idioma
            if (languages != null && !languages.isEmpty()) {
                this.lingua = languages.values().iterator().next();
                this.linguas = String.join(", ", languages.values());
                log.debug("Língua definida: {} (todas: {})", this.lingua, this.linguas);
            } else {
                log.warn("Língua não encontrada para o país: {}", this.nome);
            }

            // Processa a população (pode não existir para alguns territórios)
            this.populacao = this.population;

            // Define o clima
            this.clima = determinarClimaBasico(this.regiao);
            log.debug("Clima definido: {}", this.clima);

        } catch (Exception e) {
            log.error("Erro ao processar dados do país {}: {}", this.nome, e.getMessage());
        }

        log.debug("Processamento concluído para o país: {}", this.nome);
    }

    private String determinarClimaBasico(String regiao) {
        if (regiao == null) {
            return "Desconhecido";
        }

        switch (regiao.toLowerCase()) {
            case "americas":
                return "Tropical";
            case "europe":
                return "Temperado";
            case "asia":
                return "Continental";
            case "africa":
                return "Tropical";
            case "oceania":
                return "Tropical";
            default:
                return "Variado";
        }
    }

    @Override
    public String toString() {
        return "Pais{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", regiao='" + regiao + '\'' +
                ", lingua='" + lingua + '\'' +
                ", clima='" + clima + '\'' +
                ", moeda='" + moeda + '\'' +
                ", linguas='" + linguas + '\'' +
                ", moedas='" + moedas + '\'' +
                ", populacao=" + populacao +
                '}';
    }
}
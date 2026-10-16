package com.faculdade.localizacaointeligente.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    /**
     * Origens (endereços do front-end) que podem chamar a API. O padrão é o endereço do
     * "npm start". Se o React subir em outra porta (por exemplo 3001, quando a 3000 está
     * ocupada), informe em application.properties: app.cors.allowed-origins=http://localhost:3001
     * Para mais de uma origem, separe por vírgula.
     */
    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String origensPermitidas;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        List<String> origens = Arrays.stream(origensPermitidas.split(","))
                .map(String::trim)
                .filter(origem -> !origem.isEmpty())
                .toList();
        config.setAllowedOrigins(origens);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}

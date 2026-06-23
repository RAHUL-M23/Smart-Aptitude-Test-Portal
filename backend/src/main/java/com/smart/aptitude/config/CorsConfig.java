package com.smart.aptitude.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        String[] origins = (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) 
            ? allowedOriginsEnv.split(",") 
            : new String[]{"http://localhost:[*]", "http://127.0.0.1:[*]"};

        registry.addMapping("/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

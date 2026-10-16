# 🌎 Localização Inteligente

Aplicação web para **descobrir países de acordo com as suas preferências**: você escolhe a região, o clima, o idioma, a moeda e uma faixa de população, e o sistema mostra na hora os países que combinam com tudo o que você procura.

Tem um **back-end** em Java (Spring Boot) e um **front-end** em React, na mesma pasta. Funciona **sem internet e sem cadastro em nenhum serviço**, porque os dados dos países ficam dentro do próprio projeto.

## ✨ Funcionalidades

- **Busca automática com vários filtros combinados:** região, clima, idioma, moeda e população (mínima e máxima). A lista se atualiza assim que você muda um filtro.
- **Idiomas e moedas completos:** a busca considera **todos** os idiomas e moedas de cada país, não só o primeiro (por exemplo, o Latin é achado no Vaticano e o `ZAR` no Zimbabwe).
- **Página "Sobre":** resumo do projeto e a lista dos **155 idiomas** e **161 moedas** disponíveis para pesquisa, com o número de países de cada um. Clicar em um item abre a busca já filtrada por ele.
- **Cartões e detalhes de cada país:** idioma, moeda, clima e população; a janela de detalhes mostra todos os idiomas e todas as moedas, com o nome de cada moeda.
- **Ordenação e paginação:** por nome ou por população, com "Mostrar mais".
- **Tema claro e escuro, layout responsivo (celular, tablet e desktop) e acessibilidade:** navegação por teclado, rótulos nos campos e foco controlado na janela de detalhes.
- **Tratamento de erros:** limites de população inválidos, servidor fora do ar e busca sem resultados têm mensagens claras.

## 🛠️ Tecnologias

**Back-end**
- Java 17 e Maven (com Maven Wrapper, não precisa instalar o Maven)
- Spring Boot 3.2.3: Spring Web (REST), Spring Data JPA e Validation
- H2 Database em memória
- Lombok
- JUnit 5 e MockMvc nos testes

**Front-end**
- React 18 (Create React App) e Axios para chamar a API
- CSS puro (sem bibliotecas de interface nem fontes externas)

## 🚀 Como rodar

Clone ou baixe o repositório e abra a pasta do projeto no terminal. Você precisa de **dois terminais**, um para o back-end e outro para o front-end.

### Pré-requisitos
- **Java 17 ou superior** (confira com `java -version`)
- **Node.js 18 ou superior** (confira com `node -v`). Baixe em https://nodejs.org (versão LTS).

### 1. Back-end (primeiro terminal, na pasta raiz do projeto)

```powershell
.\mvnw.cmd clean spring-boot:run
```

Espere aparecer `Started LocalizacaointeligenteApplication` e a mensagem `Base atualizada com sucesso. Total de países: 250`.
O back-end fica em `http://localhost:8080`.

### 2. Front-end (segundo terminal)

```powershell
cd frontend
npm install
npm start
```

O navegador abre sozinho em **http://localhost:3000**. Se não abrir, acesse esse endereço.
O `npm install` só é necessário na primeira vez.

> ⚠️ O front chama o back-end em `localhost:8080`. Se outro programa estiver usando a porta 8080 (por exemplo outra API), feche-o antes de subir o back-end.
> No Linux/macOS use `./mvnw` no lugar de `.\mvnw.cmd`.

**Se o front subir em outra porta** (o React escolhe a 3001, por exemplo, quando a 3000 está ocupada), o back-end precisa autorizar esse endereço. Em `src/main/resources/application.properties` troque a linha:

```properties
app.cors.allowed-origins=http://localhost:3001
```

(para mais de um endereço, separe por vírgula) e suba o back-end de novo. Para o front chamar um back-end em outro endereço, defina `REACT_APP_API_URL` antes do `npm start`.

### 3. Usando a aplicação

A busca é **automática**: a lista se atualiza assim que você muda um filtro, sem botão de buscar. Os filtros vazios não restringem nada e podem ser combinados.

1. No painel **Filtros**, escolha:
   - **Região** e **Clima**: clique nas opções (clicar de novo na opção ativa remove o filtro).
   - **Idioma**: digite em inglês, por exemplo `Portuguese`, `French` ou `Latin` (o campo sugere os idiomas existentes). A busca considera **todos** os idiomas de cada país, e não só o primeiro.
   - **Moeda**: digite o código de 3 letras, por exemplo `BRL`, `EUR` ou `USD` (o campo sugere as moedas existentes). Também vale para todas as moedas do país.
   - **População**: use uma faixa pronta (Pequeno, Médio, Grande, Gigante) ou digite o número mínimo e/ou máximo de habitantes.
2. Os filtros ativos aparecem como etiquetas acima dos resultados; clique no **×** para remover um deles, ou em **Limpar tudo**.
3. **Ordene** os resultados por nome ou por população, e use **Mostrar mais** para ver os próximos países.
4. Clique em um cartão para abrir os **detalhes** (feche com `Esc`, clicando fora ou no botão). Lá também dá para ver os outros países da mesma região.
5. O botão **Atualizar base**, no topo, recarrega os países do arquivo de dados (não é obrigatório, a base já sobe carregada).
6. O botão **Sobre**, no topo, abre uma página (`#/sobre`) com o resumo do projeto, as tecnologias, o estado do servidor e a lista completa de **idiomas** e **moedas** disponíveis para pesquisa. Dá para filtrar e ordenar essas listas, e clicar em um idioma ou moeda abre a busca já filtrada por ele.

Países sem população publicada aparecem como "Não informada" e ficam de fora sempre que você usa população mínima ou máxima.

No celular, o painel de filtros fica recolhido atrás do botão **Filtros**. A aplicação tem **tema claro e escuro** (botão no topo, a escolha fica salva no navegador).

## 🧪 Testes automatizados

Pare o back-end (`Ctrl + C`) e rode:

```powershell
.\mvnw.cmd clean test
```

O esperado é `Tests run: 19, Failures: 0, Errors: 0` e `BUILD SUCCESS`. Os testes sobem a aplicação inteira (banco H2 e carga dos países) e chamam a API como o front-end faz. Um deles confere que **todo idioma e toda moeda listados em `/opcoes` realmente podem ser pesquisados**. Use sempre o `clean`: ele apaga a compilação anterior e evita erros com classes antigas.

No VS Code, o projeto já traz o arquivo `.vscode/settings.json` com a compilação automática do Java desativada, para o editor não estragar as classes geradas pelo Lombok.

## 📚 API

Base: `http://localhost:8080/api/paises`

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/buscar` | Devolve os países que combinam com as preferências enviadas |
| `POST` | `/atualizar-base` | Recarrega os países do arquivo `data/paises.json` |
| `GET` | `/opcoes` | Lista os idiomas e as moedas disponíveis para pesquisa, com o número de países de cada um |

**Exemplo de busca** (todos os campos são opcionais; campo vazio não filtra):

```json
{ "regiao": "europe", "moeda": "EUR", "populacaoMinima": 60000000 }
```

**Exemplo de resposta** (França e Alemanha são os países europeus com Euro e pelo menos 60 milhões de habitantes)

```json
[
  { "id": 77, "nome": "France", "regiao": "Europe", "lingua": "French", "linguas": "French", "clima": "Temperado", "moeda": "EUR", "moedas": "EUR", "populacao": 68372286 },
  { "id": 84, "nome": "Germany", "regiao": "Europe", "lingua": "German", "linguas": "German", "clima": "Temperado", "moeda": "EUR", "moedas": "EUR", "populacao": 83287273 }
]
```

`lingua` e `moeda` são o primeiro idioma e a primeira moeda do país; `linguas` e `moedas` trazem todos (por exemplo, o Zimbabwe tem 15 idiomas e 9 moedas), e é neles que a busca procura.

**Exemplo de `GET /opcoes`** (listas completas, em ordem alfabética)

```json
{
  "totalPaises": 250,
  "idiomas": [ { "nome": "Latin", "quantidade": 1 }, { "nome": "Portuguese", "quantidade": 10 } ],
  "moedas": [ { "codigo": "BRL", "nome": "Brazilian real", "quantidade": 1 }, { "codigo": "USD", "nome": "United States dollar", "quantidade": 20 } ]
}
```

| Filtro | Valores |
|---|---|
| `regiao` | `africa`, `americas`, `asia`, `europe`, `oceania` (não diferencia maiúsculas) |
| `clima` | `Tropical`, `Temperado`, `Continental` ou `Variado` |
| `lingua` | Parte do nome de **qualquer** idioma do país, em inglês (`portuguese`, `latin`...); `german` também acha `Swiss German` |
| `moeda` | Código de **qualquer** moeda do país (`BRL`, `EUR`, `USD`...) |
| `populacaoMinima` | Número mínimo de habitantes, inclusive (ex.: `10000000`) |
| `populacaoMaxima` | Número máximo de habitantes, inclusive (ex.: `50000000`) |

Se `populacaoMinima` for maior que `populacaoMaxima`, ou se algum dos dois for negativo, a API responde **400** com `{ "mensagem": "..." }`.

O console do banco fica em `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:testdb`, usuário `sa`, senha vazia).

## 🗂️ Sobre os dados

Os países ficam em `src/main/resources/data/paises.json` (250 países e territórios) e são carregados no banco ao iniciar a aplicação, sem precisar de internet.

O projeto buscava esses dados na API pública `restcountries.com`, mas a versão que usávamos foi **descontinuada** (a nova exige chave de acesso). Por isso os dados agora são fixos no repositório, no mesmo formato que aquela API devolvia.

**Fontes**
- Nome, região, idiomas e moedas: [mledoze/countries](https://github.com/mledoze/countries), licença **ODbL 1.0**.
- População (ano de 2023): [Banco Mundial, indicador SP.POP.TOTL](https://data.worldbank.org/indicator/SP.POP.TOTL), licença **CC BY 4.0**.

**Limitações conhecidas**
- **34 territórios** não têm população publicada pelo Banco Mundial em 2023 (por exemplo Taiwan, Vaticano, Saara Ocidental e ilhas ultramarinas) e ficam sem esse dado.
- Nos cartões aparece só o primeiro idioma e a primeira moeda do país (com "+N" quando há mais); os detalhes mostram todos, e a busca considera todos.
- Idiomas e moedas estão em inglês, como nos dados, e não têm tradução para o português.
- O **clima é uma estimativa simples pela região** (por exemplo, todas as Américas contam como "Tropical"), e não o clima real de cada país.
- Os dados são um retrato fixo e podem ficar desatualizados com o tempo.

## 📁 Estrutura do projeto

```
src/main/java/com/faculdade/localizacaointeligente/
  controller/   -> PaisController: rotas /buscar, /atualizar-base e /opcoes
  service/      -> PaisService e PaisServiceImpl: filtros, carga dos países e lista de opções
  model/        -> Pais (entidade JPA)
  dto/          -> PreferenciasDTO (filtros recebidos) e OpcoesDTO (idiomas e moedas)
  config/       -> CorsConfig e CargaInicialPaises (carrega os países ao iniciar)
  repository/   -> PaisRepository (Spring Data JPA)
src/main/resources/data/paises.json   -> os 250 países
src/test/java/...                     -> testes de ponta a ponta (MockMvc)

frontend/src/
  App.js              -> tela principal e a lógica de busca
  components/         -> Header, FilterPanel, ResultsBar, CountryCard, CountryModal, Sobre, Planeta
  constants.js        -> opções dos filtros (regiões, climas, faixas de população)
  format.js           -> formatação (população, listas) e validações
  rotas.js            -> navegação entre a busca e a página Sobre
  style.css           -> estilos (tema claro e escuro)
```

Os arquivos `SearchBar.js`, `SidebarLeft.js` e `SidebarRight.js` em `frontend/src` são da primeira versão do front-end e não são usados pela tela atual.

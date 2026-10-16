import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import './style.css';

import Header from './components/Header';
import { Planeta } from './components/Planeta';
import FilterPanel from './components/FilterPanel';
import ResultsBar from './components/ResultsBar';
import CountryCard, { CardSkeleton } from './components/CountryCard';
import CountryModal from './components/CountryModal';
import Sobre from './components/Sobre';
import { irParaBusca, useRota } from './rotas';
import {
  CLIMAS,
  FAIXAS_POPULACAO,
  FILTROS_VAZIOS,
  REGIOES,
} from './constants';
import { corpoDaBusca, resumoPopulacao, validarPopulacao } from './format';

// Endereço do back-end. Para usar outro, defina REACT_APP_API_URL antes do "npm start".
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const PAISES_POR_PAGINA = 12;
const ESPERA_DA_DIGITACAO_MS = 350;

const temaInicial = () =>
  document.documentElement.getAttribute('data-theme') ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

function ordenar(paises, ordem) {
  const porNome = (a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
  const lista = [...paises];
  if (ordem === 'nome') return lista.sort(porNome);

  const sentido = ordem === 'populacaoDesc' ? -1 : 1;
  return lista.sort((a, b) => {
    const pa = a.populacao;
    const pb = b.populacao;
    const semA = pa === null || pa === undefined;
    const semB = pb === null || pb === undefined;
    if (semA && semB) return porNome(a, b);
    if (semA) return 1; // países sem população sempre no fim
    if (semB) return -1;
    return (pa - pb) * sentido || porNome(a, b);
  });
}

function App() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS); // o que está na tela
  const [consulta, setConsulta] = useState(FILTROS_VAZIOS); // o que foi enviado ao back-end
  const [paises, setPaises] = useState([]);
  const [totalBase, setTotalBase] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [jaCarregou, setJaCarregou] = useState(false);
  const [erro, setErro] = useState(null);
  const [semConexao, setSemConexao] = useState(false); // true quando o back-end não responde
  const [tentativa, setTentativa] = useState(0);
  const [ordem, setOrdem] = useState('nome');
  const [limite, setLimite] = useState(PAISES_POR_PAGINA);
  const [selecionado, setSelecionado] = useState(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [tema, setTema] = useState(temaInicial);
  const [opcoes, setOpcoes] = useState(null); // idiomas e moedas disponíveis (do back-end)
  const [erroOpcoes, setErroOpcoes] = useState(false);
  const rota = useRota();

  const imediatoRef = useRef(true);
  const avisoTimerRef = useRef(null);

  const erroPopulacao = useMemo(
    () => validarPopulacao(filtros.populacaoMinima, filtros.populacaoMaxima),
    [filtros.populacaoMinima, filtros.populacaoMaxima],
  );

  // Muda um ou mais filtros. Cliques (imediato) buscam na hora; digitação espera um instante.
  const mudarFiltros = useCallback((alteracao, imediato = false) => {
    imediatoRef.current = imediato;
    setFiltros((atual) => ({ ...atual, ...alteracao }));
  }, []);

  const limparFiltros = useCallback(() => {
    imediatoRef.current = true;
    setFiltros(FILTROS_VAZIOS);
  }, []);

  // Envia a consulta ao back-end quando os filtros mudam (e estão válidos).
  useEffect(() => {
    if (erroPopulacao) return undefined;
    const timer = setTimeout(() => setConsulta(filtros), imediatoRef.current ? 0 : ESPERA_DA_DIGITACAO_MS);
    return () => clearTimeout(timer);
  }, [filtros, erroPopulacao]);

  // Busca os países. Uma busca nova cancela a anterior, para nunca mostrar resultado velho.
  useEffect(() => {
    const controle = new AbortController();
    setCarregando(true);
    setErro(null);

    axios
      .post(`${API_URL}/api/paises/buscar`, corpoDaBusca(consulta), { signal: controle.signal })
      .then((resposta) => {
        setPaises(resposta.data);
        setJaCarregou(true);
        setSemConexao(false);
        if (Object.values(consulta).every((valor) => valor === '')) setTotalBase(resposta.data.length);
      })
      .catch((falha) => {
        if (axios.isCancel(falha)) return;
        setSemConexao(!falha.response);
        const mensagemDoServidor = falha.response && falha.response.data && falha.response.data.mensagem;
        setErro(
          mensagemDoServidor ||
            (falha.response
              ? 'O servidor não conseguiu fazer a busca. Tente novamente.'
              : 'Não foi possível falar com o servidor. Confira se o back-end está rodando.'),
        );
        console.error('Erro ao buscar países:', falha);
      })
      .finally(() => {
        if (!controle.signal.aborted) setCarregando(false);
      });

    return () => controle.abort();
  }, [consulta, tentativa]);

  // Busca a lista de idiomas e moedas disponíveis (usada na página "Sobre" e nas sugestões dos filtros).
  useEffect(() => {
    const controle = new AbortController();
    setErroOpcoes(false);
    axios
      .get(`${API_URL}/api/paises/opcoes`, { signal: controle.signal })
      .then((resposta) => setOpcoes(resposta.data))
      .catch((falha) => {
        if (axios.isCancel(falha)) return;
        setErroOpcoes(true);
        console.error('Erro ao carregar idiomas e moedas:', falha);
      });
    return () => controle.abort();
  }, [tentativa]);

  // Título da aba e posição da página acompanham a rota atual.
  useEffect(() => {
    document.title = rota === 'sobre' ? 'Sobre · Localização Inteligente' : 'Localização Inteligente';
    window.scrollTo({ top: 0 });
  }, [rota]);

  const ordenados = useMemo(() => ordenar(paises, ordem), [paises, ordem]);

  // Nome de cada moeda pelo código (ex.: BRL -> "Brazilian real"), para os detalhes do país.
  const nomesDasMoedas = useMemo(
    () => Object.fromEntries((opcoes ? opcoes.moedas : []).map((moeda) => [moeda.codigo, moeda.nome])),
    [opcoes],
  );

  // A cada nova lista ou ordenação, volta para a primeira "página".
  useEffect(() => {
    setLimite(PAISES_POR_PAGINA);
  }, [paises, ordem]);

  // Tema claro/escuro (lembrado neste navegador).
  const alternarTema = useCallback(() => {
    const proximo = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', proximo);
    try {
      localStorage.setItem('tema', proximo);
    } catch (e) {
      // sem armazenamento local: o tema vale só até recarregar
    }
    setTema(proximo);
  }, [tema]);

  const mostrarAviso = useCallback((texto, tipo) => {
    clearTimeout(avisoTimerRef.current);
    setAviso({ texto, tipo });
    avisoTimerRef.current = setTimeout(() => setAviso(null), 4500);
  }, []);

  useEffect(() => () => clearTimeout(avisoTimerRef.current), []);

  const atualizarBase = async () => {
    setAtualizando(true);
    try {
      await axios.post(`${API_URL}/api/paises/atualizar-base`);
      mostrarAviso('Base de países atualizada com sucesso.', 'ok');
      setTentativa((n) => n + 1);
    } catch (falha) {
      console.error('Erro ao atualizar a base:', falha);
      mostrarAviso('Não foi possível atualizar a base de países.', 'erro');
    } finally {
      setAtualizando(false);
    }
  };

  // Vindo da página "Sobre": começa uma busca nova só com esse idioma ou moeda e volta para a busca.
  const pesquisarPor = useCallback((filtro) => {
    imediatoRef.current = true;
    setFiltros({ ...FILTROS_VAZIOS, ...filtro });
    irParaBusca();
  }, []);

  const fecharDetalhes = useCallback(() => setSelecionado(null), []);

  const verRegiao = useCallback(
    (regiao) => {
      setSelecionado(null);
      mudarFiltros({ regiao }, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [mudarFiltros],
  );

  // Lista de filtros ativos, cada um com a ação que o remove.
  const ativos = [];
  const regiaoAtiva = REGIOES.find((r) => r.valor === filtros.regiao);
  const climaAtivo = CLIMAS.find((c) => c.valor === filtros.clima);
  const faixaAtiva = FAIXAS_POPULACAO.find(
    (f) => f.min === filtros.populacaoMinima && f.max === filtros.populacaoMaxima,
  );
  if (regiaoAtiva) ativos.push({ chave: 'regiao', rotulo: 'Região', texto: regiaoAtiva.rotulo, remover: () => mudarFiltros({ regiao: '' }, true) });
  if (climaAtivo) ativos.push({ chave: 'clima', rotulo: 'Clima', texto: climaAtivo.rotulo, remover: () => mudarFiltros({ clima: '' }, true) });
  if (filtros.lingua.trim()) ativos.push({ chave: 'lingua', rotulo: 'Idioma', texto: filtros.lingua.trim(), remover: () => mudarFiltros({ lingua: '' }, true) });
  if (filtros.moeda) ativos.push({ chave: 'moeda', rotulo: 'Moeda', texto: filtros.moeda, remover: () => mudarFiltros({ moeda: '' }, true) });
  if (filtros.populacaoMinima !== '' || filtros.populacaoMaxima !== '') {
    ativos.push({
      chave: 'populacao',
      rotulo: 'População',
      texto: faixaAtiva ? faixaAtiva.rotulo : resumoPopulacao(filtros.populacaoMinima, filtros.populacaoMaxima),
      remover: () => mudarFiltros({ populacaoMinima: '', populacaoMaxima: '' }, true),
    });
  }

  const statusApi = semConexao ? 'offline' : jaCarregou ? 'online' : 'conectando';
  const visiveis = ordenados.slice(0, limite);

  return (
    <div className="app">
      <Header
        rota={rota}
        tema={tema}
        onAlternarTema={alternarTema}
        onAtualizarBase={atualizarBase}
        atualizando={atualizando}
      />

      <main className="page">
        {rota === 'sobre' ? (
          <Sobre opcoes={opcoes} erroOpcoes={erroOpcoes && !opcoes} statusApi={statusApi} onPesquisar={pesquisarPor} />
        ) : (
          <>
            <section className="hero">
              <div className="hero__text">
                <h1 className="hero__title">Descubra o país ideal para você</h1>
                <p className="hero__subtitle">
                  Combine região, clima, idioma, moeda e população e veja na hora quais países combinam com o que você procura.
                </p>
              </div>
              <ul className="hero__stats">
                <li><strong>{totalBase ?? '—'}</strong> países e territórios</li>
                <li><strong>{REGIOES.length}</strong> regiões</li>
                <li>População do Banco Mundial (2023)</li>
              </ul>
              <Planeta className="hero__planet" />
            </section>

            <div className="layout">
              <FilterPanel
                filtros={filtros}
                onChange={mudarFiltros}
                onLimpar={limparFiltros}
                totalAtivos={ativos.length}
                erroPopulacao={erroPopulacao}
                opcoes={opcoes}
                aberto={filtrosAbertos}
                onAlternar={() => setFiltrosAbertos((aberto) => !aberto)}
              />

              <section className="results" aria-label="Resultados da busca">
                <ResultsBar
                  total={paises.length}
                  totalBase={totalBase}
                  ativos={ativos}
                  ordem={ordem}
                  onOrdem={setOrdem}
                  carregando={carregando && jaCarregou}
                  comErro={Boolean(erro)}
                />

                {!jaCarregou && carregando && (
                  <div className="grid" aria-busy="true">
                    {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
                  </div>
                )}

                {erro && (
                  <div className="state state--error" role="alert">
                    <span className="state__icon" aria-hidden="true">⚠️</span>
                    <h2 className="state__title">Algo deu errado</h2>
                    <p className="state__text">{erro}</p>
                    <button type="button" className="btn btn--primary" onClick={() => setTentativa((n) => n + 1)}>
                      Tentar de novo
                    </button>
                  </div>
                )}

                {!erro && jaCarregou && paises.length === 0 && (
                  <div className="state">
                    <span className="state__icon" aria-hidden="true">🧭</span>
                    <h2 className="state__title">Nenhum país encontrado</h2>
                    <p className="state__text">
                      Nenhum país combina com todos esses filtros ao mesmo tempo. Tente remover algum deles.
                    </p>
                    <button type="button" className="btn btn--primary" onClick={limparFiltros}>Limpar filtros</button>
                  </div>
                )}

                {!erro && jaCarregou && paises.length > 0 && (
                  <>
                    <div className={`grid${carregando ? ' is-refreshing' : ''}`}>
                      {visiveis.map((pais, indice) => (
                        <CountryCard key={pais.id} pais={pais} indice={indice} onAbrir={setSelecionado} />
                      ))}
                    </div>

                    {ordenados.length > visiveis.length && (
                      <div className="more">
                        <p className="more__text">Mostrando {visiveis.length} de {ordenados.length}</p>
                        <button type="button" className="btn btn--ghost" onClick={() => setLimite((n) => n + PAISES_POR_PAGINA)}>
                          Mostrar mais {Math.min(PAISES_POR_PAGINA, ordenados.length - visiveis.length)}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Localização Inteligente · projeto de grupo da faculdade · © {new Date().getFullYear()}</p>
      </footer>

      {selecionado && rota === 'busca' && (
        <CountryModal pais={selecionado} nomesDasMoedas={nomesDasMoedas} onFechar={fecharDetalhes} onVerRegiao={verRegiao} />
      )}

      {aviso && (
        <div className={`toast toast--${aviso.tipo}`} role="status">{aviso.texto}</div>
      )}
    </div>
  );
}

export default App;

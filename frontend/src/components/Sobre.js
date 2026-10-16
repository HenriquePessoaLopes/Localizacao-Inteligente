import React, { useMemo, useState } from 'react';
import { REGIOES } from '../constants';
import { rotuloDePaises } from '../format';

const TECNOLOGIAS = ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'H2 (em memória)', 'React 18', 'Axios', 'CSS puro'];

const TEXTO_DO_STATUS = {
  conectando: 'Conectando ao servidor…',
  online: 'Servidor online',
  offline: 'Servidor offline',
};

// Lista pesquisável de idiomas ou de moedas. Clicar em um item volta para a busca já filtrada por ele.
function PainelDeOpcoes({ id, titulo, ajuda, itens, tipo, onPesquisar, carregando, erro }) {
  const [texto, setTexto] = useState('');
  const [ordem, setOrdem] = useState('uso');

  const visiveis = useMemo(() => {
    const termo = texto.trim().toLowerCase();
    const filtrados = itens.filter(
      (item) => !termo || item.nome.toLowerCase().includes(termo) || (item.codigo || '').toLowerCase().includes(termo),
    );
    const porNome = (a, b) => (a.codigo || a.nome).localeCompare(b.codigo || b.nome, 'en');
    return filtrados.sort(
      ordem === 'uso' ? (a, b) => b.quantidade - a.quantidade || porNome(a, b) : porNome,
    );
  }, [itens, texto, ordem]);

  return (
    <section className="panel" aria-labelledby={`${id}-titulo`}>
      <div className="panel__head">
        <h2 id={`${id}-titulo`} className="panel__title">
          {titulo}
          {itens.length > 0 && <span className="count-badge">{itens.length}</span>}
        </h2>
      </div>
      <p className="panel__text">{ajuda}</p>

      {carregando && <p className="panel__note">Carregando a lista…</p>}
      {erro && (
        <p className="panel__note panel__note--error" role="alert">
          Não foi possível carregar a lista. Confira se o back-end está rodando e na versão mais recente (reinicie-o
          com <code>.\mvnw.cmd clean spring-boot:run</code>).
        </p>
      )}

      {itens.length > 0 && (
        <>
          <div className="opts-toolbar">
            <div className="opts-toolbar__field">
              <label htmlFor={`${id}-busca`}>Filtrar a lista</label>
              <input
                id={`${id}-busca`}
                className="input"
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={tipo === 'idioma' ? 'Ex.: latin' : 'Ex.: BRL ou real'}
                autoComplete="off"
              />
            </div>
            <div className="opts-toolbar__field">
              <label htmlFor={`${id}-ordem`}>Ordenar por</label>
              <select id={`${id}-ordem`} className="select" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                <option value="uso">Mais países primeiro</option>
                <option value="az">{tipo === 'idioma' ? 'Nome (A a Z)' : 'Código (A a Z)'}</option>
              </select>
            </div>
          </div>

          <p className="opts-count" aria-live="polite">
            {visiveis.length === itens.length
              ? `${itens.length} ${tipo === 'idioma' ? 'idiomas' : 'moedas'}`
              : `${visiveis.length} de ${itens.length}`}
          </p>

          {visiveis.length === 0 ? (
            <p className="panel__note">Nada encontrado para "{texto}".</p>
          ) : (
            <ul className={`opts opts--${tipo}`}>
              {visiveis.map((item) => (
                <li key={item.chave}>
                  <button
                    type="button"
                    className="opt"
                    onClick={() => onPesquisar(item)}
                    aria-label={`Pesquisar ${tipo === 'idioma' ? 'o idioma' : 'a moeda'} ${item.codigo ? `${item.codigo}, ${item.nome}` : item.nome}: ${rotuloDePaises(item.quantidade)}`}
                    title={`Pesquisar: ${rotuloDePaises(item.quantidade)}`}
                  >
                    {item.codigo && <span className="opt__codigo">{item.codigo}</span>}
                    <span className="opt__nome">{item.nome}</span>
                    <span className="opt__qtd">{item.quantidade}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function Sobre({ opcoes, erroOpcoes, statusApi, onPesquisar }) {
  const idiomas = useMemo(
    () => (opcoes ? opcoes.idiomas.map((i) => ({ chave: i.nome, nome: i.nome, quantidade: i.quantidade })) : []),
    [opcoes],
  );
  const moedas = useMemo(
    () =>
      opcoes
        ? opcoes.moedas.map((m) => ({ chave: m.codigo, codigo: m.codigo, nome: m.nome, quantidade: m.quantidade }))
        : [],
    [opcoes],
  );
  const carregando = !opcoes && !erroOpcoes;

  return (
    <div className="sobre">
      <div className="sobre__topo">
        <a className="back-link" href="#/">← Voltar para a busca</a>
        <span className={`status status--${statusApi}`} role="status">
          <span className="status__dot" aria-hidden="true" />
          {TEXTO_DO_STATUS[statusApi]}
        </span>
      </div>

      <header className="sobre__head">
        <h1 className="sobre__title">Sobre o projeto</h1>
        <p className="sobre__lead">
          A <strong>Localização Inteligente</strong> ajuda a descobrir países que combinam com as suas preferências,
          cruzando região, clima, idioma, moeda e população.
        </p>
      </header>

      <ul className="sobre__stats">
        <li><strong>{opcoes ? opcoes.totalPaises : '—'}</strong> países e territórios</li>
        <li><strong>{opcoes ? opcoes.idiomas.length : '—'}</strong> idiomas</li>
        <li><strong>{opcoes ? opcoes.moedas.length : '—'}</strong> moedas</li>
        <li><strong>{REGIOES.length}</strong> regiões</li>
      </ul>

      <div className="sobre__colunas">
        <section className="panel" aria-labelledby="sobre-oque">
          <h2 id="sobre-oque" className="panel__title">O que é</h2>
          <p className="panel__text">
            É uma aplicação web feita em grupo durante a faculdade. Em vez de procurar país por país, você marca o que
            importa (por exemplo: Europa, clima temperado, idioma francês, moeda Euro e mais de 60 milhões de habitantes)
            e a lista mostra só os países que atendem a tudo isso ao mesmo tempo.
          </p>
        </section>

        <section className="panel" aria-labelledby="sobre-como">
          <h2 id="sobre-como" className="panel__title">Como funciona</h2>
          <ol className="steps">
            <li><span>Você escolhe os filtros na tela de busca.</span></li>
            <li><span>O front-end (React) envia os filtros ao back-end (Java com Spring Boot), que procura nos países.</span></li>
            <li><span>Cada país pode ter vários idiomas e moedas, e a busca considera <strong>todos</strong> eles.</span></li>
            <li><span>O resultado volta na hora; dá para ordenar, ver os detalhes e abrir os países da mesma região.</span></li>
          </ol>
        </section>
      </div>

      <section className="panel" aria-labelledby="sobre-tec">
        <h2 id="sobre-tec" className="panel__title">Tecnologias</h2>
        <ul className="tech">
          {TECNOLOGIAS.map((tec) => (
            <li key={tec}>{tec}</li>
          ))}
        </ul>
      </section>

      <PainelDeOpcoes
        id="idiomas"
        titulo="Idiomas disponíveis para pesquisa"
        ajuda="Os nomes estão em inglês, como nos dados. Digite o nome, ou parte dele, no filtro de idioma da busca (german também acha Swiss German). Clique em um idioma para pesquisar agora; o número é a quantidade de países que o têm."
        itens={idiomas}
        tipo="idioma"
        carregando={carregando}
        erro={erroOpcoes}
        onPesquisar={(item) => onPesquisar({ lingua: item.nome })}
      />

      <PainelDeOpcoes
        id="moedas"
        titulo="Moedas disponíveis para pesquisa"
        ajuda="A busca usa o código de 3 letras (por exemplo BRL). Clique em uma moeda para pesquisar agora; o número é a quantidade de países que a usam."
        itens={moedas}
        tipo="moeda"
        carregando={carregando}
        erro={erroOpcoes}
        onPesquisar={(item) => onPesquisar({ moeda: item.codigo })}
      />

      <div className="sobre__rodape">
        <a className="btn btn--primary" href="#/">Voltar para a busca</a>
      </div>
    </div>
  );
}

export default Sobre;

import React from 'react';
import {
  CLIMAS,
  FAIXAS_POPULACAO,
  IDIOMAS_SUGERIDOS,
  MOEDAS_SUGERIDAS,
  REGIOES,
} from '../constants';
import { rotuloDePaises } from '../format';
import { Icone } from './Planeta';

// Grupo de botões "pílula": clicar de novo na opção ativa remove o filtro.
function ChipGroup({ rotulo, opcoes, valor, rotuloTodos, onChange }) {
  return (
    <div className="field" role="group" aria-label={rotulo}>
      <span className="field__label">{rotulo}</span>
      <div className="chips">
        <button type="button" className="chip" aria-pressed={valor === ''} onClick={() => onChange('')}>
          {rotuloTodos}
        </button>
        {opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            className="chip"
            aria-pressed={valor === opcao.valor}
            onClick={() => onChange(valor === opcao.valor ? '' : opcao.valor)}
          >
            <Icone opcao={opcao} className="chip__icon" /> {opcao.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({ filtros, onChange, onLimpar, totalAtivos, erroPopulacao, opcoes, aberto, onAlternar }) {
  // Sugestões dos campos de idioma e moeda: a lista completa vinda do back-end (ou a lista curta, se ainda não chegou).
  const sugestoesDeIdiomas = opcoes
    ? [...opcoes.idiomas]
        .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome))
        .map((idioma) => [idioma.nome, rotuloDePaises(idioma.quantidade)])
    : IDIOMAS_SUGERIDOS;
  const sugestoesDeMoedas = opcoes ? opcoes.moedas.map((moeda) => [moeda.codigo, moeda.nome]) : MOEDAS_SUGERIDAS;

  const faixaAtiva = FAIXAS_POPULACAO.find(
    (faixa) => faixa.min === filtros.populacaoMinima && faixa.max === filtros.populacaoMaxima,
  );
  const semLimiteDePopulacao = filtros.populacaoMinima === '' && filtros.populacaoMaxima === '';

  return (
    <aside className="filters" aria-label="Filtros de busca">
      <button
        type="button"
        className="filters__toggle"
        onClick={onAlternar}
        aria-expanded={aberto}
        aria-controls="filtros-corpo"
      >
        <span>
          <span aria-hidden="true">🎛️</span> Filtros
          {totalAtivos > 0 && <span className="count-badge">{totalAtivos}</span>}
        </span>
        <span aria-hidden="true" className={`filters__chevron${aberto ? ' is-open' : ''}`}>▾</span>
      </button>

      <div id="filtros-corpo" className={`filters__body${aberto ? ' is-open' : ''}`}>
        <div className="filters__head">
          <h2 className="filters__title">
            Filtros
            {totalAtivos > 0 && <span className="count-badge">{totalAtivos}</span>}
          </h2>
          <button type="button" className="link-btn" onClick={onLimpar} disabled={totalAtivos === 0}>
            Limpar tudo
          </button>
        </div>

        <ChipGroup
          rotulo="Região"
          opcoes={REGIOES}
          valor={filtros.regiao}
          rotuloTodos="Todas"
          onChange={(valor) => onChange({ regiao: valor }, true)}
        />

        <ChipGroup
          rotulo="Clima"
          opcoes={CLIMAS}
          valor={filtros.clima}
          rotuloTodos="Todos"
          onChange={(valor) => onChange({ clima: valor }, true)}
        />

        <div className="field">
          <label className="field__label" htmlFor="filtro-idioma">Idioma</label>
          <input
            id="filtro-idioma"
            className="input"
            type="text"
            list="lista-idiomas"
            value={filtros.lingua}
            onChange={(e) => onChange({ lingua: e.target.value })}
            placeholder="Ex.: Portuguese"
            autoComplete="off"
          />
          <datalist id="lista-idiomas">
            {sugestoesDeIdiomas.map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </datalist>
          <span className="field__hint">Digite em inglês, como nos dados.</span>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="filtro-moeda">Moeda</label>
          <input
            id="filtro-moeda"
            className="input input--code"
            type="text"
            list="lista-moedas"
            value={filtros.moeda}
            onChange={(e) => onChange({ moeda: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) })}
            placeholder="Ex.: BRL"
            autoComplete="off"
            maxLength={3}
          />
          <datalist id="lista-moedas">
            {sugestoesDeMoedas.map(([codigo, nome]) => (
              <option key={codigo} value={codigo}>{nome}</option>
            ))}
          </datalist>
        </div>

        <div className="field" role="group" aria-label="População">
          <span className="field__label">População</span>
          <div className="chips">
            <button
              type="button"
              className="chip"
              aria-pressed={semLimiteDePopulacao}
              onClick={() => onChange({ populacaoMinima: '', populacaoMaxima: '' }, true)}
            >
              Qualquer
            </button>
            {FAIXAS_POPULACAO.map((faixa) => (
              <button
                key={faixa.id}
                type="button"
                className="chip chip--stack"
                aria-pressed={faixaAtiva?.id === faixa.id}
                onClick={() => onChange({ populacaoMinima: faixa.min, populacaoMaxima: faixa.max }, true)}
              >
                <span>{faixa.rotulo}</span>
                <small>{faixa.detalhe}</small>
              </button>
            ))}
          </div>

          <div className="range">
            <div className="range__item">
              <label htmlFor="filtro-pop-min">Mínima</label>
              <input
                id="filtro-pop-min"
                className="input"
                type="number"
                min="0"
                inputMode="numeric"
                value={filtros.populacaoMinima}
                onChange={(e) => onChange({ populacaoMinima: e.target.value })}
                placeholder="Habitantes"
                aria-invalid={Boolean(erroPopulacao)}
              />
            </div>
            <div className="range__item">
              <label htmlFor="filtro-pop-max">Máxima</label>
              <input
                id="filtro-pop-max"
                className="input"
                type="number"
                min="0"
                inputMode="numeric"
                value={filtros.populacaoMaxima}
                onChange={(e) => onChange({ populacaoMaxima: e.target.value })}
                placeholder="Habitantes"
                aria-invalid={Boolean(erroPopulacao)}
              />
            </div>
          </div>
          {erroPopulacao && <p className="field__error" role="alert">{erroPopulacao}</p>}
        </div>
      </div>
    </aside>
  );
}

export default FilterPanel;

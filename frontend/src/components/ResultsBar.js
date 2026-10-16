import React from 'react';
import { ORDENACOES } from '../constants';

// Contagem de resultados, filtros ativos (removíveis um a um) e ordenação.
function ResultsBar({ total, totalBase, ativos, ordem, onOrdem, carregando, comErro }) {
  return (
    <div className="results-bar">
      <div className="results-bar__top">
        <p className="results-count" aria-live="polite">
          {comErro ? (
            'Não foi possível buscar os países'
          ) : (
            <>
              <strong>{total}</strong> {total === 1 ? 'país encontrado' : 'países encontrados'}
              {totalBase && totalBase !== total ? <span className="results-count__base"> de {totalBase}</span> : null}
              {carregando && <span className="results-count__loading"> · atualizando…</span>}
            </>
          )}
        </p>

        <div className="sort">
          <label htmlFor="ordenacao">Ordenar por</label>
          <select id="ordenacao" className="select" value={ordem} onChange={(e) => onOrdem(e.target.value)}>
            {ORDENACOES.map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </select>
        </div>
      </div>

      {ativos.length > 0 && (
        <ul className="active-filters" aria-label="Filtros ativos">
          {ativos.map((filtro) => (
            <li key={filtro.chave}>
              <button
                type="button"
                className="tag"
                onClick={filtro.remover}
                aria-label={`Remover filtro ${filtro.rotulo}: ${filtro.texto}`}
              >
                <span className="tag__label">{filtro.rotulo}:</span> {filtro.texto}
                <span aria-hidden="true" className="tag__x">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ResultsBar;

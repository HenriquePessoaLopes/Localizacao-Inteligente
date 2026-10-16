import React from 'react';
import { climaDe, regiaoDe } from '../constants';
import { listaDe, populacaoCompacta, populacaoCompleta } from '../format';
import { Icone } from './Planeta';

// Mostra o primeiro valor e, se o país tiver mais, "+N" (a lista completa fica no detalhe do país).
function ValorComMais({ lista }) {
  if (lista.length === 0) return '—';
  return (
    <>
      {lista[0]}
      {lista.length > 1 && <small className="more-count" title={lista.join(', ')}> +{lista.length - 1}</small>}
    </>
  );
}

function CountryCard({ pais, indice, onAbrir }) {
  const regiao = regiaoDe(pais.regiao);
  const clima = climaDe(pais.clima);
  const temPopulacao = pais.populacao !== null && pais.populacao !== undefined;
  const idiomas = listaDe(pais.linguas || pais.lingua);
  const moedas = listaDe(pais.moedas || pais.moeda);

  return (
    <button
      type="button"
      className={`card card--${regiao.valor}`}
      onClick={() => onAbrir(pais)}
      style={{ animationDelay: `${Math.min(indice, 11) * 35}ms` }}
      aria-label={`Ver detalhes de ${pais.nome}`}
    >
      <span className="card__head">
        <span className="card__avatar" aria-hidden="true">
          <Icone opcao={regiao} />
        </span>
        <span className="card__title">
          <span className="card__name">{pais.nome}</span>
          <span className={`badge badge--${regiao.valor}`}>{regiao.rotulo}</span>
        </span>
      </span>

      <dl className="card__facts">
        <div>
          <dt>Idioma</dt>
          <dd><ValorComMais lista={idiomas} /></dd>
        </div>
        <div>
          <dt>Moeda</dt>
          <dd><ValorComMais lista={moedas} /></dd>
        </div>
        <div>
          <dt>Clima</dt>
          <dd><span aria-hidden="true">{clima.emoji}</span> {pais.clima || '—'}</dd>
        </div>
      </dl>

      <span className="card__population" title={temPopulacao ? `${populacaoCompleta(pais.populacao)} habitantes` : undefined}>
        <span className={`card__population-value${temPopulacao ? '' : ' is-missing'}`}>
          {populacaoCompacta(pais.populacao)}
        </span>
        {temPopulacao && <span className="card__population-label">habitantes</span>}
      </span>
    </button>
  );
}

export function CardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <span className="skeleton skeleton--avatar" />
      <span className="skeleton skeleton--line skeleton--wide" />
      <span className="skeleton skeleton--line" />
      <span className="skeleton skeleton--line" />
      <span className="skeleton skeleton--line skeleton--short" />
    </div>
  );
}

export default CountryCard;

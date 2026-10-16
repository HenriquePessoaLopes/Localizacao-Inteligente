import React, { useEffect, useRef } from 'react';
import { climaDe, regiaoDe } from '../constants';
import { listaDe, populacaoCompleta } from '../format';
import { Icone } from './Planeta';

const SELETOR_FOCAVEL = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Janela com os detalhes do país: fecha com Esc, clique fora ou no botão, e mantém o foco dentro dela.
function CountryModal({ pais, nomesDasMoedas = {}, onFechar, onVerRegiao }) {
  const painelRef = useRef(null);
  const regiao = regiaoDe(pais.regiao);
  const clima = climaDe(pais.clima);
  const idiomas = listaDe(pais.linguas || pais.lingua);
  const moedas = listaDe(pais.moedas || pais.moeda);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const painel = painelRef.current;
    painel.querySelector('[data-foco-inicial]')?.focus();
    document.body.classList.add('modal-open');

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') {
        onFechar();
        return;
      }
      if (evento.key !== 'Tab') return;
      const focaveis = Array.from(painel.querySelectorAll(SELETOR_FOCAVEL));
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.classList.remove('modal-open');
      if (elementoAnterior && elementoAnterior.focus) elementoAnterior.focus();
    };
  }, [onFechar]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div
        ref={painelRef}
        className={`modal modal--${regiao.valor}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <button type="button" className="modal__close" onClick={onFechar} aria-label="Fechar detalhes" data-foco-inicial>
          ×
        </button>

        <div className="modal__header">
          <span className="modal__avatar" aria-hidden="true">
            <Icone opcao={regiao} />
          </span>
          <div>
            <h2 id="modal-titulo" className="modal__title">{pais.nome}</h2>
            <span className={`badge badge--${regiao.valor}`}>{regiao.rotulo}</span>
          </div>
        </div>

        <dl className="modal__grid">
          <div className="fact">
            <dt>Clima</dt>
            <dd><span aria-hidden="true">{clima.emoji}</span> {pais.clima || '—'}</dd>
          </div>
          <div className="fact">
            <dt>População</dt>
            <dd>{populacaoCompleta(pais.populacao)}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>{idiomas.length > 1 ? `Idiomas (${idiomas.length})` : 'Idioma'}</dt>
            <dd>{idiomas.length > 0 ? idiomas.join(', ') : '—'}</dd>
          </div>
          <div className="fact fact--wide">
            <dt>{moedas.length > 1 ? `Moedas (${moedas.length})` : 'Moeda'}</dt>
            <dd>
              {moedas.length === 0 && '—'}
              <ul className="fact__list">
                {moedas.map((codigo) => (
                  <li key={codigo}>
                    <span className="fact__code">{codigo}</span>
                    {nomesDasMoedas[codigo] && <span className="fact__name">{nomesDasMoedas[codigo]}</span>}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <div className="modal__actions">
          {regiao.valor !== 'outra' && (
            <button type="button" className="btn btn--primary" onClick={() => onVerRegiao(regiao.valor)}>
              Ver outros países: {regiao.rotulo}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default CountryModal;

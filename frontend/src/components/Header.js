import React from 'react';
import { Planeta } from './Planeta';

function Header({ rota, tema, onAlternarTema, onAtualizarBase, atualizando }) {
  const proximoTema = tema === 'dark' ? 'claro' : 'escuro';
  const naPaginaSobre = rota === 'sobre';

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href="#/" aria-label="Localização Inteligente: voltar para a busca">
          <Planeta className="brand__logo" />
          <div className="brand__texts">
            <p className="brand__title">Localização Inteligente</p>
            <p className="brand__tagline">Encontre o país certo para o seu perfil</p>
          </div>
        </a>

        <div className="topbar__actions">
          <a
            className={`btn btn--ghost btn--sobre${naPaginaSobre ? ' is-active' : ''}`}
            href="#/sobre"
            aria-label="Sobre o projeto"
            aria-current={naPaginaSobre ? 'page' : undefined}
          >
            <svg className="btn__svg" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="7.8" r="1.2" fill="currentColor" />
            </svg>
            <span>Sobre</span>
          </a>
          <button
            type="button"
            className="btn btn--ghost btn--refresh"
            onClick={onAtualizarBase}
            disabled={atualizando}
            aria-label="Atualizar a base de países"
            title="Recarrega os países do arquivo de dados"
          >
            <span aria-hidden="true" className={`btn__icon${atualizando ? ' is-spinning' : ''}`}>🔄</span>
            <span className="btn__text">{atualizando ? 'Atualizando…' : 'Atualizar base'}</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onAlternarTema}
            aria-label={`Mudar para o tema ${proximoTema}`}
            title={`Mudar para o tema ${proximoTema}`}
          >
            <span aria-hidden="true">{tema === 'dark' ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

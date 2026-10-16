import React from 'react';
import terra from '../assets/terra.webp';

// Foto da Terra recortada em círculo. O tamanho vem da variável CSS --planeta (padrão: 1.1em).
export function Planeta({ className = '' }) {
  return (
    <span className={`planeta ${className}`.trim()} aria-hidden="true">
      <img src={terra} alt="" />
    </span>
  );
}

// Ícone de uma opção (região, clima...): a foto da Terra nas opções marcadas como `planeta`,
// ou o emoji da própria opção (como o 🧊 da Antártida e os do clima).
export function Icone({ opcao, className = '' }) {
  if (opcao.planeta) return <Planeta className={className} />;
  return (
    <span aria-hidden="true" className={className}>
      {opcao.emoji}
    </span>
  );
}

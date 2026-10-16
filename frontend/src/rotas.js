import { useEffect, useState } from 'react';

// Navegação simples por "hash" da URL, sem biblioteca extra:
//   #/       -> página de busca
//   #/sobre  -> página "Sobre o projeto"
// O botão voltar do navegador funciona normalmente.

const lerRota = () => (window.location.hash.replace(/^#\/?/, '').startsWith('sobre') ? 'sobre' : 'busca');

export function useRota() {
  const [rota, setRota] = useState(lerRota);

  useEffect(() => {
    const aoMudar = () => setRota(lerRota());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  return rota;
}

export const irParaBusca = () => {
  window.location.hash = '#/';
};

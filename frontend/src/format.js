// Funções de formatação e validação usadas pelo front.

const formatoCompacto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const formatoCompleto = new Intl.NumberFormat('pt-BR');

export const populacaoCompacta = (valor) =>
  valor === null || valor === undefined ? 'Não informada' : formatoCompacto.format(valor);

export const populacaoCompleta = (valor) =>
  valor === null || valor === undefined ? 'Não informada' : formatoCompleto.format(valor);

// Campo numérico vazio vira null (sem limite); o resto vira número.
export const paraNumero = (texto) => (texto === '' || texto === null || texto === undefined ? null : Number(texto));

// Texto curto para o filtro de população ativo: "≥ 10 mi", "≤ 50 mi" ou "10 mi a 50 mi".
export function resumoPopulacao(minimo, maximo) {
  const min = paraNumero(minimo);
  const max = paraNumero(maximo);
  if (min !== null && max !== null) return `${formatoCompacto.format(min)} a ${formatoCompacto.format(max)}`;
  if (min !== null) return `≥ ${formatoCompacto.format(min)}`;
  if (max !== null) return `≤ ${formatoCompacto.format(max)}`;
  return '';
}

// Mensagem de erro dos limites de população, ou null se estiverem corretos.
export function validarPopulacao(minimo, maximo) {
  const min = paraNumero(minimo);
  const max = paraNumero(maximo);
  if ((min !== null && min < 0) || (max !== null && max < 0)) return 'A população não pode ser negativa.';
  if (min !== null && max !== null && min > max) return 'A população mínima não pode ser maior que a máxima.';
  return null;
}

// Transforma "Portuguese, English" ou "BRL,USD" em ['Portuguese', 'English'] ou ['BRL', 'USD'].
export const listaDe = (texto) =>
  String(texto || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// "1 país" / "10 países"
export const rotuloDePaises = (quantidade) => `${quantidade} ${quantidade === 1 ? 'país' : 'países'}`;

// Corpo da requisição de busca, no formato que o back-end espera.
export const corpoDaBusca = (filtros) => ({
  regiao: filtros.regiao,
  clima: filtros.clima,
  lingua: filtros.lingua.trim(),
  moeda: filtros.moeda.trim(),
  populacaoMinima: paraNumero(filtros.populacaoMinima),
  populacaoMaxima: paraNumero(filtros.populacaoMaxima),
});

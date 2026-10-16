// Opções dos filtros e dados de apresentação (rótulos, ícones, sugestões).
// Os valores (`valor`) são exatamente o que o back-end espera receber.
// `planeta: true` faz a opção usar a foto da Terra como ícone (componente Planeta);
// as demais usam o `emoji`.

export const REGIOES = [
  { valor: 'americas', rotulo: 'Américas', planeta: true },
  { valor: 'europe', rotulo: 'Europa', planeta: true },
  { valor: 'asia', rotulo: 'Ásia', planeta: true },
  { valor: 'africa', rotulo: 'África', planeta: true },
  { valor: 'oceania', rotulo: 'Oceania', planeta: true },
  { valor: 'antarctic', rotulo: 'Antártida', emoji: '🧊' },
];

export const CLIMAS = [
  { valor: 'Tropical', rotulo: 'Tropical', emoji: '🌴' },
  { valor: 'Temperado', rotulo: 'Temperado', emoji: '🍃' },
  { valor: 'Continental', rotulo: 'Continental', emoji: '❄️' },
  { valor: 'Variado', rotulo: 'Variado', emoji: '🌦️' },
];

// Faixas prontas de população (limites inclusivos, em número de habitantes).
export const FAIXAS_POPULACAO = [
  { id: 'pequeno', rotulo: 'Pequeno', detalhe: 'até 1 mi', min: '', max: '999999' },
  { id: 'medio', rotulo: 'Médio', detalhe: '1 a 50 mi', min: '1000000', max: '49999999' },
  { id: 'grande', rotulo: 'Grande', detalhe: '50 a 200 mi', min: '50000000', max: '199999999' },
  { id: 'gigante', rotulo: 'Gigante', detalhe: '200 mi ou mais', min: '200000000', max: '' },
];

// Sugestões dos campos de texto. Os idiomas ficam em inglês porque é assim que estão nos dados.
export const IDIOMAS_SUGERIDOS = [
  ['Portuguese', 'Português'], ['Spanish', 'Espanhol'], ['English', 'Inglês'], ['French', 'Francês'],
  ['German', 'Alemão'], ['Italian', 'Italiano'], ['Chinese', 'Chinês'], ['Japanese', 'Japonês'],
  ['Korean', 'Coreano'], ['Arabic', 'Árabe'], ['Russian', 'Russo'], ['Hindi', 'Hindi'],
  ['Dutch', 'Holandês'], ['Swedish', 'Sueco'], ['Turkish', 'Turco'], ['Greek', 'Grego'],
];

export const MOEDAS_SUGERIDAS = [
  ['BRL', 'Real brasileiro'], ['USD', 'Dólar americano'], ['EUR', 'Euro'], ['GBP', 'Libra esterlina'],
  ['JPY', 'Iene japonês'], ['CNY', 'Yuan chinês'], ['INR', 'Rupia indiana'], ['MXN', 'Peso mexicano'],
  ['ARS', 'Peso argentino'], ['CAD', 'Dólar canadense'], ['AUD', 'Dólar australiano'], ['CHF', 'Franco suíço'],
];

export const ORDENACOES = [
  { valor: 'nome', rotulo: 'Nome (A a Z)' },
  { valor: 'populacaoDesc', rotulo: 'Maior população' },
  { valor: 'populacaoAsc', rotulo: 'Menor população' },
];

export const FILTROS_VAZIOS = {
  regiao: '',
  clima: '',
  lingua: '',
  moeda: '',
  populacaoMinima: '',
  populacaoMaxima: '',
};

const REGIAO_DESCONHECIDA = { valor: 'outra', rotulo: 'Sem região', planeta: true };
const CLIMA_DESCONHECIDO = { valor: '', rotulo: 'Desconhecido', emoji: '🌡️' };

// O back-end devolve a região como "Europe", "Americas"...; aqui ela vira a opção de exibição.
export const regiaoDe = (valor) =>
  REGIOES.find((r) => r.valor === String(valor || '').toLowerCase()) || REGIAO_DESCONHECIDA;

export const climaDe = (valor) => CLIMAS.find((c) => c.valor === valor) || CLIMA_DESCONHECIDO;

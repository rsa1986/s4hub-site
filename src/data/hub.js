// Posições dos módulos ao redor do centro do hub (viewBox 600x600).
// Calculadas pelo número de módulos: o primeiro fica no topo e os demais se distribuem no círculo.
// Usado pelo hub do Hero e pelos mini-hubs de Soluções, para que o desenho seja sempre o mesmo.
import { produtos } from './site.js';

export const hubCentro = { x: 300, y: 300 };
const RAIO = 232;

export function posicoesHub(total) {
  return Array.from({ length: total }, (_, i) => {
    const ang = ((-90 + (i * 360) / total) * Math.PI) / 180;
    return { x: Math.round(hubCentro.x + RAIO * Math.cos(ang)), y: Math.round(hubCentro.y + RAIO * Math.sin(ang)) };
  });
}

export const hubPos = posicoesHub(produtos.length);

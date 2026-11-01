const numberFormat = new Intl.NumberFormat('pt-BR');

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? 'Não informado' : numberFormat.format(value);
}

export function formatArea(km2: number | null | undefined): string {
  return km2 === null || km2 === undefined ? 'Não informado' : `${numberFormat.format(km2)} km²`;
}

export function formatList(items: string[]): string {
  return items.length > 0 ? items.join(', ') : 'Não informado';
}

const REGION_LABELS: Record<string, string> = {
  Africa: 'África',
  Americas: 'Américas',
  Antarctic: 'Antártida',
  Asia: 'Ásia',
  Europe: 'Europa',
  Oceania: 'Oceania',
};

export function regionLabel(region: string | null | undefined): string {
  if (!region) return 'Não informado';
  return REGION_LABELS[region] ?? region;
}

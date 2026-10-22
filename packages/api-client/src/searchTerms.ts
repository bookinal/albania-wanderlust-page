/**
 * Spelling variants of a place name, so a search for a city from the picker
 * list also matches how it's often written in listings:
 *   Durrës -> Durres | Vlorë -> Vlora, Vlore | Shkodër -> Shkodra, Shkoder
 *   Tirana -> Tiranë | Korçë -> Korce, Korca
 * (Albanian definite/indefinite endings and the ë/ç letters.)
 */
export const locationSearchVariants = (term: string): string[] => {
  const base = term.trim();
  if (!base) return [];

  const forms = new Set<string>([base]);
  if (/ër$/i.test(base)) forms.add(base.slice(0, -2) + "ra");
  else if (/ë$/i.test(base)) forms.add(base.slice(0, -1) + "a");
  else if (/a$/i.test(base)) forms.add(base.slice(0, -1) + "ë");

  const deaccent = (s: string) =>
    s.replace(/ë/g, "e").replace(/Ë/g, "E").replace(/ç/g, "c").replace(/Ç/g, "C");
  for (const form of [...forms]) forms.add(deaccent(form));

  return [...forms];
};

/**
 * PostgREST `or` filter: any column ILIKE any spelling variant of the term.
 * Characters that would break the filter syntax are dropped.
 */
export const buildLocationSearchFilter = (term: string, columns: string[]): string =>
  locationSearchVariants(term.replace(/[,()*%\\]/g, " "))
    .flatMap((variant) => columns.map((col) => `${col}.ilike.%${variant}%`))
    .join(",");

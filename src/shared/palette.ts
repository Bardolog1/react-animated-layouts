export function palette(colors: readonly string[] | undefined, fallback: readonly string[], min = 1): string[] {
  const list = colors && colors.length ? [...colors] : [...fallback];
  while (list.length < min) list.push(list[0]);
  return list;
}

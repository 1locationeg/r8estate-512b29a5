/** Fire a corridor engagement event for the journey progress bar */
export function fireCorridorEngage(zone: number, action: string) {
  window.dispatchEvent(
    new CustomEvent("corridor:engage", { detail: { zone, action } })
  );
}

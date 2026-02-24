export function intensityLabel(value: number): string {
  if (value === 0) return 'None';
  if (value <= 2)  return 'Mild';
  if (value <= 4)  return 'Moderate';
  if (value <= 6)  return 'Severe';
  if (value <= 8)  return 'Very Severe';
  return 'Worst Possible';
}

export function intensityColor(value: number): string {
  if (value === 0) return '#6BCB77';
  if (value <= 2)  return '#A8D672';
  if (value <= 4)  return '#FFD93D';
  if (value <= 6)  return '#FF9A3C';
  if (value <= 8)  return '#FF6B6B';
  return '#C62828';
}

export function intensityBg(value: number): string {
  if (value === 0) return 'bg-green-100 text-green-700';
  if (value <= 2)  return 'bg-lime-100 text-lime-700';
  if (value <= 4)  return 'bg-yellow-100 text-yellow-700';
  if (value <= 6)  return 'bg-orange-100 text-orange-700';
  if (value <= 8)  return 'bg-red-100 text-red-700';
  return 'bg-red-200 text-red-900';
}

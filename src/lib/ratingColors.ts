/**
 * Returns the appropriate color class for a star based on the rating value.
 * - Low rating (1-2): brand-red
 * - Moderate rating (3): accent (gold)
 * - High rating (4-5): primary (navy blue)
 */
export const getStarColorClass = (rating: number, starIndex: number): string => {
  // If this star is not filled (starIndex >= rating), return muted
  if (starIndex >= rating) {
    return "text-muted";
  }

  // Determine color based on rating value
  if (rating <= 2) {
    return "fill-brand-red text-brand-red";
  } else if (rating <= 3) {
    return "fill-accent text-accent";
  } else {
    return "fill-primary text-primary";
  }
};

/**
 * Returns the fill class for a filled star based on rating.
 */
export const getRatingColorClass = (rating: number): string => {
  if (rating <= 2) {
    return "fill-brand-red text-brand-red";
  } else if (rating <= 3) {
    return "fill-accent text-accent";
  } else {
    return "fill-primary text-primary";
  }
};

/**
 * Get URL parameters as an object.
 */
export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Get the league slug from URL.
 */
export function getLeagueSlug(): string | null {
  const params = getUrlParams();
  let slug = params.get('league');

  // If no URL param, check localStorage for saved league
  if (!slug) {
    slug = localStorage.getItem('currentLeagueSlug');
  }

  return slug;
}

/**
 * Check if admin mode is enabled via URL param.
 */
export function isAdminOverride(): boolean {
  return getUrlParams().get('isAdmin') === 'true';
}

/**
 * Save the current league slug to localStorage and update URL.
 */
export function saveLeagueSlug(slug: string): void {
  localStorage.setItem('currentLeagueSlug', slug);

  // Update URL to reflect the league (without reload)
  const params = getUrlParams();
  if (!params.get('league')) {
    const newUrl = `${window.location.pathname}?league=${slug}`;
    window.history.replaceState({}, '', newUrl);
  }
}

/**
 * Generate a URL for a league.
 */
export function getLeagueUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}?league=${slug}`;
}

/**
 * Convert a league name to a URL-friendly slug.
 */
export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

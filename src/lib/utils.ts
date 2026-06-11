const TOP_COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Netherlands"
];

export function isTopCountry(country: string): boolean {
  return TOP_COUNTRIES.some(c => country.toLowerCase().includes(c.toLowerCase()));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getCountryFromIP(ip: string): string {
  if (ip === "::1" || ip === "127.0.0.1") return "Localhost";
  return ip;
}

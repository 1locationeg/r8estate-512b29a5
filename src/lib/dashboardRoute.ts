export function getDashboardRouteForRole(role: string | null | undefined): string {
  const isProfessional = typeof window !== "undefined" && localStorage.getItem("oauth_account_kind") === "professional";
  if (role === "admin") return "/admin";
  if (role === "business") return isProfessional ? "/pro-dashboard" : "/business";
  return "/buyer";
}
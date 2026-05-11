export function getDashboardRouteForRole(role: string | null | undefined, accountKind?: string | null): string {
  const isProfessional = accountKind === "professional" || (
    typeof window !== "undefined" && localStorage.getItem("oauth_account_kind") === "professional"
  );
  if (role === "admin") return "/admin";
  if (role === "business") return isProfessional ? "/pro-dashboard" : "/business";
  return "/buyer";
}
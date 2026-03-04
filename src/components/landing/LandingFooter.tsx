import logoIcon from "@/assets/logo-icon.png";

export const LandingFooter = () => (
  <footer className="py-8 md:py-12 border-t border-border bg-card">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logoIcon} alt="R8ESTATE" className="h-8 w-auto" />
          <span className="text-lg font-extrabold">
            <span className="text-brand-red">R8</span>
            <span className="text-primary">ESTATE</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 R8ESTATE. All rights reserved. Reviews Always Right.</p>
      </div>
    </div>
  </footer>
);

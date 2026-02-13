import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { developers } from "@/data/mockData";
import { DeveloperDirectoryCard } from "@/components/DeveloperDirectoryCard";
import { DeveloperDetailModal } from "@/components/DeveloperDetailModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Developer } from "@/data/mockData";
import logoIcon from "@/assets/logo-icon.png";
import { ArrowLeft } from "lucide-react";

const DeveloperDirectory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={logoIcon}
                alt="R8ESTATE"
                className="h-14 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold inline-flex">
                <span className="text-brand-red">R8</span>
                <span className="text-primary">ESTATE</span>
              </h1>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("directory.majorDevelopers")}
          </h2>
          <p className="text-muted-foreground">
            {t("directory.exploreDescription")}
          </p>
        </div>

        {/* Developer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((developer) => (
            <DeveloperDirectoryCard
              key={developer.id}
              developer={developer}
              onClick={() => setSelectedDeveloper(developer)}
            />
          ))}
        </div>
      </main>

      {/* Modal */}
      <DeveloperDetailModal
        developer={selectedDeveloper}
        open={!!selectedDeveloper}
        onClose={() => setSelectedDeveloper(null)}
      />
    </div>
  );
};

export default DeveloperDirectory;

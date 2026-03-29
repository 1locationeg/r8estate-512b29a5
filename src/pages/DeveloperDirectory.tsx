import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { developers } from "@/data/mockData";
import { DeveloperDirectoryCard } from "@/components/DeveloperDirectoryCard";
import { DeveloperDetailModal } from "@/components/DeveloperDetailModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";
import { Developer } from "@/data/mockData";
import { PageHeader } from "@/components/PageHeader";

const DeveloperDirectory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={t("directory.majorDevelopers", "Developer Directory")}
        breadcrumbs={[{ label: t("directory.majorDevelopers", "Developer Directory") }]}
        rightSlot={<LanguageSwitcher />}
      />

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

      <Footer />

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

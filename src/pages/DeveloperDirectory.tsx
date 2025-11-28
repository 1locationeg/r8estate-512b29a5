import { useState } from "react";
import { developers } from "@/data/mockData";
import { DeveloperDirectoryCard } from "@/components/DeveloperDirectoryCard";
import { DeveloperDetailModal } from "@/components/DeveloperDetailModal";
import { Developer } from "@/data/mockData";

const DeveloperDirectory = () => {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">R8ESTATE</h1>
          <p className="text-muted-foreground mt-2">Developer Directory</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Major Real Estate Developers
          </h2>
          <p className="text-muted-foreground">
            Explore public sentiment and reputation data for leading developers in the region
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

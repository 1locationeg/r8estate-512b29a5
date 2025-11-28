import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Which developer or project are you investigating?"
          className="w-full h-16 pl-14 pr-6 text-lg border-2 border-border focus:border-primary rounded-2xl shadow-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        <span className="text-sm text-muted-foreground">Popular searches:</span>
        <button className="text-sm text-primary hover:underline">Emaar Properties</button>
        <span className="text-muted-foreground">•</span>
        <button className="text-sm text-primary hover:underline">Dubai Creek Harbour</button>
        <span className="text-muted-foreground">•</span>
        <button className="text-sm text-primary hover:underline">Downtown Dubai</button>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Search, Plus, Trash2, Loader2, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  query: string;
  filters: Record<string, any>;
  notify_enabled: boolean;
  created_at: string;
}

export const SavedSearchWidget = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [newQuery, setNewQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSearches();
  }, [user]);

  const fetchSearches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSearches((data as SavedSearch[]) || []);
    setLoading(false);
  };

  const addSearch = async () => {
    if (!user || !newQuery.trim()) return;
    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      query: newQuery.trim(),
      filters: {},
      notify_enabled: true,
    });
    if (error) {
      toast.error("Failed to save search");
      return;
    }
    toast.success("Search alert saved!");
    setNewQuery("");
    setShowAdd(false);
    fetchSearches();
  };

  const toggleNotify = async (id: string, current: boolean) => {
    await supabase.from("saved_searches").update({ notify_enabled: !current }).eq("id", id);
    setSearches(prev => prev.map(s => s.id === id ? { ...s, notify_enabled: !current } : s));
  };

  const deleteSearch = async (id: string) => {
    await supabase.from("saved_searches").delete().eq("id", id);
    setSearches(prev => prev.filter(s => s.id !== id));
    toast.success("Search alert removed");
  };

  if (!user) return null;

  return (
    <Card className="p-5 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Search Alerts</h3>
          {searches.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{searches.length}</Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Add new search */}
      {showAdd && (
        <div className="flex gap-2 mb-4">
          <Input
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="e.g. New Cairo apartments, 3BR villas..."
            className="text-sm"
            onKeyDown={(e) => e.key === "Enter" && addSearch()}
          />
          <Button size="sm" onClick={addSearch} disabled={!newQuery.trim()}>
            Save
          </Button>
        </div>
      )}

      {/* Saved searches list */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : searches.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No saved searches yet</p>
          <p className="text-xs mt-1">Save a search to get notified about new matches</p>
        </div>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border"
            >
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm text-foreground truncate">{search.query}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleNotify(search.id, search.notify_enabled)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={search.notify_enabled ? "Disable alerts" : "Enable alerts"}
                >
                  {search.notify_enabled ? (
                    <Bell className="w-4 h-4 text-primary" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteSearch(search.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-3">
        Get notified when new businesses, deals, or reviews match your saved searches
      </p>
    </Card>
  );
};

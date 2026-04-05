import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BUSINESS_CATEGORIES, type BusinessCategoryValue } from '@/data/businessCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessCategoryPickerProps {
  businessId: string;
  currentCategories: string[];
  onUpdated?: (categories: string[]) => void;
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
}

export const BusinessCategoryPicker = ({
  businessId,
  currentCategories,
  onUpdated,
  readOnly = false,
  compact = false,
  className,
}: BusinessCategoryPickerProps) => {
  const [selected, setSelected] = useState<string[]>(currentCategories || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelected(currentCategories || []);
  }, [currentCategories]);

  const toggleCategory = (value: string) => {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('business_profiles')
      .update({ categories: selected })
      .eq('id', businessId);

    if (error) {
      console.error('Error saving categories:', error);
      toast.error('Failed to save categories');
    } else {
      toast.success('Categories updated');
      onUpdated?.(selected);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setSelected(currentCategories || []);
    setIsEditing(false);
  };

  const selectedLabels = selected
    .map(v => BUSINESS_CATEGORIES.find(c => c.value === v))
    .filter(Boolean);

  // Read-only display
  if (readOnly || (!isEditing && !compact)) {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {selectedLabels.length > 0 ? (
          selectedLabels.map(cat => (
            <Badge key={cat!.value} variant="secondary" className="text-xs gap-1">
              <Tag className="w-3 h-3" />
              {cat!.label}
            </Badge>
          ))
        ) : (
          !readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-3 h-3" /> Add Categories
            </Button>
          )
        )}
        {!readOnly && selectedLabels.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>
    );
  }

  // Compact mode: always show picker inline
  // Editing mode: full picker
  return (
    <div className={cn('space-y-3', className)}>
      {!compact && (
        <p className="text-sm text-muted-foreground">
          Select the categories that describe your business:
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {BUSINESS_CATEGORIES.map(cat => {
          const isSelected = selected.includes(cat.value);
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleCategory(cat.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              )}
            >
              {cat.label}
              {isSelected && <X className="w-3 h-3 inline ms-1" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Save Categories
        </Button>
        {!compact && (
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

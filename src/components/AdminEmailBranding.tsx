import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Eye, Mail, Palette, Image, Building2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailBrandSettings {
  email_brand_name: string;
  email_logo_url: string;
  email_primary_color: string;
  email_accent_color: string;
  email_support_email: string;
  email_footer_text: string;
  email_website_url: string;
}

const DEFAULT_SETTINGS: EmailBrandSettings = {
  email_brand_name: 'R8ESTATE',
  email_logo_url: '',
  email_primary_color: '#0a3d62',
  email_accent_color: '#ed1b40',
  email_support_email: '',
  email_footer_text: '© R8ESTATE. All rights reserved.',
  email_website_url: '',
};

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof EmailBrandSettings)[];

const AdminEmailBranding = () => {
  const [settings, setSettings] = useState<EmailBrandSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', SETTINGS_KEYS);

        if (error) throw error;

        if (data && data.length > 0) {
          const loaded = { ...DEFAULT_SETTINGS };
          data.forEach((row) => {
            if (row.key in loaded) {
              (loaded as any)[row.key] = row.value;
            }
          });
          setSettings(loaded);
        }
      } catch (err) {
        console.error('Failed to load email settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const key of SETTINGS_KEYS) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert(
            { key, value: settings[key], updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
        if (error) throw error;
      }
      toast.success('Email branding settings saved!');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: keyof EmailBrandSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Branding
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize how your auth emails look — password resets, verification, and more.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 me-1" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Save className="w-4 h-4 me-1" />}
            Save
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Brand Identity */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Brand Identity
            </h3>

            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={settings.email_brand_name}
                onChange={(e) => updateField('email_brand_name', e.target.value)}
                placeholder="R8ESTATE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="flex items-center gap-1">
                <Image className="w-3.5 h-3.5" />
                Logo URL
              </Label>
              <Input
                id="logoUrl"
                value={settings.email_logo_url}
                onChange={(e) => updateField('email_logo_url', e.target.value)}
                placeholder="https://yourdomain.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">Recommended: 200×60px PNG with transparent background</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                value={settings.email_website_url}
                onChange={(e) => updateField('email_website_url', e.target.value)}
                placeholder="https://r8estate.lovable.app"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Brand Colors
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    value={settings.email_primary_color}
                    onChange={(e) => updateField('email_primary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={settings.email_primary_color}
                    onChange={(e) => updateField('email_primary_color', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="accentColor"
                    value={settings.email_accent_color}
                    onChange={(e) => updateField('email_accent_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={settings.email_accent_color}
                    onChange={(e) => updateField('email_accent_color', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Footer */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Contact & Footer
            </h3>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.email_support_email}
                onChange={(e) => updateField('email_support_email', e.target.value)}
                placeholder="support@r8estate.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Textarea
                id="footerText"
                value={settings.email_footer_text}
                onChange={(e) => updateField('email_footer_text', e.target.value)}
                placeholder="© R8ESTATE. All rights reserved."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Email Preview</p>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-border">
              {/* Header */}
              <div
                className="px-6 py-5 text-center"
                style={{ backgroundColor: settings.email_primary_color }}
              >
                {settings.email_logo_url ? (
                  <img
                    src={settings.email_logo_url}
                    alt={settings.email_brand_name}
                    className="h-10 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-white">{settings.email_brand_name}</h1>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-4">
                <h2 className="text-lg font-semibold" style={{ color: settings.email_primary_color }}>
                  Reset Your Password
                </h2>
                <p className="text-sm text-gray-600">
                  Hello! You requested a password reset for your {settings.email_brand_name} account. Click the button below to set a new password.
                </p>
                <div className="text-center py-2">
                  <span
                    className="inline-block px-6 py-3 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: settings.email_accent_color }}
                  >
                    Reset Password
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">{settings.email_footer_text}</p>
                {settings.email_support_email && (
                  <p className="text-xs text-gray-400 mt-1">
                    Need help? Contact{' '}
                    <span style={{ color: settings.email_primary_color }}>{settings.email_support_email}</span>
                  </p>
                )}
                {settings.email_website_url && (
                  <p className="text-xs text-gray-400 mt-1">{settings.email_website_url}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
        <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">How it works</p>
          <p className="text-xs text-muted-foreground mt-1">
            These settings control the branding of all authentication emails sent from the platform — password resets, email verifications, and magic links. Changes take effect after saving. Make sure your email domain is configured in Cloud → Emails for branded sending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailBranding;

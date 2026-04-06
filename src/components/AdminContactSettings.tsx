// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Save, Loader2, Mail, Phone, MessageCircle, MapPin, Clock, Globe, Eye, Bold, Italic, Link, List, Heading2, Image, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

const SETTING_KEYS = [
  "contact_page_title",
  "contact_page_subtitle",
  "contact_page_body",
  "contact_email",
  "contact_phone",
  "contact_whatsapp",
  "contact_facebook_messenger",
  "contact_office_address",
  "contact_office_hours",
  "contact_map_embed",
];

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-primary/10 text-primary" },
  { value: "read", label: "Read", color: "bg-accent text-accent-foreground" },
  { value: "replied", label: "Replied", color: "bg-trust-excellent/10 text-trust-excellent" },
  { value: "archived", label: "Archived", color: "bg-muted text-muted-foreground" },
];

const AdminContactSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [bodyTab, setBodyTab] = useState("edit");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSettings();
    fetchSubmissions();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", SETTING_KEYS);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((r) => (map[r.key] = r.value));
      setSettings(map);
    }
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    setSubLoading(true);
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) {
      setSubmissions(data);
      const notes: Record<string, string> = {};
      data.forEach((s) => { notes[s.id] = s.admin_notes || ""; });
      setAdminNotes(notes);
    }
    setSubLoading(false);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const key of SETTING_KEYS) {
        const value = settings[key] || "";
        const { error } = await supabase
          .from("platform_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
        if (error) throw error;
      }
      toast.success("Contact page settings saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status })
      .eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success("Status updated");
  };

  const saveAdminNote = async (id: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ admin_notes: adminNotes[id] || "" })
      .eq("id", id);
    if (error) { toast.error("Failed to save note"); return; }
    toast.success("Note saved");
  };

  const insertAtCursor = (prefix: string, suffix: string = "") => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = settings.contact_page_body || "";
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    updateSetting("contact_page_body", newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const newCount = submissions.filter((s) => s.status === "new").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Contact Page Management</h2>
        <p className="text-sm text-muted-foreground">Configure the contact page content and manage submissions</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Page Settings</TabsTrigger>
          <TabsTrigger value="inbox" className="gap-1.5">
            Inbox
            {newCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">{newCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-6 mt-4">
          {/* Page Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Content</CardTitle>
              <CardDescription>Title, subtitle, and body text shown on the contact page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Page Title</label>
                <Input value={settings.contact_page_title || ""} onChange={(e) => updateSetting("contact_page_title", e.target.value)} placeholder="تواصل معنا" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subtitle</label>
                <Input value={settings.contact_page_subtitle || ""} onChange={(e) => updateSetting("contact_page_subtitle", e.target.value)} placeholder="نحن هنا لمساعدتك" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Page Body (Markdown)</label>
                <div className="flex gap-1 mb-2 flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("**", "**")}><Bold className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("*", "*")}><Italic className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("[", "](url)")}><Link className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("## ", "")}><Heading2 className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("- ", "")}><List className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("![alt](", ")")}><Image className="w-3.5 h-3.5" /></Button>
                </div>
                <Tabs value={bodyTab} onValueChange={setBodyTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="edit" className="text-xs h-7">Edit</TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs h-7">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-2">
                    <Textarea
                      ref={bodyRef}
                      value={settings.contact_page_body || ""}
                      onChange={(e) => updateSetting("contact_page_body", e.target.value)}
                      rows={8}
                      placeholder="Additional rich text content..."
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="min-h-[120px] rounded-md border border-input bg-background p-3 prose prose-sm dark:prose-invert" dir="auto">
                      <ReactMarkdown>{settings.contact_page_body || "*No content yet*"}</ReactMarkdown>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Contact Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Channels</CardTitle>
              <CardDescription>Email, phone, WhatsApp, and Messenger details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                <Input value={settings.contact_email || ""} onChange={(e) => updateSetting("contact_email", e.target.value)} placeholder="support@r8estate.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                <Input value={settings.contact_phone || ""} onChange={(e) => updateSetting("contact_phone", e.target.value)} placeholder="+20 xxx xxx xxxx" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp Number</label>
                <Input value={settings.contact_whatsapp || ""} onChange={(e) => updateSetting("contact_whatsapp", e.target.value)} placeholder="+201234567890" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Messenger Username</label>
                <Input value={settings.contact_facebook_messenger || ""} onChange={(e) => updateSetting("contact_facebook_messenger", e.target.value)} placeholder="r8estate" />
              </div>
            </CardContent>
          </Card>

          {/* Office Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Office Information</CardTitle>
              <CardDescription>Address, working hours, and map embed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Office Address</label>
                <Input value={settings.contact_office_address || ""} onChange={(e) => updateSetting("contact_office_address", e.target.value)} placeholder="Cairo, Egypt" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Working Hours</label>
                <Input value={settings.contact_office_hours || ""} onChange={(e) => updateSetting("contact_office_hours", e.target.value)} placeholder="Sun-Thu: 9AM - 6PM" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Google Maps Embed URL</label>
                <Input value={settings.contact_map_embed || ""} onChange={(e) => updateSetting("contact_map_embed", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveSettings} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </Button>
        </TabsContent>

        {/* INBOX TAB */}
        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Submissions</CardTitle>
              <CardDescription>{submissions.length} total · {newCount} new</CardDescription>
            </CardHeader>
            <CardContent>
              {subLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No submissions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((s) => {
                        const statusInfo = STATUS_OPTIONS.find((o) => o.value === s.status) || STATUS_OPTIONS[0];
                        const isExpanded = expandedId === s.id;
                        return (
                          <>
                            <TableRow
                              key={s.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => {
                                setExpandedId(isExpanded ? null : s.id);
                                if (!isExpanded && s.status === "new") updateSubmissionStatus(s.id, "read");
                              }}
                            >
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium">{s.name}</p>
                                  <p className="text-xs text-muted-foreground">{s.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{s.subject}</TableCell>
                              <TableCell>
                                <Badge className={`${statusInfo.color} text-[10px]`}>{statusInfo.label}</Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(s.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow key={`${s.id}-detail`}>
                                <TableCell colSpan={5} className="bg-muted/30">
                                  <div className="space-y-3 py-2">
                                    {s.phone && <p className="text-xs"><span className="font-medium">Phone:</span> {s.phone}</p>}
                                    <div>
                                      <p className="text-xs font-medium mb-1">Message:</p>
                                      <p className="text-sm whitespace-pre-wrap bg-background rounded-md p-3 border border-border">{s.message}</p>
                                    </div>
                                    <div className="flex items-end gap-3">
                                      <div className="flex-1">
                                        <label className="text-xs font-medium mb-1 block">Admin Notes</label>
                                        <Textarea
                                          value={adminNotes[s.id] || ""}
                                          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                          rows={2}
                                          placeholder="Internal notes..."
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); saveAdminNote(s.id); }}>
                                        Save Note
                                      </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs font-medium">Status:</label>
                                      <Select value={s.status} onValueChange={(v) => updateSubmissionStatus(s.id, v)}>
                                        <SelectTrigger className="w-[140px] h-8" onClick={(e) => e.stopPropagation()}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {STATUS_OPTIONS.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContactSettings;

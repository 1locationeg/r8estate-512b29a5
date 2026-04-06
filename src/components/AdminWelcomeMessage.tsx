import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Eye, Edit3, Bold, Italic, Link, List, Heading2, Image, Loader2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const DEFAULT_TITLE = "مرحباً بك في R8ESTATE! 🎉";
const DEFAULT_MESSAGE = `السلام عليكم.. نورت منصة R8ESTATE.

نتمنى أن نقدم لك تجربة مفيدة وممتعة تستحق وقتك الثمين الذي تشرفنا به على المنصة.

نحيطك علماً أن المنصة حالياً في الفترة التجريبية، لذا نرحب جداً باقتراحاتكم للتحسين والتطوير، وكذلك يسعدنا مساعدتكم في حل أي صعوبات واجهتكم أثناء عملية التسجيل أو التقييم أو المشاركة في مجتمع R8ESTATE.

خالص تحياتنا وتقديرنا.. ❤️

يمكنك الاطلاع على تجارب الأعضاء وطرح تساؤلاتك في مجتمعنا عبر الرابط:

[مجتمع R8ESTATE](https://meter.r8estate.com/community)`;

const AdminWelcomeMessage = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["welcome_message_title", "welcome_message_body"]);

      if (data) {
        const titleRow = data.find(r => r.key === "welcome_message_title");
        const bodyRow = data.find(r => r.key === "welcome_message_body");
        if (titleRow) setTitle(titleRow.value);
        if (bodyRow) setMessage(bodyRow.value);
      }
    } catch (err) {
      console.error("Failed to fetch welcome message settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Upsert title
      const { error: e1 } = await supabase
        .from("platform_settings")
        .upsert({ key: "welcome_message_title", value: title }, { onConflict: "key" });

      // Upsert body
      const { error: e2 } = await supabase
        .from("platform_settings")
        .upsert({ key: "welcome_message_body", value: message }, { onConflict: "key" });

      if (e1 || e2) throw e1 || e2;

      toast.success("تم حفظ رسالة الترحيب بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("فشل في حفظ الرسالة");
    } finally {
      setSaving(false);
    }
  };

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = message.substring(start, end) || placeholder;
    const newText = message.substring(0, start) + before + selected + after + message.substring(end);
    setMessage(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const resetToDefault = () => {
    setTitle(DEFAULT_TITLE);
    setMessage(DEFAULT_MESSAGE);
    toast.info("تم استعادة الرسالة الافتراضية (لم يتم الحفظ بعد)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            رسالة الترحيب للأعضاء الجدد
          </CardTitle>
          <CardDescription>
            هذه الرسالة تُرسل تلقائياً كإشعار لكل عضو جديد عند التسجيل. يمكنك استخدام Markdown للتنسيق.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">عنوان الإشعار</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              dir="auto"
              className="text-base"
            />
          </div>

          {/* Body with toolbar */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">نص الرسالة</label>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2">
                <TabsTrigger value="edit" className="gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> تحرير
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> معاينة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-2">
                {/* Markdown toolbar */}
                <div className="flex flex-wrap gap-1 p-1.5 bg-muted/50 rounded-lg border">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("**", "**", "نص عريض")} title="Bold">
                    <Bold className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("*", "*", "نص مائل")} title="Italic">
                    <Italic className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("## ", "", "عنوان فرعي")} title="Heading">
                    <Heading2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("[", "](https://)", "نص الرابط")} title="Link">
                    <Link className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("- ", "", "عنصر قائمة")} title="List">
                    <List className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("![", "](https://image-url.jpg)", "وصف الصورة")} title="Image">
                    <Image className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  dir="auto"
                  rows={14}
                  className="font-mono text-sm leading-relaxed"
                  placeholder="اكتب رسالة الترحيب هنا..."
                />
              </TabsContent>

              <TabsContent value="preview">
                <div className="border rounded-lg p-4 min-h-[300px] bg-background">
                  <div className="mb-3 pb-2 border-b">
                    <h3 className="font-bold text-lg" dir="auto">{title}</h3>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert text-foreground" dir="auto">
                    <ReactMarkdown
                      components={{
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                            {children}
                          </a>
                        ),
                        img: ({ src, alt }) => (
                          <img src={src} alt={alt || ""} className="rounded-lg max-w-full max-h-64 object-cover my-2" />
                        ),
                      }}
                    >
                      {message}
                    </ReactMarkdown>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button onClick={saveSettings} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ التغييرات
            </Button>
            <Button variant="outline" onClick={resetToDefault} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              استعادة الافتراضي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed" dir="rtl">
            💡 <strong>ملاحظة:</strong> التغييرات ستُطبق على الأعضاء الجدد فقط الذين يسجلون بعد الحفظ. الأعضاء الحاليون لن تتأثر رسائلهم السابقة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWelcomeMessage;

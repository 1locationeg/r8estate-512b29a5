// @ts-nocheck
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1, "الموضوع مطلوب").max(200),
  message: z.string().trim().min(1, "الرسالة مطلوبة").max(2000),
});

const SUBJECTS = [
  { value: "general", labelAr: "استفسار عام", labelEn: "General Inquiry" },
  { value: "support", labelAr: "دعم فني", labelEn: "Technical Support" },
  { value: "feedback", labelAr: "اقتراح أو ملاحظة", labelEn: "Feedback" },
  { value: "business", labelAr: "استفسار تجاري", labelEn: "Business Inquiry" },
  { value: "partnership", labelAr: "شراكة", labelEn: "Partnership" },
  { value: "report", labelAr: "بلاغ", labelEn: "Report an Issue" },
];

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === "ar";

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .like("key", "contact_%");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => (map[r.key] = r.value));
        setSettings(map);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        user_id: user?.id || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        subject: form.subject,
        message: form.message.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success(isRTL ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!");
    } catch (err) {
      toast.error(isRTL ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const title = settings.contact_page_title || (isRTL ? "تواصل معنا" : "​Contact Us ");
  const subtitle = settings.contact_page_subtitle || (isRTL ? "نحن هنا لمساعدتك. لا تتردد فى طلب المساعدة فوراَ" : "We’re here to help. Please don’t hesitate to ask for help straight away.");
  const body = settings.contact_page_body || "";
  const whatsapp = settings.contact_whatsapp;
  const messenger = settings.contact_facebook_messenger;
  const email = settings.contact_email;
  const phone = settings.contact_phone;
  const address = settings.contact_office_address;
  const hours = settings.contact_office_hours;
  const mapEmbed = settings.contact_map_embed;

  const contactCards = [
    email && {
      icon: Mail,
      label: isRTL ? "البريد الإلكتروني" : "Email",
      value: email,
      href: `mailto:${email}`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    phone && {
      icon: Phone,
      label: isRTL ? "الهاتف" : "Phone",
      value: phone,
      href: `tel:${phone}`,
      color: "text-trust-excellent",
      bg: "bg-trust-excellent/10",
    },
    whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: whatsapp,
      href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`,
      color: "text-trust-excellent",
      bg: "bg-trust-excellent/10",
    },
    messenger && {
      icon: MessageCircle,
      label: "Messenger",
      value: `m.me/${messenger}`,
      href: `https://m.me/${encodeURIComponent(messenger)}`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    address && {
      icon: MapPin,
      label: isRTL ? "العنوان" : "Address",
      value: address,
      href: null,
      color: "text-brand-red",
      bg: "bg-brand-red/10",
    },
    hours && {
      icon: Clock,
      label: isRTL ? "ساعات العمل" : "Working Hours",
      value: hours,
      href: null,
      color: "text-accent-foreground",
      bg: "bg-accent/50",
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar
        userMode="buyers"
        onSwitchToBusinessView={() => {}}
        onSwitchToBuyerView={() => {}}
        togglePulse={false}
        onSignOut={() => {}}
        getDashboardRoute={() => "/buyer"}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Form Column */}
          <div className="lg:col-span-3">
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-trust-excellent/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-trust-excellent" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {isRTL ? "تم إرسال رسالتك بنجاح! ✨" : "Message Sent Successfully! ✨"}
                    </h3>
                    <p className="text-muted-foreground">
                      {isRTL
                        ? "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن."
                        : "Thank you for reaching out. We'll get back to you as soon as possible."}
                    </p>
                    <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                      {isRTL ? "إرسال رسالة أخرى" : "Send Another Message"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {isRTL ? "أرسل لنا رسالة" : "Send us a message"}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {isRTL ? "الاسم *" : "Name *"}
                        </label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {isRTL ? "البريد الإلكتروني *" : "Email *"}
                        </label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder={isRTL ? "بريدك الإلكتروني" : "your@email.com"}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {isRTL ? "رقم الهاتف" : "Phone"}
                        </label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder={isRTL ? "رقم الهاتف (اختياري)" : "Phone (optional)"}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {isRTL ? "الموضوع *" : "Subject *"}
                        </label>
                        <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                          <SelectTrigger className={errors.subject ? "border-destructive" : ""}>
                            <SelectValue placeholder={isRTL ? "اختر الموضوع" : "Select subject"} />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {isRTL ? s.labelAr : s.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {isRTL ? "الرسالة *" : "Message *"}
                      </label>
                      <Textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={isRTL ? "اكتب رسالتك هنا..." : "Type your message here..."}
                        rows={5}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{form.message.length}/2000</p>
                    </div>

                    <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isRTL ? "إرسال الرسالة" : "Send Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Column */}
          <div className="lg:col-span-2 space-y-4">
            {contactCards.map((card: any, i) => (
              <Card
                key={i}
                className="border-border/50 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => card.href && window.open(card.href, "_blank")}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{card.label}</p>
                    <p className="text-sm font-semibold text-foreground break-all">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rich text body */}
        {body && (
          <div className="max-w-4xl mx-auto mt-12 prose prose-sm dark:prose-invert" dir="auto">
            <ReactMarkdown>{body}</ReactMarkdown>
          </div>
        )}

        {/* Map embed */}
        {mapEmbed && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
              <iframe
                src={mapEmbed}
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;

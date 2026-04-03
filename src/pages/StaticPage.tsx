import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const PAGES: Record<string, { title: string; content: string }> = {
  about: {
    title: "Our Story",
    content: "R8ESTATE was founded to bring transparency and trust to the Egyptian real estate market. We empower buyers, investors, and businesses with verified reviews, honest insights, and a community-driven platform that holds the industry to a higher standard.",
  },
  careers: {
    title: "Join Our Team",
    content: "We're always looking for talented people who are passionate about real estate and technology. Check back soon for open positions, or reach out to us directly at careers@r8estate.com.",
  },
  contact: {
    title: "Contact Us",
    content: "Have a question or feedback? We'd love to hear from you. Email us at support@r8estate.com and our team will get back to you within 24 hours.",
  },
  press: {
    title: "Press Room",
    content: "For media inquiries, press kits, and partnership opportunities, please contact our communications team at press@r8estate.com.",
  },
  privacy: {
    title: "Privacy Policy",
    content: "Your privacy is important to us. R8ESTATE collects and processes personal data in accordance with applicable data protection laws. We use your information to provide and improve our services, personalize your experience, and communicate with you. We do not sell your personal data to third parties. For full details, contact privacy@r8estate.com.",
  },
  terms: {
    title: "Terms of Use",
    content: "By using R8ESTATE, you agree to our terms and conditions. Users must provide accurate information, respect other community members, and use the platform responsibly. We reserve the right to moderate content and suspend accounts that violate our guidelines. For full terms, contact legal@r8estate.com.",
  },
  "cookies-policy": {
    title: "Cookies Policy",
    content: "R8ESTATE uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your cookie preferences through your browser settings. Essential cookies are required for the site to function properly.",
  },
  copyright: {
    title: "Copyright Policy",
    content: "All content on R8ESTATE, including text, graphics, logos, and software, is the property of R8ESTATE or its content suppliers and is protected by international copyright laws. Unauthorized reproduction or distribution is prohibited.",
  },
  help: {
    title: "Help Center",
    content: "Welcome to the R8ESTATE Help Center. Here you'll find guides on how to write reviews, manage your profile, claim your business, and make the most of our platform. For specific questions, contact support@r8estate.com.",
  },
  "customer-service": {
    title: "Customer Service",
    content: "Our customer service team is here to help you with any issues or questions. Reach us at support@r8estate.com or through the platform's messaging feature. We aim to respond within 24 hours.",
  },
  faq: {
    title: "Frequently Asked Questions",
    content: "Q: How do I write a review?\nA: Navigate to a developer or project page and click 'Write a Review'.\n\nQ: Can I edit my review?\nA: Yes, you can update your review at any time from your dashboard.\n\nQ: How do I claim my business?\nA: Go to the business profile and click 'Claim This Business', then submit the required documentation.\n\nQ: Is R8ESTATE free?\nA: Yes! Reading and writing reviews is completely free. Businesses can upgrade for advanced features.",
  },
  report: {
    title: "Report a Problem",
    content: "Found an issue or encountered a bug? Please describe the problem and send it to support@r8estate.com. You can also use the 'Report' button available on reviews and community posts to flag inappropriate content.",
  },
};

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = PAGES[slug || ""] || { title: "Page Not Found", content: "The page you're looking for doesn't exist." };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">{page.title}</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {page.content.split("\n").map((line, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-3">{line}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaticPage;

import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="site-container section-y grid gap-12 lg:grid-cols-[0.85fr_1fr]">
      <div>
        <p className="mono mb-6 text-xs uppercase tracking-[0.2em] text-text-secondary">Contact</p>
        <h1 className="display text-[length:var(--text-hero)] leading-[0.86] text-accent">Build with us.</h1>
        <div className="mt-10 grid gap-4 text-text-secondary">
          <p>For investors, partnerships, press, and ecosystem conversations.</p>
          <p className="mono text-light">hello@onchain.holdings</p>
          <p className="mono text-light">New York / London / Remote</p>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}

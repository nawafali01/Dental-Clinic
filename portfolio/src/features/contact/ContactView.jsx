import { useState } from "react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { MapPin, Phone, Mail, CheckCircle, Clock, Heart, Send } from "lucide-react";

export function ContactView() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSuccess(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="bg-background">
      {/* ── Hero section ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/10">
              Get In Touch
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display font-semibold text-4xl sm:text-6xl tracking-tight text-secondary">
              Connect with our<br />
              <span className="text-gradient-primary">friendly front desk.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── Main Details & Form Grid ── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">

            {/* Left side: Information Cards */}
            <div className="lg:col-span-5 space-y-6">

              {/* Core contacts */}
              <div className="bg-white border border-border p-8 rounded-[32px] soft-shadow space-y-6">
                <h3 className="font-display font-semibold text-xl text-secondary">Clinic Directories</h3>

                <div className="flex gap-4">
                  <span className="size-10 rounded-full bg-accent text-primary grid place-items-center shrink-0">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Address</h4>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      12A Aesthetic Boulevard,<br />
                      Suite 400, Chicago, IL 60611
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="size-10 rounded-full bg-accent text-primary grid place-items-center shrink-0">
                    <Phone className="size-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Phone Lines</h4>
                    <p className="mt-1 text-sm text-secondary font-semibold">+1 (555) 123-4567</p>
                    <p className="text-xs text-muted-foreground">Emergency hotline: Option 9 (24/7)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="size-10 rounded-full bg-accent text-primary grid place-items-center shrink-0">
                    <Mail className="size-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Email Box</h4>
                    <p className="mt-1 text-sm text-secondary font-semibold">care@aureadental.com</p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white border border-border p-8 rounded-[32px] soft-shadow">
                <h3 className="font-display font-semibold text-xl text-secondary mb-6 flex items-center gap-2">
                  <Clock className="size-5 text-primary" /> Daily Schedule
                </h3>
                <div className="space-y-3.5 text-sm text-muted-foreground">
                  <div className="flex justify-between border-b border-neutral-50 pb-2.5">
                    <span>Monday — Thursday</span>
                    <span className="font-bold text-secondary">08:00 AM - 07:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-50 pb-2.5">
                    <span>Friday</span>
                    <span className="font-bold text-secondary">08:00 AM - 05:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-50 pb-2.5">
                    <span>Saturday</span>
                    <span className="font-bold text-secondary">09:00 AM - 04:00 PM</span>
                  </div>
                  <div className="flex justify-between text-rose-500 font-semibold">
                    <span>Sunday</span>
                    <span>Closed (On-call triage)</span>
                  </div>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 text-rose-800">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Heart className="size-4 shrink-0 fill-rose-500 text-rose-500 animate-pulse" />
                  Immediate Dental Emergency?
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-rose-700/90">
                  If you have a fractured tooth, extreme trauma, or swelling causing swallowing difficulties, skip the booking queue. Call option 9 immediately.
                </p>
              </div>

            </div>

            {/* Right side: Message Form */}
            <div className="lg:col-span-7 bg-white border border-border p-8 md:p-10 rounded-[32px] soft-shadow">
              <h3 className="font-display font-semibold text-xl text-secondary mb-6">Send front desk a message</h3>

              {success && (
                <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-800 flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Message received!</h4>
                    <p className="text-xs text-green-700 mt-0.5">We will review details and trigger a callback shortly.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-secondary focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. eleanor@example.com"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-secondary focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Phone number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-secondary focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Topic Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. General Consult query"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-secondary focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide details about your query..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-secondary focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="rounded-full w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer">
                    <Send className="size-4" /> Send Secure Message
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ── Mock Google Map ── */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="rounded-[32px] overflow-hidden border border-border bg-white p-3 soft-shadow relative h-[360px] flex items-center justify-center">
            <div className="absolute inset-0 bg-neutral-100 grid place-items-center selection:bg-transparent">
              <div className="text-center font-display p-6 z-10">
                <MapPin className="size-10 text-primary mx-auto mb-3" />
                <h4 className="text-secondary font-bold text-lg">Aesthetic Boulevard Map Location</h4>
                <p className="text-xs text-muted-foreground mt-1">Mock Google Map Frame Placeholder</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex mt-4 text-xs font-semibold px-4 py-2 border border-border bg-white rounded-full text-secondary hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  Open Google Maps directions
                </a>
              </div>
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

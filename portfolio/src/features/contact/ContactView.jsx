import { useState } from "react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { MapPin, Phone, Mail, CheckCircle, ShieldCheck, Clock, Heart, Send } from "lucide-react";
import { CLINIC_SCHEDULE, CONTACT_TOPICS } from "./contactConstants";

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
      <section className="relative pt-20 pb-4 md:pt-24 md:pb-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/10">
              Get In Touch
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 font-display font-semibold text-3xl sm:text-5xl md:text-6xl tracking-tight text-secondary">
              Connect with our<br />
              <span className="text-gradient-primary">friendly front desk.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── Main Details & Form Grid ── */}
      <section className="pt-6 pb-12 md:pt-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

            {/* Box 1: Core contacts */}
            <div className="order-1 lg:order-none lg:col-span-5 lg:row-start-1 bg-white border border-border p-8 rounded-[32px] soft-shadow space-y-6">
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

            {/* Box 2: Hours (Daily Schedule - directly above Red Box) */}
            <div className="order-2 lg:order-none lg:col-span-5 lg:row-start-2 bg-white border border-border p-8 rounded-[32px] soft-shadow">
              <h3 className="font-display font-semibold text-xl text-secondary mb-6 flex items-center gap-2">
                <Clock className="size-5 text-primary" /> Daily Schedule
              </h3>
              <div className="space-y-3.5 text-sm text-muted-foreground">
                {CLINIC_SCHEDULE.map((item) => (
                  <div
                    key={item.days}
                    className={`flex justify-between ${item.isClosed ? "text-rose-500 font-semibold" : "border-b border-neutral-50 pb-2.5"}`}
                  >
                    <span>{item.days}</span>
                    <span className={item.isClosed ? "" : "font-bold text-secondary"}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Message Form (spans Row 1 & Row 2 to align exactly with Box 2's bottom) */}
            <div className="order-4 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2 bg-white border border-border p-6 md:p-8 rounded-[32px] soft-shadow flex flex-col">
              <div className="flex-1 flex flex-col">
                <h3 className="font-display font-semibold text-xl text-secondary mb-1">Send front desk a message</h3>
                <p className="text-xs text-muted-foreground mb-6">Have a question? Fill out the form below for a quick response.</p>

                {success && (
                  <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-800 flex items-start gap-3">
                    <CheckCircle className="size-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Message received!</h4>
                      <p className="text-xs text-green-700 mt-0.5">We will review details and trigger a callback shortly.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none text-secondary focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="e.g. eleanor@example.com"
                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none text-secondary focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Phone number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. +1 (555) 000-0000"
                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none text-secondary focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Topic Subject</label>
                      <select
                        value={form.subject || ""}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none text-secondary focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="" disabled>Select a topic...</option>
                        {CONTACT_TOPICS.map((topic) => (
                          <option key={topic.value} value={topic.value}>
                            {topic.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Your Message *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Provide details about your query..."
                      className="w-full flex-1 min-h-[110px] bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none text-secondary focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button type="submit" className="rounded-full w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer">
                      <Send className="size-4" /> Send Secure Message
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-primary" /> 100% Confidential & Secure Communication
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Box 3: Emergency Banner (Red box - directly below Daily Schedule) */}
            <div className="order-3 lg:order-none lg:col-span-5 lg:row-start-3 bg-rose-50 border border-rose-100 rounded-[32px] p-6 text-rose-800">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Heart className="size-4 shrink-0 fill-rose-500 text-rose-500 animate-pulse" />
                Immediate Dental Emergency?
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-rose-700/90">
                If you have a fractured tooth, extreme trauma, or swelling causing swallowing difficulties, skip the booking queue. Call option 9 immediately.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Google Map Section ── */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="rounded-[32px] overflow-hidden border border-border bg-white soft-shadow relative h-[380px] sm:h-[420px]">
            <iframe
              title="Aurea Dental Clinic Location"
              src="https://maps.google.com/maps?q=12A+Aesthetic+Boulevard,+Chicago,+IL+60611&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 grayscale-[20%] contrast-[1.05]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Overlay Clinic Location Card */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-border shadow-lg z-10">
              <div className="flex items-start gap-3">
                <span className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0 shadow-sm">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <h4 className="font-display font-semibold text-base text-secondary">Aurea Dental Clinic</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    12A Aesthetic Boulevard, Suite 400,<br />
                    Chicago, IL 60611
                  </p>
                  <a
                    href="https://maps.google.com/?q=12A+Aesthetic+Boulevard+Suite+400+Chicago+IL+60611"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline"
                  >
                    Open in Google Maps &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

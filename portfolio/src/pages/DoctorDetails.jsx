import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { CalendarPlus, ArrowLeft, Star, Award, ShieldCheck, Mail, MapPin, Heart } from "lucide-react";
import { getDoctors } from "@/services/api/doctor.api";
import doctor1 from "@/assets/images/doctor-1.jpg";
import doctor2 from "@/assets/images/doctor-2.jpg";
import doctor3 from "@/assets/images/doctor-3.jpg";

const doctorAssetMap = {
  "doctor-1.jpg": doctor1,
  "doctor-2.jpg": doctor2,
  "doctor-3.jpg": doctor3,
};

const fallbackDoctors = [
  {
    _id: "1",
    name: "Dr. Catherine Reyes",
    role: "Cosmetic & Restorative Dentist",
    edu: "DDS, Columbia University",
    exp: "12 years",
    img: doctor1,
    category: "Cosmetic",
    bio: "Dr. Reyes has over twelve years of clinical practice in aesthetics. She specializes in full smile makeovers using custom-veneers, composite bonding, and orthodontics. Her mission is to merge medical requirements with artistic beauty, delivering highly personalized confidence milestones.",
    certs: ["Invisalign Diamond Provider", "ACCD Accredited Member", "Sirona Dental Specialist"],
    reviews: [
      { author: "Mark J.", rating: 5, comment: "Dr. Reyes is purely an artist. I did my composite veneers and the results look extremely natural and beautiful!" },
      { author: "Zoe K.", rating: 5, comment: "Extremely gentle, explained everything clearly. Highly recommend her for nervous patients." }
    ],
    services: ["Porcelain Veneers", "Teeth Whitening", "Laser Gum Contouring", "Cosmetic Bonding"]
  },
  {
    _id: "2",
    name: "Dr. Marcus Vance",
    role: "Implant & Oral Surgeon",
    edu: "DDS, PhD, Harvard Dental School",
    exp: "15 years",
    img: doctor2,
    category: "Implantology",
    bio: "Dr. Vance is a double board-certified implantologist and oral surgeon with fifteen years of experience. He is an international lecturer on computer-guided implant operations, aiming to perform low-infiltration procedures with extremely rapid healing windows.",
    certs: ["Board Certified Oral Surgeon", "ICOI Fellow Member", "Dental Implants Implant Chair"],
    reviews: [
      { author: "Arthur L.", rating: 5, comment: "Amazing skill. Replaced two missing molars with zero pain during the procedure. Truly a specialist." },
      { author: "Sonia G.", rating: 5, comment: "Professional team and advanced surgical diagnostics. Recommended for dental implants." }
    ],
    services: ["Single Tooth Implants", "All-on-4 Restoration", "Bone Grafting", "Wisdom Teeth Extraction"]
  },
  {
    _id: "3",
    name: "Dr. Sarah Kim",
    role: "Pediatric Specialist",
    edu: "DMD, University of Pennsylvania",
    exp: "9 years",
    img: doctor3,
    category: "Pediatric",
    bio: "Dr. Kim understands that children require a unique, patient approach to health. With a deep emphasis on pediatric psychology and laser dental tools, she builds happy dental habits, transforming dental cleanings into fun educational adventures.",
    certs: ["AAPD Certified Pediatric Expert", "Laser Dentistry Certified", "BLS Instructor"],
    reviews: [
      { author: "David P.", rating: 5, comment: "My 6-year old actually likes visiting her! That should tell you everything." },
      { author: "Lucia M.", rating: 5, comment: "Super sweet and knows exactly how to handle anxious kids. The kids play area is amazing too." }
    ],
    services: ["Child Cleanings", "Fluoride Treatment", "Pit & Fissure Sealants", "Myofunctional Therapy"]
  }
];

export default function DoctorDetails() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const items = await getDoctors();
        let loadedAll = [];
        if (items && items.length > 0) {
          loadedAll = items.map((doc, idx) => {
            const fileName = doc.img?.split("/").pop();
            const localImg = doctorAssetMap[fileName] ?? doc.img;
            return {
              _id: doc._id || String(idx + 1),
              name: doc.name,
              role: doc.role,
              edu: doc.edu,
              exp: doc.exp,
              img: localImg,
              category: doc.category || (idx === 0 ? "Cosmetic" : idx === 1 ? "Implantology" : "Pediatric"),
              bio: doc.bio || fallbackDoctors[idx]?.bio || "Experienced team practitioner committed to providing high quality clinical care.",
              certs: doc.certs || fallbackDoctors[idx]?.certs || [],
              reviews: doc.reviews || fallbackDoctors[idx]?.reviews || [],
              services: doc.services || fallbackDoctors[idx]?.services || ["Routine Dental Exams", "Teeth Cleanings"],
            };
          });
        } else {
          loadedAll = fallbackDoctors;
        }
        setAllDocs(loadedAll);
        const match = loadedAll.find(d => String(d._id) === String(id));
        setDoctor(match || loadedAll[0]);
      } catch (err) {
        console.warn("Error fetching doctor profile details", err);
        setAllDocs(fallbackDoctors);
        const match = fallbackDoctors.find(d => String(d._id) === String(id));
        setDoctor(match || fallbackDoctors[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">
        Crunching profile data...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-secondary font-display font-semibold text-lg">Doctor not found</p>
        <Link to="/home/doctors" className="text-primary hover:underline text-sm">Return to all doctors</Link>
      </div>
    );
  }

  const related = allDocs.filter(d => String(d._id) !== String(doctor._id)).slice(0, 2);

  return (
    <div className="bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        
        {/* Back Link */}
        <Reveal>
          <Link to="/home/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer">
            <ArrowLeft className="size-4" /> Back to clinicians
          </Link>
        </Reveal>

        {/* ── Doctor Header Card ── */}
        <section className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Portrait Image */}
          <div className="lg:col-span-5 aspect-[4/5] rounded-[32px] overflow-hidden border border-border shadow-lg bg-muted relative">
            <img
              src={doctor.img}
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
          </div>

          {/* Quick info panel */}
          <div className="lg:col-span-7 flex flex-col justify-center h-full">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-accent text-primary border border-primary/10">
                <Star className="size-3.5 fill-primary text-primary" /> 5.0 (patient verified)
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold text-secondary tracking-tight">
                {doctor.name}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-2 text-lg text-primary font-medium tracking-wide">
                {doctor.role}
              </p>
            </Reveal>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-border py-6 my-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hospital Role</p>
                <p className="mt-1 text-sm font-bold text-secondary">Associate Director</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Practice</p>
                <p className="mt-1 text-sm font-bold text-secondary">{doctor.exp}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Education</p>
                <p className="mt-1 text-sm font-bold text-secondary text-ellipsis overflow-hidden whitespace-nowrap">{doctor.edu.split(",")[0]}</p>
              </div>
            </div>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-4 items-center">
                <Button asChild className="rounded-full h-12 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer">
                  <Link to={`/book-appointment?doctor=${doctor._id}`}>Book appointment</Link>
                </Button>
                <a href="#biography" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                  Read philosophy
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Bio & Qualifications Grid ── */}
        <section id="biography" className="grid lg:grid-cols-12 gap-10 lg:gap-14 border-t border-border pt-12 my-12">
          {/* Left Column: Bio */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-bold text-secondary mb-4 flex items-center gap-2">
              <Heart className="size-5 text-primary" /> About {doctor.name.split(" ")[1]}
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {doctor.bio}
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Each treatment plan is customized leveraging AI scanner diagnostic results and 3D dental mapping to prevent relapse or structural discomfort while maximizing smiling aesthetics.
              </p>
            </div>

            {/* Certifications cards */}
            <h3 className="font-display text-lg font-semibold text-secondary mt-8 mb-4 flex items-center gap-2">
              <Award className="size-4.5 text-primary" /> Credentials & Certifications
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {doctor.certs.map(cert => (
                <div key={cert} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-border soft-shadow">
                  <ShieldCheck className="size-5 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-secondary">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Services & Location */}
          <div className="lg:col-span-5 space-y-6">
            {/* Services Offered block */}
            <div className="bg-accent/30 border border-primary/10 rounded-[32px] p-6 lg:p-8">
              <h3 className="font-display text-xl font-bold text-secondary mb-4">Areas of Focus</h3>
              <ul className="space-y-3">
                {doctor.services.map(s => (
                  <li key={s} className="flex items-center gap-3 text-sm text-secondary font-medium tracking-wide">
                    <span className="size-2 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location & Contacts */}
            <div className="bg-white border border-border shadow-sm rounded-[32px] p-6">
              <h3 className="font-display text-lg font-bold text-secondary mb-4">Clinic Hours</h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between border-b border-neutral-50 pb-2">
                  <span>Monday — Friday</span>
                  <span className="font-bold text-secondary">08:00 AM - 07:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-bold text-secondary">09:00 AM - 04:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="border-t border-border pt-12 my-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-secondary">Patient Experiences</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Reviews left by treated patients</p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-border px-4 py-2 rounded-full soft-shadow text-sm font-semibold text-secondary">
              <Star className="size-4 text-primary fill-primary" /> 5.0 Rating average
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {doctor.reviews.map((r, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-border soft-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} className="size-3.5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">"{r.comment}"</p>
                <p className="text-xs font-semibold text-secondary mt-3">— {r.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Related Clinicians ── */}
        <section className="border-t border-border pt-12 my-12">
          <h2 className="font-display text-2xl font-bold text-secondary mb-8">Related Clinicians</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(rec => (
              <article key={rec._id} className="group rounded-[28px] overflow-hidden bg-white border border-border soft-shadow flex flex-col justify-between">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={rec.img} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs text-white/80">{rec.role}</p>
                    <h3 className="font-display text-lg font-bold text-white mt-0.5">{rec.name}</h3>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center justify-between border-t border-border">
                  <span className="text-xs text-muted-foreground">{rec.edu}</span>
                  <Link to={`/doctors/${rec._id}`} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    View profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { Check, CheckCircle2, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { treatmentsList, doctorsList, datesList, timesList, bookingSteps } from "./data";

export function BookAppointmentView() {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get("doctor");

  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState(treatmentsList[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(
    doctorsList.find(d => d.id === initialDocId) || doctorsList[0]
  );
  const [selectedDate, setSelectedDate] = useState(datesList[0]);
  const [selectedTime, setSelectedTime] = useState(timesList[0]);

  const handleNext = () => setStep(s => Math.min(s + 1, bookingSteps.length));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="bg-background min-h-[calc(100vh-80px)] flex flex-col justify-center py-6 md:py-8 overflow-hidden">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 md:px-8">

        {/* ── Progress Indicators header ── */}
        <div className="mb-6 border-b border-border pb-4">
          <div className="flex justify-between items-center relative">
            {bookingSteps.map((label, idx) => {
              const stepNum = idx + 1;
              return (
                <div key={label} className="flex flex-col items-center z-10">
                  <span className={`size-7 sm:size-8 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                    step >= stepNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white text-muted-foreground border-border"
                  }`}>
                    {step > stepNum ? <Check className="size-3.5 sm:size-4 text-white" /> : stepNum}
                  </span>
                  <span className={`hidden sm:block text-[10px] uppercase font-bold mt-1.5 tracking-wider ${
                    step === stepNum ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Steps Containers ── */}
        <div className="bg-white border border-border rounded-[28px] p-5 sm:p-6 md:p-8 soft-shadow flex flex-col justify-between">
          <div>

            {/* Step 1: Select Treatment */}
            {step === 1 && (
              <div>
                <Reveal><span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Step 1 of 4</span></Reveal>
                <Reveal delay={0.05}><h2 className="font-display text-lg sm:text-xl font-bold text-secondary mt-0.5">Select Dental Service</h2></Reveal>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                  {treatmentsList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTreatment(t)}
                      className={`p-4 sm:p-4.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedTreatment.id === t.id
                          ? "border-primary bg-accent/30 shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-secondary text-xs sm:text-sm">{t.title}</h3>
                      <div className="flex gap-4 text-[11px] text-muted-foreground mt-2">
                        <span>Duration: {t.duration}</span>
                        <span>{t.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Doctor */}
            {step === 2 && (
              <div>
                <Reveal><span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Step 2 of 4</span></Reveal>
                <Reveal delay={0.05}><h2 className="font-display text-lg sm:text-xl font-bold text-secondary mt-0.5">Choose Practitioner</h2></Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {doctorsList.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDoctor(d)}
                      className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                        selectedDoctor.id === d.id
                          ? "border-primary bg-accent/30 shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="size-14 rounded-full overflow-hidden mx-auto bg-muted">
                        <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-semibold text-secondary text-xs mt-2.5">{d.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{d.role}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div>
                <Reveal><span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Step 3 of 4</span></Reveal>
                <Reveal delay={0.05}><h2 className="font-display text-lg sm:text-xl font-bold text-secondary mt-0.5">Select Slot Timings</h2></Reveal>

                <h3 className="text-[11px] uppercase font-bold text-secondary tracking-wider mt-4 mb-2">Available Dates</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {datesList.map(d => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedDate.date === d.date
                          ? "border-primary bg-accent/30"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="block text-[9px] uppercase font-bold text-muted-foreground">{d.day}</span>
                      <span className="block text-xs font-bold text-secondary mt-0.5">{d.date.split(" ")[1]}</span>
                      {d.label && <span className="block text-[8px] text-primary font-bold mt-0.5 uppercase tracking-wide">{d.label}</span>}
                    </button>
                  ))}
                </div>

                <h3 className="text-[11px] uppercase font-bold text-secondary tracking-wider mt-5 mb-2">Available Hours</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timesList.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center cursor-pointer transition-all ${
                        selectedTime === time
                          ? "border-primary bg-accent/30"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review Booking */}
            {step === 4 && (
              <div>
                <Reveal><span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Step 4 of 4</span></Reveal>
                <Reveal delay={0.05}><h2 className="font-display text-lg sm:text-xl font-bold text-secondary mt-0.5">Review Reservation Details</h2></Reveal>

                <div className="mt-4 border border-border rounded-2xl p-4 sm:p-5 space-y-3 bg-muted/20">
                  <div className="flex justify-between items-center border-b border-light pb-2.5">
                    <span className="text-xs font-semibold text-muted-foreground">Dental Service</span>
                    <span className="text-xs font-bold text-secondary">{selectedTreatment.title} ({selectedTreatment.duration})</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-light pb-2.5">
                    <span className="text-xs font-semibold text-muted-foreground font-sans">Specialist Dentist</span>
                    <span className="text-xs font-bold text-secondary">{selectedDoctor.name} ({selectedDoctor.role})</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-light pb-2.5">
                    <span className="text-xs font-semibold text-muted-foreground">Appointment Date</span>
                    <span className="text-xs font-bold text-secondary">{selectedDate.day}, {selectedDate.date} 2026</span>
                  </div>
                  <div className="flex justify-between items-center pb-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">Consultation Hour</span>
                    <span className="text-xs font-bold text-secondary">{selectedTime}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl text-neutral-500 text-[10px] leading-relaxed">
                  <Shield className="size-3.5 shrink-0 text-primary" />
                  Your booking details are confidential and secured under standard clinical privacy rules.
                </div>
              </div>
            )}

            {/* Step 5: Success screen */}
            {step === 5 && (
              <div className="text-center py-6 sm:py-8">
                <CheckCircle2 className="size-14 text-primary mx-auto mb-3 animate-bounce" />
                <h2 className="font-display text-xl sm:text-2xl font-bold text-secondary">Appointment Confirmed!</h2>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                  Your dental profile is registered. Aurea front desk has reserved <strong>{selectedTime}</strong> on <strong>{selectedDate.date}</strong> with <strong>{selectedDoctor.name}</strong>.
                </p>
                <div className="mt-6">
                  <Link to="/">
                    <Button className="rounded-full bg-secondary text-white hover:bg-neutral-800 font-bold px-6 py-2.5 text-xs cursor-pointer">
                      Return to Homepage
                    </Button>
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Buttons navigation */}
          {step < 5 && (
            <div className="mt-6 border-t border-border pt-4 flex justify-between items-center">
              {step > 1 ? (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4" /> Back step
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-full bg-primary text-primary-foreground font-bold px-5 py-2.5 text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {step === 4 ? "Book Reservation" : "Continue"} <ChevronRight className="size-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

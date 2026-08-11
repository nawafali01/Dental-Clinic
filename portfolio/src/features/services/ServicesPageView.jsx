import { useState, useEffect } from "react";
import { axiosInstance } from "@/services/api/axiosInstance";
import {
  iconMap,
  categories,
  faqs,
  fallbackServices,
  featuredTreatments,
  filterServices,
} from "./servicesData";
import { ServicesHero } from "./components/ServicesHero";
import { ServicesFilter } from "./components/ServicesFilter";
import { ServicesGrid } from "./components/ServicesGrid";
import { FeaturedTreatmentsSection } from "./components/FeaturedTreatmentsSection";
import { ServicesFAQSection } from "./components/ServicesFAQSection";
import { ServicesCTASection } from "./components/ServicesCTASection";

export function ServicesPageView() {
  const [services, setServices] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/services")
      .then((r) => setServices(r.data))
      .catch(() => setServices([]));
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices;
  const filtered = filterServices(displayServices, activeCat, search);

  const handleResetFilters = () => {
    setSearch("");
    setActiveCat("All");
  };

  return (
    <div id="top" className="bg-background">
      <ServicesHero />
      <ServicesFilter
        search={search}
        setSearch={setSearch}
        categories={categories}
        activeCat={activeCat}
        setActiveCat={setActiveCat}
      />
      <ServicesGrid
        services={filtered}
        iconMap={iconMap}
        onResetFilters={handleResetFilters}
      />
      <FeaturedTreatmentsSection featuredTreatments={featuredTreatments} />
      <ServicesFAQSection faqs={faqs} openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <ServicesCTASection />
    </div>
  );
}

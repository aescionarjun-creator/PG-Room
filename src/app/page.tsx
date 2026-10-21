import React from "react";
import { Navbar } from "@/components/common/Navbar";
import { Hero } from "@/components/home/Hero";
import { SearchPanel } from "@/components/home/SearchPanel";
import { AmenitiesStrip } from "@/components/home/AmenitiesStrip";
import { StayForEverySchedule } from "@/components/home/StayForEverySchedule";
import { FeaturedRooms } from "@/components/home/FeaturedRooms";
import { FindYourSpace } from "@/components/home/FindYourSpace";
import { LifestyleSection } from "@/components/home/LifestyleSection";
import { AmenitiesPhotoGallery } from "@/components/home/AmenitiesPhotoGallery";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ScheduleVisitSection } from "@/components/home/ScheduleVisitSection";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { Footer } from "@/components/common/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] text-[#192621]">
      {/* Section A: Navigation (Transparent over Hero at top, transitions to warm-white on scroll) */}
      <Navbar />

      <main className="flex-1">
        {/* Section B: Full-width Photographic Hero */}
        <Hero />

        {/* Section C: Duration-Based Booking Search (Overlaps hero lower edge on desktop, normal document flow on mobile) */}
        <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:-mt-16 lg:-mt-24 mb-16">
          <SearchPanel />
        </section>

        {/* Section D: Amenities Strip */}
        <AmenitiesStrip />

        {/* Section E: A Stay For Every Schedule (5 duration cards) */}
        <StayForEverySchedule />

        {/* Section F: Explore Our Stays (6-9 rich stay cards from live inventory) */}
        <FeaturedRooms />

        {/* Section G: Find Your Kind of Space (Photographic category tiles) */}
        <FindYourSpace />

        {/* Section H: Lifestyle Section ("Room to rest. Space to grow.") */}
        <LifestyleSection />

        {/* Section I: Amenities Photo Section (Bedroom, Bath, Dining, Lounge, Study, Exterior) */}
        <AmenitiesPhotoGallery />

        {/* Section J: How Booking Works (1. Choose stay, 2. Select dates, 3. Review & book) */}
        <HowItWorks />

        {/* Section K: Schedule a Visit (Form with date/time, persists to admin visits) */}
        <ScheduleVisitSection />

        {/* Section L: Frequently Asked Questions (Configured property policy answers) */}
        <FaqAccordion />
      </main>

      {/* Section M: Footer */}
      <Footer />
    </div>
  );
}

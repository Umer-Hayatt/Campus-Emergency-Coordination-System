import React, { useEffect } from "react"
import Hero from "../components/landing/Hero"
import HowItWorks from "../components/landing/HowItWorks"
import RolesSection from "../components/landing/RolesSection"
import FeaturesSection from "../components/landing/FeaturesSection"
import ArchitectureSection from "../components/landing/ArchitectureSection"
import CtaBand from "../components/landing/CtaBand"
import Footer from "../components/landing/Footer"

export default function Landing() {
  useEffect(() => {
    // Subtle IntersectionObserver reveal animation (opacity + 12px translate, 400ms, once)
    const elements = document.querySelectorAll(".scroll-reveal")
    if (!("IntersectionObserver" in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <Hero />
      <div className="scroll-reveal">
        <HowItWorks />
      </div>
      <div className="scroll-reveal">
        <RolesSection />
      </div>
      <div className="scroll-reveal">
        <FeaturesSection />
      </div>
      <div className="scroll-reveal">
        <ArchitectureSection />
      </div>
      <CtaBand />
      <Footer />

      <style>{`
        .scroll-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 400ms ease, transform 400ms ease;
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

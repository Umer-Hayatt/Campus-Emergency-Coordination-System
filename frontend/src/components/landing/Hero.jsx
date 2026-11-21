import React from "react"
import { Link } from "react-router-dom"
import Navbar from "./Navbar"
import FloatingObjects from "./FloatingObjects"

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <Navbar />
      <FloatingObjects />

      {/* Main Headline content container */}
      <div className="hero-content">
        <h1 className="hero-headline">
          <span className="hero-headline-white">Connecting</span>
          <span className="hero-headline-white">emergencies</span>
          <span className="hero-headline-amber">to action.</span>
        </h1>

        <p className="hero-subhead">
          Report, assign and resolve campus emergencies in real time, from the first alert to final resolution.
        </p>

        {/* Bevelled graphite button with amber corner triangle */}
        <Link to="/login" className="hero-btn-getstarted">
          <span>Get started</span>
          <span className="hero-btn-corner-triangle" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

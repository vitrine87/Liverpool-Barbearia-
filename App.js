import React, { useState } from "https://esm.sh/react@18.3.1";
import { html } from "./lib/html.js";
import { AuthProvider } from "./context/AuthContext.js";
import { BackgroundVideo } from "./components/BackgroundVideo.js";
import { Header } from "./components/Header.js";
import { Hero } from "./components/Hero.js";
import { About } from "./components/About.js";
import { Carousel } from "./components/Carousel.js";
import { Pricing } from "./components/Pricing.js";
import { Contact } from "./components/Contact.js";
import { Testimonials } from "./components/Testimonials.js";
import { FinalCtaFooter } from "./components/FinalCtaFooter.js";
import { WhatsAppButton } from "./components/WhatsAppButton.js";
import { BookingModal } from "./components/BookingModal.js";
import { LampLogin } from "./components/LampLogin.js";
import { BookingLookupModal } from "./components/BookingLookupModal.js";

export function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);

  return html`
    <${AuthProvider}>
      <${BackgroundVideo} />
      <div className="relative z-10">
        <${Header} onOpenLogin=${() => setLoginOpen(true)} onOpenLookup=${() => setLookupOpen(true)} />
        <main>
          <${Hero} onBook=${() => setBookingOpen(true)} />
          <${About} />
          <${Carousel} />
          <${Pricing} />
          <${Contact} />
          <${Testimonials} />
          <${FinalCtaFooter} />
        </main>
        <${WhatsAppButton} />
        <${BookingModal} open=${bookingOpen} onClose=${() => setBookingOpen(false)} />
        <${LampLogin} open=${loginOpen} onClose=${() => setLoginOpen(false)} />
        <${BookingLookupModal} open=${lookupOpen} onClose=${() => setLookupOpen(false)} />
      </div>
    <//>
  `;
}

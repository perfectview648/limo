/* ==========================================================================
   PRESTIGE PRIVATE CLIENT — Prototype Script
   All data below is demo content. Replace freely.
   ========================================================================== */

/* ---------- DEMO DATA (edit freely) ---------- */

const vehicleData = [
  {
    id: "sedan",
    name: "Executive Sedan",
    passengers: "1–3 passengers",
    luggage: "2 luggage",
    desc: "Premium interior with complimentary water — ideal for solo travellers and small groups.",
    features: ["Premium interior", "Complimentary water", "Wi-Fi available"],
    price: 85
  },
  {
    id: "suv",
    name: "Luxury SUV",
    passengers: "1–6 passengers",
    luggage: "5 luggage",
    desc: "Extra space and comfort for families, groups or additional luggage.",
    features: ["Premium interior", "Complimentary water", "Extra luggage space"],
    price: 120
  },
  {
    id: "van",
    name: "Executive Van",
    passengers: "1–10 passengers",
    luggage: "Multiple luggage",
    desc: "Ideal for groups, teams and events that need to travel together.",
    features: ["Premium interior", "Group seating", "Ideal for events"],
    price: 165
  }
];

const locationData = [
  "Toronto", "Mississauga", "Brampton", "Vaughan", "Markham",
  "Richmond Hill", "Pickering", "Ajax", "Whitby", "Oshawa",
  "Oakville", "Burlington", "Hamilton", "Niagara Falls"
];

const routeData = [
  { name: "Pickering → Pearson Airport", from: "Pickering, ON", to: "Toronto Pearson (YYZ)", price: 95 },
  { name: "Ajax → Pearson Airport", from: "Ajax, ON", to: "Toronto Pearson (YYZ)", price: 100 },
  { name: "Oshawa → Pearson Airport", from: "Oshawa, ON", to: "Toronto Pearson (YYZ)", price: 115 },
  { name: "Toronto → Pearson Airport", from: "Downtown Toronto", to: "Toronto Pearson (YYZ)", price: 75 },
  { name: "Toronto → Niagara Falls", from: "Downtown Toronto", to: "Niagara Falls, ON", price: 195 },
  { name: "Toronto → Buffalo", from: "Downtown Toronto", to: "Buffalo, NY", price: 240 }
];

const TAX_RATE = 0.13; // demo HST rate, easy to change

/* ---------- RENDER: FLEET SECTION (homepage) ---------- */

function renderFleetGrid() {
  const grid = document.getElementById("fleetGrid");
  grid.innerHTML = vehicleData.map(v => `
    <article class="vehicle-card">
      <div class="vehicle-image" aria-hidden="true">${v.name} — image placeholder</div>
      <div class="vehicle-body">
        <h3>${v.name}</h3>
        <div class="vehicle-meta"><span>${v.passengers}</span><span>${v.luggage}</span></div>
        <p class="vehicle-desc">${v.desc}</p>
        <ul class="vehicle-features">${v.features.map(f => `<li>${f}</li>`).join("")}</ul>
        <div class="vehicle-footer">
          <div class="vehicle-price">$${v.price}<span>Starting price, demo</span></div>
          <button class="btn btn-ghost" data-open-booking>Select</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* ---------- RENDER: LOCATIONS ---------- */

function renderLocationPills() {
  const list = document.getElementById("locationPills");
  list.innerHTML = locationData.map(loc => `<li>${loc}</li>`).join("");
}

/* ---------- RENDER: ROUTES ---------- */

function renderRoutes() {
  const list = document.getElementById("routesList");
  list.innerHTML = routeData.map(r => `
    <div class="route-row">
      <div>
        <div class="route-name">${r.name}</div>
        <div class="route-from-to">${r.from} → ${r.to}</div>
      </div>
      <div class="route-actions">
        <span class="route-price">From $${r.price}</span>
        <button class="btn btn-ghost" data-open-booking>Get a quote</button>
      </div>
    </div>
  `).join("");
}

/* ---------- AIRPORT TABS ---------- */

function initAirportTabs() {
  const tabs = document.querySelectorAll(".airport-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      // In a full build, this would swap the feature list content per airport.
    });
  });
}

/* ---------- FAQ ACCORDION ---------- */

function initAccordion() {
  const triggers = document.querySelectorAll(".accordion-trigger");
  triggers.forEach(trigger => {
    const panel = trigger.nextElementSibling;
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? "0px" : panel.scrollHeight + "px";
    });
  });
}

/* ---------- SCROLL REVEALS ---------- */
/* Sections fade + rise into place once as they enter the viewport.
   Respects prefers-reduced-motion via the CSS (.reveal is forced visible there). */

function initScrollReveals() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach(t => t.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  targets.forEach(t => observer.observe(t));
}

/* ---------- MOBILE NAV TOGGLE ---------- */

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

/* ==========================================================================
   BOOKING FLOW STATE MACHINE
   ========================================================================== */

const booking = {
  step: 1,
  from: "",
  to: "",
  date: "",
  time: "",
  passengers: "1",
  tripType: "One Way",
  vehicleId: null,
  flight: "",
  airline: "",
  meetGreet: false,
  luggage: "0",
  childSeat: false,
  stops: "",
  notes: "",
  name: "",
  phone: "",
  email: "",
  company: "",
  updatesOptIn: true
};

const overlay = document.getElementById("bookingOverlay");
const modalSteps = document.querySelectorAll(".booking-step");
const progressSteps = document.querySelectorAll(".progress-step");

function openBooking(prefill) {
  if (prefill) {
    booking.from = prefill.from || booking.from;
    booking.to = prefill.to || booking.to;
    booking.date = prefill.date || booking.date;
    booking.time = prefill.time || booking.time;
    booking.passengers = prefill.passengers || booking.passengers;
  }
  // Sync step 1 fields with any prefill / existing state
  document.getElementById("s1From").value = booking.from;
  document.getElementById("s1To").value = booking.to;
  document.getElementById("s1Date").value = booking.date;
  document.getElementById("s1Time").value = booking.time;
  document.getElementById("s1Pax").value = booking.passengers;

  goToStep(1);
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeBooking() {
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function goToStep(n) {
  booking.step = n;
  modalSteps.forEach(step => {
    step.classList.toggle("is-active", Number(step.dataset.step) === n);
  });
  progressSteps.forEach(ps => {
    const stepNum = Number(ps.dataset.step);
    ps.classList.toggle("is-active", stepNum === n);
    ps.classList.toggle("is-done", stepNum < n);
  });
  // Progress track only shows steps 1-5; step 6 (confirmation) keeps step 5 marked done
  if (n === 6) {
    progressSteps.forEach(ps => ps.classList.add("is-done"));
  }

  if (n === 2) renderVehicleSelectGrid();
  if (n === 5) renderSummary();

  document.querySelector(".booking-modal-body").scrollTop = 0;
}

function renderVehicleSelectGrid() {
  const grid = document.getElementById("vehicleSelectGrid");
  grid.innerHTML = vehicleData.map(v => `
    <div class="vehicle-select-card ${booking.vehicleId === v.id ? "is-selected" : ""}" data-vehicle="${v.id}" role="button" tabindex="0">
      <div class="vehicle-thumb" aria-hidden="true">${v.name}</div>
      <div class="vehicle-select-info">
        <h3>${v.name}</h3>
        <p>${v.passengers} · ${v.luggage}</p>
      </div>
      <div class="vehicle-select-price">
        <strong>$${v.price}</strong>
        <span>Demo price</span>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".vehicle-select-card").forEach(card => {
    const select = () => {
      booking.vehicleId = card.dataset.vehicle;
      renderVehicleSelectGrid();
      // Auto-advance shortly after selection for a smooth feel
      setTimeout(() => goToStep(3), 200);
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } });
  });
}

function getVehicle(id) {
  return vehicleData.find(v => v.id === id);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${period}`;
}

function computeTotals() {
  const vehicle = getVehicle(booking.vehicleId);
  const fare = vehicle ? vehicle.price : 0;
  const tax = fare * TAX_RATE;
  const total = fare + tax;
  return { fare, tax, total };
}

function renderSummary() {
  const vehicle = getVehicle(booking.vehicleId);
  const { fare, tax, total } = computeTotals();
  const card = document.getElementById("summaryCard");
  card.innerHTML = `
    <div class="summary-row"><span class="summary-label">Pickup</span><span class="summary-value">${booking.from || "—"}</span></div>
    <div class="summary-row"><span class="summary-label">Destination</span><span class="summary-value">${booking.to || "—"}</span></div>
    <div class="summary-row"><span class="summary-label">Date</span><span class="summary-value">${formatDate(booking.date)}</span></div>
    <div class="summary-row"><span class="summary-label">Time</span><span class="summary-value">${formatTime(booking.time)}</span></div>
    <div class="summary-row"><span class="summary-label">Passengers</span><span class="summary-value">${booking.passengers}</span></div>
    <div class="summary-row"><span class="summary-label">Vehicle</span><span class="summary-value">${vehicle ? vehicle.name : "—"}</span></div>
    <div class="summary-row"><span class="summary-label">Trip</span><span class="summary-value">${booking.tripType}</span></div>
    <div class="summary-row"><span class="summary-label">Vehicle fare</span><span class="summary-value">$${fare.toFixed(2)}</span></div>
    <div class="summary-row"><span class="summary-label">Tax</span><span class="summary-value">$${tax.toFixed(2)}</span></div>
    <div class="summary-row summary-total"><span class="summary-label">Total</span><span class="summary-value">$${total.toFixed(2)}</span></div>
  `;
}

function generateConfirmationNumber() {
  const num = Math.floor(10000 + Math.random() * 89999);
  return `PV-${num}`;
}

function renderConfirmation() {
  const vehicle = getVehicle(booking.vehicleId);
  const { total } = computeTotals();
  const firstName = booking.name.trim().split(" ")[0] || "there";

  document.getElementById("confirmationThanks").textContent = `Thank you, ${firstName}.`;

  const card = document.getElementById("confirmationCard");
  card.innerHTML = `
    <div class="summary-row"><span class="summary-label">Confirmation #</span><span class="summary-value">${generateConfirmationNumber()}</span></div>
    <div class="summary-row"><span class="summary-label">Pickup</span><span class="summary-value">${booking.from || "—"}</span></div>
    <div class="summary-row"><span class="summary-label">Destination</span><span class="summary-value">${booking.to || "—"}</span></div>
    <div class="summary-row"><span class="summary-label">Date</span><span class="summary-value">${formatDate(booking.date)}</span></div>
    <div class="summary-row"><span class="summary-label">Time</span><span class="summary-value">${formatTime(booking.time)}</span></div>
    <div class="summary-row"><span class="summary-label">Vehicle</span><span class="summary-value">${vehicle ? vehicle.name : "—"}</span></div>
    <div class="summary-row summary-total"><span class="summary-label">Total</span><span class="summary-value">$${total.toFixed(2)}</span></div>
  `;
}

/* ---------- STEP VALIDATION + DATA SYNC ---------- */

function syncStep1() {
  booking.from = document.getElementById("s1From").value;
  booking.to = document.getElementById("s1To").value;
  booking.date = document.getElementById("s1Date").value;
  booking.time = document.getElementById("s1Time").value;
  booking.passengers = document.getElementById("s1Pax").value;
}

function syncStep3() {
  booking.flight = document.getElementById("s3Flight").value;
  booking.airline = document.getElementById("s3Airline").value;
  booking.meetGreet = document.getElementById("s3MeetGreet").checked;
  booking.luggage = document.getElementById("s3Luggage").value;
  booking.childSeat = document.getElementById("s3ChildSeat").checked;
  booking.stops = document.getElementById("s3Stops").value;
  booking.notes = document.getElementById("s3Notes").value;
}

function syncStep4() {
  booking.name = document.getElementById("s4Name").value;
  booking.phone = document.getElementById("s4Phone").value;
  booking.email = document.getElementById("s4Email").value;
  booking.company = document.getElementById("s4Company").value;
  booking.updatesOptIn = document.getElementById("s4Updates").checked;
}

function validateStep1() {
  if (!booking.from || !booking.to) {
    alert("Please enter a pickup location and destination.");
    return false;
  }
  return true;
}

function validateStep2() {
  if (!booking.vehicleId) {
    alert("Please select a vehicle to continue.");
    return false;
  }
  return true;
}

function validateStep4() {
  if (!booking.name || !booking.phone || !booking.email) {
    alert("Please fill in your name, phone number and email.");
    return false;
  }
  return true;
}

/* ---------- NAVIGATION HANDLERS ---------- */

function initBookingFlow() {
  document.querySelectorAll("[data-open-booking]").forEach(btn => {
    btn.addEventListener("click", () => openBooking());
  });

  document.getElementById("modalClose").addEventListener("click", closeBooking);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeBooking(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("is-open")) closeBooking(); });

  // Trip type segmented control
  document.querySelectorAll("#tripType .segmented-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tripType .segmented-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      booking.tripType = btn.dataset.value;
    });
  });

  // Next / Back buttons
  document.querySelectorAll("[data-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      const current = booking.step;
      if (current === 1) { syncStep1(); if (!validateStep1()) return; goToStep(2); return; }
      if (current === 3) { syncStep3(); goToStep(4); return; }
      if (current === 4) { syncStep4(); if (!validateStep4()) return; goToStep(5); return; }
    });
  });

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const current = booking.step;
      if (current === 2) goToStep(1);
      else if (current === 3) goToStep(2);
      else if (current === 4) goToStep(3);
      else if (current === 5) goToStep(4);
    });
  });

  // Vehicle grid step needs its own validated continue since step 2 has no visible Continue button
  // (selection auto-advances), but keep a safety check via the Back button area if needed.

  document.getElementById("confirmBookingBtn").addEventListener("click", () => {
    renderConfirmation();
    goToStep(6);
  });

  document.getElementById("newBookingBtn").addEventListener("click", () => {
    resetBooking();
    goToStep(1);
  });

  document.getElementById("viewBookingBtn").addEventListener("click", () => {
    goToStep(5);
    // Restore progress display for step 5 view
    progressSteps.forEach(ps => {
      const stepNum = Number(ps.dataset.step);
      ps.classList.toggle("is-active", stepNum === 5);
      ps.classList.toggle("is-done", stepNum < 5);
    });
  });

  // Quick quote widget on homepage feeds into the same booking object
  document.getElementById("quickQuoteForm").addEventListener("submit", e => {
    e.preventDefault();
    openBooking({
      from: document.getElementById("qFrom").value,
      to: document.getElementById("qTo").value,
      date: document.getElementById("qDate").value,
      time: document.getElementById("qTime").value,
      passengers: document.getElementById("qPax").value
    });
  });
}

function resetBooking() {
  booking.from = ""; booking.to = ""; booking.date = ""; booking.time = "";
  booking.passengers = "1"; booking.tripType = "One Way"; booking.vehicleId = null;
  booking.flight = ""; booking.airline = ""; booking.meetGreet = false;
  booking.luggage = "0"; booking.childSeat = false; booking.stops = ""; booking.notes = "";
  booking.name = ""; booking.phone = ""; booking.email = ""; booking.company = "";
  booking.updatesOptIn = true;

  document.getElementById("s1From").value = "";
  document.getElementById("s1To").value = "";
  document.getElementById("s1Date").value = "";
  document.getElementById("s1Time").value = "";
  document.getElementById("s1Pax").value = "1";
  document.querySelectorAll("#tripType .segmented-btn").forEach(b => b.classList.toggle("is-active", b.dataset.value === "One Way"));
  document.getElementById("s3Flight").value = "";
  document.getElementById("s3Airline").value = "";
  document.getElementById("s3MeetGreet").checked = false;
  document.getElementById("s3Luggage").value = "0";
  document.getElementById("s3ChildSeat").checked = false;
  document.getElementById("s3Stops").value = "";
  document.getElementById("s3Notes").value = "";
  document.getElementById("s4Name").value = "";
  document.getElementById("s4Phone").value = "";
  document.getElementById("s4Email").value = "";
  document.getElementById("s4Company").value = "";
  document.getElementById("s4Updates").checked = true;
}

/* ---------- INIT ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderFleetGrid();
  renderLocationPills();
  renderRoutes();
  initAirportTabs();
  initAccordion();
  initMobileNav();
  initBookingFlow();
  initScrollReveals();
});

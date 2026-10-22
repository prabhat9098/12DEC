(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  // Set this to a WhatsApp number in international format, digits only,
  // to address RSVPs directly to a host (e.g. '919876543210').
  // Left intentionally blank because the invitation host did not provide one.
  const RSVP_WHATSAPP_NUMBER = '';
  const EVENT_START = new Date('2026-12-12T19:00:00+05:30');
  const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=The%20Park%20Club%20and%20Resort%20Itarsi%20Madhya%20Pradesh';

  const gate = document.getElementById('invitationGate');
  const openButton = document.getElementById('openInvitation');
  openButton?.addEventListener('click', () => {
    gate.classList.add('opening');
    setTimeout(() => {
      gate.classList.add('is-hidden');
      document.body.classList.remove('invitation-locked');
      gate.setAttribute('aria-hidden', 'true');
      document.getElementById('heroTitle')?.setAttribute('tabindex', '-1');
      document.getElementById('heroTitle')?.focus({preventScroll: true});
    }, 550);
  });

  const countdownElements = ['days', 'hours', 'minutes', 'seconds'].map(id => document.getElementById(id));
  const caption = document.getElementById('countdownCaption');
  function updateCountdown() {
    let diff = EVENT_START.getTime() - Date.now();
    if (diff <= 0) {
      diff = 0;
      if (caption) caption.textContent = 'OUR BEAUTIFUL DAY HAS ARRIVED';
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const minutes = Math.floor(diff / 60000) % 60;
    const seconds = Math.floor(diff / 1000) % 60;
    [days, hours, minutes, seconds].forEach((number, index) => {
      if (countdownElements[index]) countdownElements[index].textContent = String(number).padStart(2, '0');
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  navToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, {threshold: .08}) : null;
  document.querySelectorAll('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('visible'));

  function downloadCalendar() {
    // End is a one-hour placeholder required by calendars; no end time has been specified.
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Prabhat and Nidhi//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:prabhat-nidhi-20261212@wedding-invite',
      'DTSTAMP:20261022T000000Z', 'DTSTART:20261212T133000Z', 'DTEND:20261212T143000Z',
      'SUMMARY:Prabhat & Nidhi - Ring Ceremony, Haldi & Wedding',
      'LOCATION:The Park Club & Resort, Itarsi, Madhya Pradesh, India',
      'DESCRIPTION:Ring Ceremony, Haldi and Wedding. Celebrations start at 7:00 PM IST on 12 December 2026. End time has not been specified; adjust the calendar end time as needed. Directions: ' + MAPS_URL,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], {type: 'text/calendar;charset=utf-8'});
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'Prabhat-and-Nidhi-Wedding-12-Dec-2026.ics';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }
  document.getElementById('calendarButtonTop')?.addEventListener('click', downloadCalendar);
  document.getElementById('calendarButtonVenue')?.addEventListener('click', downloadCalendar);

  let guestCount = 1;
  const guestOutput = document.getElementById('guestCount');
  const updateGuestOutput = () => { if (guestOutput) guestOutput.textContent = String(guestCount); };
  document.getElementById('minusGuest')?.addEventListener('click', () => { guestCount = Math.max(1, guestCount - 1); updateGuestOutput(); });
  document.getElementById('plusGuest')?.addEventListener('click', () => { guestCount = Math.min(30, guestCount + 1); updateGuestOutput(); });
  function updateAttendance() {
    const attending = document.querySelector('input[name="attending"]:checked')?.value === 'yes';
    document.getElementById('guestRow').hidden = !attending;
    document.getElementById('ceremonyOptions').hidden = !attending;
  }
  document.querySelectorAll('input[name="attending"]').forEach(input => input.addEventListener('change', updateAttendance));
  updateAttendance();

  document.getElementById('rsvpForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    if (!name) { document.getElementById('guestName').focus(); return; }
    const attending = document.querySelector('input[name="attending"]:checked')?.value === 'yes';
    const ceremonies = [...document.querySelectorAll('input[name="ceremony"]:checked')].map(item => item.value);
    const message = attending
      ? `Hello! This is ${name}. I happily accept the invitation to Prabhat & Nidhi's wedding celebrations on 12 December 2026 at The Park, Itarsi.\nGuests (including me): ${guestCount}\nCelebrations: ${ceremonies.length ? ceremonies.join(', ') : 'Not selected'}\nLooking forward to celebrating with you! 💐`
      : `Hello! This is ${name}. Thank you for inviting me to Prabhat & Nidhi's wedding celebrations on 12 December 2026. Unfortunately, I won't be able to attend. Sending the couple lots of love and blessings! 💐`;
    const base = RSVP_WHATSAPP_NUMBER ? `https://api.whatsapp.com/send?phone=${RSVP_WHATSAPP_NUMBER}&text=` : 'https://api.whatsapp.com/send?text=';
    window.open(base + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    const note = document.getElementById('rsvpNote');
    if (note) note.textContent = RSVP_WHATSAPP_NUMBER ? 'Your message is ready in WhatsApp. Press Send to confirm your response.' : 'Your RSVP message is ready in WhatsApp. Choose a family contact and press Send to deliver it.';
  });

  document.getElementById('shareInvite')?.addEventListener('click', async () => {
    const isHosted = /^https?:$/.test(window.location.protocol);
    const text = 'You are warmly invited to Prabhat & Nidhi’s Ring Ceremony, Haldi and Wedding on Saturday, 12 December 2026, 7 PM onwards at The Park, Itarsi! 💐';
    const data = {title: 'Prabhat & Nidhi — Wedding Invitation', text, ...(isHosted ? {url: location.href.split('#')[0]} : {})};
    if (navigator.share) {
      try { await navigator.share(data); return; } catch(error) { if (error.name === 'AbortError') return; }
    }
    const shareText = text + (isHosted ? '\n' + data.url : '');
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        const button = document.getElementById('shareInvite');
        button.firstChild.textContent = 'Invitation copied ';
        setTimeout(() => button.firstChild.textContent = 'Share this invitation ', 2500);
        return;
      } catch(_error) { /* fall back */ }
    }
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText), '_blank', 'noopener,noreferrer');
  });
})();

/**
 * Script Principal — Quinceañera Brianna Itzel Gomez
 * Módulos: Countdown, Navigation, Animations, Butterflies, i18n, Calendar
 * Nota: El registro (RSVP) está cerrado — el formulario y su lógica de envío fueron retirados.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initNavigation();
    initScrollAnimations();
    initButterflies();
    initI18n();
    initCalendar();
});

/* ═══════════════════ COUNTDOWN ═══════════════════ */

function initCountdown() {
    const EVENT_DATE = new Date('2026-07-25T14:00:00-04:00');

    const els = {
        days:    document.getElementById('days'),
        hours:   document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
    };

    let timerId;

    function update() {
        const now  = new Date();
        const diff = EVENT_DATE - now;

        if (diff <= 0) {
            els.days.textContent    = '0';
            els.hours.textContent   = '0';
            els.minutes.textContent = '0';
            els.seconds.textContent = '0';
            clearInterval(timerId);
            return;
        }

        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        els.days.textContent    = String(days).padStart(3, '0');
        els.hours.textContent   = String(hours).padStart(2, '0');
        els.minutes.textContent = String(minutes).padStart(2, '0');
        els.seconds.textContent = String(seconds).padStart(2, '0');
    }

    update();
    timerId = setInterval(update, 1000);
}

/* ═══════════════════ NAVIGATION ═══════════════════ */

function initNavigation() {
    const header    = document.getElementById('header');
    const toggle    = document.getElementById('nav-toggle');
    const menu      = document.getElementById('nav-menu');
    const navLinks  = document.querySelectorAll('.nav__link');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        }
    });

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

/* ═══════════════════ SCROLL ANIMATIONS ═══════════════════ */

function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    document.querySelectorAll('.hero .animate-on-scroll').forEach(el => {
        el.classList.add('visible');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => {
        if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });
}

/* ═══════════════════ BUTTERFLIES ═══════════════════ */

function initButterflies() {
    const hero = document.getElementById('inicio');
    if (!hero) return;

    const PALETTE = [
    { body:'#7A5280', top:'#C8A2C8', topS:'#9B72A0', bot:'#B08AB0', botS:'#7A5280', spot:'#E8D5E8' },
    { body:'#9B72A0', top:'#DDB8DD', topS:'#C8A2C8', bot:'#C8A2C8', botS:'#9B72A0', spot:'#F0E0F0' },
    { body:'#888888', top:'#D0D0D0', topS:'#B0B0B0', bot:'#C0C0C0', botS:'#888888', spot:'#EFEFEF' },
    { body:'#7A5280', top:'#E8C8E8', topS:'#C8A2C8', bot:'#D0A8D0', botS:'#9B72A0', spot:'#F8EAF8' },
    { body:'#888888', top:'#E0E0E0', topS:'#AAAAAA', bot:'#CCCCCC', botS:'#888888', spot:'#F5F5F5' },
    { body:'#5A4060', top:'#B090B8', topS:'#8060A0', bot:'#9878A8', botS:'#6A4878', spot:'#D4C0DC' },
];

function makeSVG(p, s) {
    const tw=s*1.1,th=s*.75,bw=s*.75,bh=s*.55,cx=s*.08,ch=s*.85;
    return `<svg width="${s*2.4}" height="${s*2.2}" viewBox="${-s*1.2} ${-s*1.1} ${s*2.4} ${s*2.2}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g class="wing-l" style="--bt-fs:var(--bt-flap-speed)">
        <path d="M0,${-s*.1} C${-tw*.3},${-th*.9} ${-tw},${-th*.95} ${-tw*.95},${-th*.2} C${-tw},${th*.2} ${-tw*.25},${th*.5} 0,${s*.05}Z" fill="${p.top}" stroke="${p.topS}" stroke-width="0.8" opacity="0.93"/>
        <line x1="0" y1="0" x2="${-tw*.7}" y2="${-th*.6}" stroke="${p.topS}" stroke-width="0.5" opacity="0.5"/>
        <line x1="0" y1="0" x2="${-tw*.88}" y2="${-th*.05}" stroke="${p.topS}" stroke-width="0.4" opacity="0.4"/>
        <line x1="0" y1="0" x2="${-tw*.5}" y2="${th*.3}" stroke="${p.topS}" stroke-width="0.4" opacity="0.35"/>
        <circle cx="${-tw*.55}" cy="${-th*.45}" r="${s*.09}" fill="${p.spot}" opacity="0.75"/>
        <path d="M0,${s*.05} C${-bw*.3},${s*.1} ${-bw},${bh*.5} ${-bw*.85},${bh*.95} C${-bw*.5},${bh*1.15} ${-bw*.1},${bh*.7} 0,${s*.45}Z" fill="${p.bot}" stroke="${p.botS}" stroke-width="0.7" opacity="0.85"/>
        <circle cx="${-bw*.5}" cy="${bh*.6}" r="${s*.07}" fill="${p.spot}" opacity="0.6"/>
        </g>
        <g class="wing-r" style="--bt-fs:var(--bt-flap-speed)">
        <path d="M0,${-s*.1} C${tw*.3},${-th*.9} ${tw},${-th*.95} ${tw*.95},${-th*.2} C${tw},${th*.2} ${tw*.25},${th*.5} 0,${s*.05}Z" fill="${p.top}" stroke="${p.topS}" stroke-width="0.8" opacity="0.93"/>
        <line x1="0" y1="0" x2="${tw*.7}" y2="${-th*.6}" stroke="${p.topS}" stroke-width="0.5" opacity="0.5"/>
        <line x1="0" y1="0" x2="${tw*.88}" y2="${-th*.05}" stroke="${p.topS}" stroke-width="0.4" opacity="0.4"/>
        <line x1="0" y1="0" x2="${tw*.5}" y2="${th*.3}" stroke="${p.topS}" stroke-width="0.4" opacity="0.35"/>
        <circle cx="${tw*.55}" cy="${-th*.45}" r="${s*.09}" fill="${p.spot}" opacity="0.75"/>
        <path d="M0,${s*.05} C${bw*.3},${s*.1} ${bw},${bh*.5} ${bw*.85},${bh*.95} C${bw*.5},${bh*1.15} ${bw*.1},${bh*.7} 0,${s*.45}Z" fill="${p.bot}" stroke="${p.botS}" stroke-width="0.7" opacity="0.85"/>
        <circle cx="${bw*.5}" cy="${bh*.6}" r="${s*.07}" fill="${p.spot}" opacity="0.6"/>
        </g>
        <ellipse cx="0" cy="${s*.15}" rx="${cx}" ry="${ch}" fill="${p.body}" opacity="0.95"/>
        <path d="M${-cx},${-ch*.7} Q${-s*.18},${-s*.9} ${-s*.12},${-s*1.0}" fill="none" stroke="${p.body}" stroke-width="0.6" opacity="0.7"/>
        <circle cx="${-s*.12}" cy="${-s*1.0}" r="${s*.04}" fill="${p.body}" opacity="0.7"/>
        <path d="M${cx},${-ch*.7} Q${s*.18},${-s*.9} ${s*.12},${-s*1.0}" fill="none" stroke="${p.body}" stroke-width="0.6" opacity="0.7"/>
        <circle cx="${s*.12}" cy="${-s*1.0}" r="${s*.04}" fill="${p.body}" opacity="0.7"/>
    </svg>`;
}

const CONFIGS = [
    { x: 12, delay: 0,   driftX: -0.8, size: 28, flapSpeed: 0.28 },
    { x: 28, delay: 180, driftX:  0.5, size: 22, flapSpeed: 0.22 },
    { x: 50, delay: 80,  driftX: -0.3, size: 32, flapSpeed: 0.31 },
    { x: 65, delay: 300, driftX:  1.0, size: 20, flapSpeed: 0.20 },
    { x: 78, delay: 140, driftX: -0.6, size: 26, flapSpeed: 0.26 },
    { x: 90, delay: 240, driftX:  0.4, size: 24, flapSpeed: 0.24 },
];

const instances = CONFIGS.map((cfg, i) => {
    const p  = PALETTE[i % PALETTE.length];
    const el = document.createElement('div');
    el.className = 'butterfly';
    el.style.cssText = `position:absolute;pointer-events:none;will-change:transform,opacity;opacity:0;left:${cfg.x}%;`;
    el.style.setProperty('--bt-flap-speed', cfg.flapSpeed + 's');
    el.innerHTML = makeSVG(p, cfg.size);
    hero.appendChild(el);

    return { el, delay: cfg.delay, driftX: cfg.driftX, x: cfg.x,
             started: false, done: false, t: 0, totalT: 320 };
  });

  let globalT = 0;

  function tick() {
    globalT++;
    let allDone = true;

    instances.forEach(b => {
      if (b.done) return;
      if (globalT < b.delay) { allDone = false; return; }
      if (!b.started) b.started = true;
      b.t++;
      allDone = false;

      const progress = b.t / b.totalT;
      let opacity;
      if (progress < 0.1)      opacity = progress / 0.1;
      else if (progress > 0.8) opacity = (1 - progress) / 0.2;
      else                     opacity = 1;

      const yPct   = 100 - progress * 130;
      const wobble = Math.sin(b.t * 0.045) * 2.5;
      const xPct   = b.x + b.driftX * progress * 18 + wobble;
      const tilt   = b.driftX * 12 + wobble * 0.8;

      b.el.style.left      = xPct + '%';
      b.el.style.top       = yPct + '%';
      b.el.style.opacity   = opacity.toFixed(3);
      b.el.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;

      if (b.t >= b.totalT) {
        b.done = true;
        b.el.remove(); // limpia el DOM al terminar
      }
    });

    if (!allDone) requestAnimationFrame(tick);
  }

  // Espera a que el hero sea visible antes de lanzar
  setTimeout(() => requestAnimationFrame(tick), 600);
}

/* ═══════════════════ i18n — BILINGUAL SYSTEM ═══════════════════ */

const translations = {
    es: {
        nav_inicio: 'Inicio',
        nav_invitacion: 'Invitación',
        nav_historia: 'Historia',
        nav_evento: 'Evento',
        nav_faq: 'Preguntas',
        nav_confirmar: 'Asistencia',
        hero_pre: 'Con la bendición de Dios',
        hero_title: 'Mis XV Años',
        hero_date: '25 de Julio, 2026',
        hero_cta: 'Ver Detalles del Evento',
        hero_calendar: 'Añadir al Calendario',
        cal_google: 'Google Calendar',
        cal_apple: 'Apple / Outlook',
        cd_days: 'Días',
        cd_hours: 'Horas',
        cd_min: 'Min',
        cd_sec: 'Seg',
        inv_blessing: 'Con la bendición de Dios y mis familiares\nestás cordialmente invitado a',
        inv_title: 'Mis XV Años',
        inv_message: 'Ha llegado un momento muy especial en mi vida, muchos recuerdos con familia y amigos que me han traído a este punto. Ahora entra una etapa nueva en mi vida y espero puedan celebrar conmigo, gracias.',
        inv_parents: 'Padres',
        inv_godparents: 'Padrinos',
        story_title: 'A Través de los Años',
        photo_1: 'Mis primeros pasos',
        photo_2: 'Creciendo con fe',
        photo_3: 'Hoy, mis XV Años',
        event_title: 'Detalles del Evento',
        event_ceremony: 'Ceremonia Religiosa',
        event_reception: 'Recepción',
        event_map: 'Ver Ubicación',
        event_after: '7:00 PM',
        event_arrival: 'Favor de llegar 30 minutos antes',
        proto_dress: 'Código de Vestimenta',
        proto_formal: 'Formal — Etiqueta Rigurosa',
        proto_no_purple: 'Favor de NO usar el color morado',
        proto_note: 'Nota Especial',
        proto_envelopes: 'Lluvia de Sobres',
        faq_title: 'Preguntas Frecuentes',
        faq_alert: 'Información importante para nuestros invitados confirmados',
        faq_q1: '¿Cuál es el código de vestimenta?',
        faq_a1: 'Formal (Etiqueta Rigurosa). Te pedimos amablemente NO utilizar el color morado ni plateado, ya que están reservados para la Quinceañera.',
        faq_q2: '¿Puedo llevar un acompañante o niños (plus one)?',
        faq_a2: 'Nuestra recepción es un evento privado y con capacidad limitada. Te rogamos asistir únicamente las personas especificadas en el formulario de confirmación (RSVP).',
        faq_q3: '¿Tienen alguna sugerencia de regalo?',
        faq_a3: 'El mejor regalo es tu presencia. Si deseas tener un detalle adicional con Brianna, agradecemos mucho el formato de "Lluvia de Sobres" (Efectivo o Gift Cards).',
        faq_q4: '¿Aún puedo confirmar mi asistencia?',
        faq_a4: 'El periodo de confirmación ha concluido y nuestra lista de invitados está completa. Únicamente las personas que completaron su registro podrán asistir. Si ya confirmaste y necesitas comunicarnos algún cambio, con gusto te atendemos al 973-851-7863.',
        rsvp_title: 'Confirmaciones Cerradas',
        rsvp_deadline: 'Evento privado — Acceso exclusivo para invitados confirmados',
        closed_title: 'Nuestra lista de invitados está completa',
        closed_msg1: 'El periodo para confirmar asistencia ha concluido. Agradecemos de todo corazón a cada una de las personas que confirmaron su presencia; será un honor compartir con ustedes este día tan especial.',
        closed_msg2: 'Por respeto al aforo y a la organización del evento, únicamente podrán asistir las personas que completaron su confirmación. La información de esta invitación está dirigida exclusivamente a ellas.',
        closed_date_label: 'Fecha',
        closed_date: 'Sábado, 25 de Julio, 2026',
        closed_church: "2:00 PM — Iglesia St. Bonaventure's<br>174 Ramsey St., Paterson, NJ 07501",
        closed_banquet: '7:00 PM — Milan Banquets<br>32 Passaic St., Garfield, NJ 07026',
        closed_farewell: 'Con cariño, Brianna y su familia',
        alt_phone: '¿Tienes alguna pregunta sobre el evento?',
    },
    en: {
        nav_inicio: 'Home',
        nav_invitacion: 'Invitation',
        nav_historia: 'Story',
        nav_evento: 'Event',
        nav_faq: 'Questions',
        nav_confirmar: 'Attendance',
        hero_pre: 'With the blessing of God',
        hero_title: 'My XV Years',
        hero_date: 'July 25, 2026',
        hero_cta: 'View Event Details',
        hero_calendar: 'Add to Calendar',
        cal_google: 'Google Calendar',
        cal_apple: 'Apple / Outlook',
        cd_days: 'Days',
        cd_hours: 'Hours',
        cd_min: 'Min',
        cd_sec: 'Sec',
        inv_blessing: 'With the blessing of God and my family\nyou are cordially invited to',
        inv_title: 'My Quinceañera',
        inv_message: 'A very special moment in my life has arrived, many memories with family and friends have brought me to this point. Now a new chapter begins and I hope you can celebrate with me, thank you.',
        inv_parents: 'Parents',
        inv_godparents: 'Godparents',
        story_title: 'Through the Years',
        photo_1: 'My first steps',
        photo_2: 'Growing with faith',
        photo_3: 'Today, my XV Years',
        event_title: 'Event Details',
        event_ceremony: 'Religious Ceremony',
        event_reception: 'Reception',
        event_map: 'View Location',
        event_after: '7:00 PM',
        event_arrival: 'Please arrive 30 minutes early',
        proto_dress: 'Dress Code',
        proto_formal: 'Formal — Black Tie',
        proto_no_purple: 'Please do NOT wear purple',
        proto_note: 'Special Note',
        proto_envelopes: 'Envelope Rain',
        faq_title: 'Frequently Asked Questions',
        faq_alert: 'Important information for our confirmed guests',
        faq_q1: 'What is the dress code?',
        faq_a1: 'Formal (Black Tie). We kindly ask that you DO NOT wear purple or silver, as they are reserved for the Quinceañera.',
        faq_q2: 'Can I bring a plus one or children?',
        faq_a2: 'Our reception is a private event with limited capacity. We request that only the people specified in your confirmation form (RSVP) attend.',
        faq_q3: 'Do you have a gift registry?',
        faq_a3: 'Your presence is the best gift. If you wish to bring an additional detail for Brianna, we deeply appreciate the "Envelope Rain" format (Cash or Gift Cards).',
        faq_q4: 'Can I still RSVP?',
        faq_a4: 'The confirmation period has come to an end and our guest list is complete. Only guests who completed their registration will be able to attend. If you already confirmed and need to let us know about a change, we will gladly assist you at 973-851-7863.',
        rsvp_title: 'RSVP Closed',
        rsvp_deadline: 'Private event — Admission exclusively for confirmed guests',
        closed_title: 'Our guest list is complete',
        closed_msg1: 'The period to confirm attendance has come to an end. We wholeheartedly thank each person who confirmed their presence; it will be an honor to share this special day with you.',
        closed_msg2: 'Out of respect for the venue capacity and the organization of the event, only guests who completed their confirmation will be able to attend. The information on this invitation is intended exclusively for them.',
        closed_date_label: 'Date',
        closed_date: 'Saturday, July 25, 2026',
        closed_church: "2:00 PM — St. Bonaventure's Church<br>174 Ramsey St., Paterson, NJ 07501",
        closed_banquet: '7:00 PM — Milan Banquets<br>32 Passaic St., Garfield, NJ 07026',
        closed_farewell: 'With love, Brianna and her family',
        alt_phone: 'Have a question about the event?',
    }
};

function initI18n() {
    const btn = document.getElementById('lang-toggle');
    let currentLang = 'es';

    btn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        setLanguage(currentLang);
        btn.textContent = currentLang === 'es' ? 'EN' : 'ES';
        document.documentElement.lang = currentLang;
    });
}

function setLanguage(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key] === undefined) return;

        if (key === 'inv_blessing' || key === 'closed_church' || key === 'closed_banquet') {
            el.innerHTML = dict[key].replace(/\n/g, '<br>');
        } else {
            el.textContent = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (dict[key]) el.placeholder = dict[key];
    });
}

/* ═══════════════════ CALENDAR ═══════════════════ */

function initCalendar() {
    const btn = document.getElementById('calendar-btn');
    const content = document.getElementById('calendar-content');
    const appleBtn = document.getElementById('apple-calendar-btn');

    if (!btn || !content) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        content.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!content.contains(e.target)) {
            content.classList.remove('show');
        }
    });

    if (appleBtn) {
        appleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Brianna Quinceanera//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Mis XV Años - Brianna Itzel Gomez
DTSTART:20260725T180000Z
DTEND:20260726T030000Z
LOCATION:174 Ramsey St\\, Paterson\\, NJ 07501
DESCRIPTION:Celebra conmigo este día tan especial.
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT60M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

            const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Brianna_XV.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            content.classList.remove('show');
        });
    }
}

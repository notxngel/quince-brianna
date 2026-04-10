/**
 * Script Principal — Quinceañera Brianna Itzel Gomez
 * Módulos: Countdown, RSVP, Navigation, Animations, Butterflies, i18n
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initNavigation();
    initScrollAnimations();
    initRSVPForm();
    initButterflies();
    initI18n();
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

/* ═══════════════════ RSVP FORM ═══════════════════ */

function initRSVPForm() {
    const form       = document.getElementById('rsvp-form');
    const submitBtn  = document.getElementById('submit-btn');
    const btnText    = submitBtn.querySelector('.btn__text');
    const btnLoader  = submitBtn.querySelector('.btn__loader');
    const successEl  = document.getElementById('rsvp-success');
    const errorEl    = document.getElementById('rsvp-error');

    const WEBHOOK_URL = 'https://hook.us1.make.com/TU_WEBHOOK_AQUI';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const name      = form.name.value.trim();
        const attending = form.attending.value;
        let isValid = true;

        if (!name || name.length < 2) {
            showError('name', 'Por favor ingresa tu nombre completo');
            isValid = false;
        }

        if (!attending) {
            showError('attending', 'Selecciona una opción');
            isValid = false;
        }

        if (!isValid) return;

        const payload = {
            nombre:       name,
            asistira:     attending,
            invitados:    form.guests.value,
            notas:        form.notes.value.trim(),
            fecha_envio:  new Date().toLocaleString('es-US', { timeZone: 'America/New_York' }),
        };

        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            form.classList.add('hidden');
            successEl.classList.remove('hidden');

        } catch (err) {
            console.error('RSVP Error:', err);
            errorEl.classList.remove('hidden');

            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });

    function showError(fieldId, message) {
        const errorSpan = document.getElementById(`${fieldId}-error`);
        const input     = document.getElementById(fieldId);
        if (errorSpan) errorSpan.textContent = message;
        if (input) input.classList.add('error');
    }

    function clearErrors() {
        document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        errorEl.classList.add('hidden');
    }
}

/* ═══════════════════ BUTTERFLIES ═══════════════════ */

function initButterflies() {
    const COLORS = ['#C8A2C8', '#D8BFD8', '#C0C0C0', '#B0A0B8', '#A9A9C8', '#DCD0E0', '#B8B8D0', '#C4B0C4'];
    const COUNT = 8;

    for (let i = 0; i < COUNT; i++) {
        const el = document.createElement('span');
        el.className = 'butterfly';
        el.setAttribute('aria-hidden', 'true');

        const inner = document.createElement('span');
        inner.className = 'butterfly__inner';
        inner.textContent = '🦋';
        el.appendChild(inner);

        const duration = 10 + Math.random() * 8;
        const delay = Math.random() * duration;
        const left = Math.random() * 100;
        const size = 1 + Math.random() * 0.8;

        el.style.setProperty('--duration', `${duration}s`);
        el.style.setProperty('--delay', `-${delay}s`);
        el.style.left = `${left}%`;
        el.style.fontSize = `${size}rem`;
        el.style.filter = `hue-rotate(${COLORS.indexOf(COLORS[i % COLORS.length]) * 30}deg)`;

        document.body.appendChild(el);
    }
}

/* ═══════════════════ i18n — BILINGUAL SYSTEM ═══════════════════ */

const translations = {
    es: {
        nav_inicio: 'Inicio',
        nav_invitacion: 'Invitación',
        nav_historia: 'Historia',
        nav_evento: 'Evento',
        nav_confirmar: 'Confirmar',
        hero_pre: 'Con la bendición de Dios',
        hero_title: 'Mis XV Años',
        hero_date: '25 de Julio, 2026',
        hero_cta: 'Confirmar Asistencia',
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
        event_after: 'Después de la ceremonia',
        event_arrival: 'Favor de llegar 30 minutos antes',
        proto_dress: 'Código de Vestimenta',
        proto_formal: 'Formal — Etiqueta Rigurosa',
        proto_no_purple: 'Favor de NO usar el color morado',
        proto_note: 'Nota Especial',
        proto_envelopes: 'Lluvia de Sobres',
        rsvp_title: 'Confirmar Asistencia',
        rsvp_deadline: 'Favor de confirmar antes del <strong><time datetime="2026-06-25">25 de Junio, 2026</time></strong>',
        form_name: 'Nombre Completo',
        form_name_ph: 'Ej: María García',
        form_attending: '¿Asistirás?',
        form_select: 'Selecciona...',
        form_yes: 'Sí, asistiré',
        form_no: 'No podré asistir',
        form_guests: 'Número de Personas',
        form_1p: '1 Persona',
        form_2p: '2 Personas',
        form_3p: '3 Personas',
        form_4p: '4 Personas',
        form_5p: '5 Personas',
        form_notes: 'Alergias o Notas',
        form_notes_ph: 'Restricciones alimenticias, mensaje, etc.',
        form_submit: 'Enviar Confirmación',
        form_sending: 'Enviando...',
        success_title: 'Gracias por confirmar',
        success_msg: 'Tu respuesta ha sido registrada exitosamente.<br>Nos vemos el <time datetime="2026-07-25">25 de Julio</time>.',
        error_msg: 'Hubo un problema al enviar. Puedes confirmar directamente al:',
        error_call: 'Llamar al 973-851-7863',
        alt_phone: '¿Prefieres confirmar por teléfono?',
    },
    en: {
        nav_inicio: 'Home',
        nav_invitacion: 'Invitation',
        nav_historia: 'Story',
        nav_evento: 'Event',
        nav_confirmar: 'RSVP',
        hero_pre: 'With the blessing of God',
        hero_title: 'My XV Years',
        hero_date: 'July 25, 2026',
        hero_cta: 'Confirm Attendance',
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
        event_after: 'After the ceremony',
        event_arrival: 'Please arrive 30 minutes early',
        proto_dress: 'Dress Code',
        proto_formal: 'Formal — Black Tie',
        proto_no_purple: 'Please do NOT wear purple',
        proto_note: 'Special Note',
        proto_envelopes: 'Envelope Rain',
        rsvp_title: 'Confirm Attendance',
        rsvp_deadline: 'Please confirm before <strong><time datetime="2026-06-25">June 25, 2026</time></strong>',
        form_name: 'Full Name',
        form_name_ph: 'E.g: Maria Garcia',
        form_attending: 'Will you attend?',
        form_select: 'Select...',
        form_yes: 'Yes, I will attend',
        form_no: 'I will not be able to attend',
        form_guests: 'Number of Guests',
        form_1p: '1 Person',
        form_2p: '2 People',
        form_3p: '3 People',
        form_4p: '4 People',
        form_5p: '5 People',
        form_notes: 'Allergies or Notes',
        form_notes_ph: 'Dietary restrictions, message, etc.',
        form_submit: 'Send Confirmation',
        form_sending: 'Sending...',
        success_title: 'Thank you for confirming',
        success_msg: 'Your response has been successfully recorded.<br>See you on <time datetime="2026-07-25">July 25</time>.',
        error_msg: 'There was a problem sending. You can confirm directly at:',
        error_call: 'Call 973-851-7863',
        alt_phone: 'Prefer to confirm by phone?',
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

        if (key === 'rsvp_deadline' || key === 'success_msg' || key === 'inv_blessing') {
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

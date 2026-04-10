/**
 * ═══════════════════════════════════════════════════════
 * Script Principal — Quinceañera Brianna Itzel Gomez
 * Módulos: Countdown, RSVP Webhook, Navigation, Animations
 * ═══════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initNavigation();
    initScrollAnimations();
    initRSVPForm();
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

    // Hamburger toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
    });

    // Cerrar menú al hacer click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        });
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        }
    });

    // Header compacto al hacer scroll
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

/* ═══════════════════ SCROLL ANIMATIONS ═══════════════════ */

function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    // Los elementos del hero se hacen visibles inmediatamente
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
        // Omitir los que ya están visibles (hero)
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

    // ⚠️ REEMPLAZAR con la URL real de tu Webhook de Make.com
    const WEBHOOK_URL = 'https://hook.us1.make.com/TU_WEBHOOK_AQUI';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        // Validación
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

        // Preparar datos
        const payload = {
            nombre:       name,
            asistira:     attending,
            invitados:    form.guests.value,
            notas:        form.notes.value.trim(),
            fecha_envio:  new Date().toLocaleString('es-US', { timeZone: 'America/New_York' }),
        };

        // UI: Estado de carga
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

            // Éxito
            form.classList.add('hidden');
            successEl.classList.remove('hidden');

        } catch (err) {
            console.error('RSVP Error:', err);
            // Mostrar fallback de contacto directo
            errorEl.classList.remove('hidden');

            // Rehabilitar botón para reintentar
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

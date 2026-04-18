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

/* ═══════════════════ RSVP FORM — SISTEMA BLINDADO ═══════════════════ */
/*
 * 5 CAPAS DE SEGURIDAD:
 * 1. Validación estricta — Ningún campo sale vacío o con datos basura
 * 2. Respaldo localStorage — Los datos se guardan ANTES de enviar
 * 3. Verificación del payload — Se confirma que el JSON no esté vacío
 * 4. Reintentos automáticos — Si falla, reintenta 3 veces con espera progresiva
 * 5. Cola offline — Si no hay internet, guarda y reenvía cuando vuelva la conexión
 */

function initRSVPForm() {
    const form       = document.getElementById('rsvp-form');
    const submitBtn  = document.getElementById('submit-btn');
    const btnText    = submitBtn.querySelector('.btn__text');
    const btnLoader  = submitBtn.querySelector('.btn__loader');
    const successEl  = document.getElementById('rsvp-success');
    const errorEl    = document.getElementById('rsvp-error');

    const WEBHOOK_URL = 'https://hook.us2.make.com/dod3woso8orm9cu4jc5tip49ni6vnkdw';
    const STORAGE_KEY = 'rsvp_submitted_brianna';
    const PENDING_KEY = 'rsvp_pending_brianna';
    const MAX_RETRIES = 3;

    // Administrador: Restablecer el bloqueo mediante URL (?admin_reset=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('admin_reset')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PENDING_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Verificar si ya se registró en este dispositivo
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
        form.classList.add('hidden');
        successEl.classList.remove('hidden');
    }

    // ── CAPA 5: Al cargar, intentar reenviar datos pendientes ──
    retrySendPending();

    // ── Listener principal del formulario ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        // ── CAPA 1: Validación estricta de cada campo ──
        const name      = safeGetValue(form, 'name');
        const attending = safeGetValue(form, 'attending');
        const guests    = safeGetValue(form, 'guests');
        const notes     = safeGetValue(form, 'notes');

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
            invitados:    guests || '1',
            notas:        notes || '',
        };

        // ── CAPA 3: Verificar que el payload NO esté vacío ──
        if (!verifyPayload(payload)) {
            console.error('RSVP CRÍTICO: Payload vacío detectado, abortando envío.');
            showError('name', 'Error interno. Intenta de nuevo.');
            return;
        }

        // ── CAPA 2: Guardar respaldo en localStorage ANTES de enviar ──
        savePending(payload);

        // Mostrar estado de carga
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        // ── CAPA 4: Enviar con reintentos automáticos ──
        const success = await sendWithRetry(payload, MAX_RETRIES);

        if (success) {
            // Limpiar cola pendiente y marcar como enviado
            localStorage.removeItem(PENDING_KEY);
            localStorage.setItem(STORAGE_KEY, 'true');
            form.classList.add('hidden');
            successEl.classList.remove('hidden');
        } else {
            // Si todos los reintentos fallaron, los datos quedan en localStorage
            // y se reenviarán automáticamente cuando vuelva el internet (CAPA 5)
            console.warn('RSVP: Todos los reintentos fallaron. Datos guardados para reenvío.');
            errorEl.classList.remove('hidden');
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });

    // ═══════════════════════════════════════════════════
    //  FUNCIONES DE SEGURIDAD
    // ═══════════════════════════════════════════════════

    /**
     * CAPA 1: Extrae el valor de un campo de forma segura.
     * Usa form.elements[] para evitar el bug de "property shadowing"
     * donde form.name devuelve el nombre del formulario en vez del campo.
     */
    function safeGetValue(formEl, fieldName) {
        try {
            // Método principal: form.elements (el más seguro)
            const element = formEl.elements[fieldName];
            if (element && element.value !== undefined) {
                return String(element.value).trim();
            }

            // Fallback 1: getElementById
            const byId = document.getElementById(fieldName);
            if (byId && byId.value !== undefined) {
                return String(byId.value).trim();
            }

            // Fallback 2: querySelector dentro del form
            const bySelector = formEl.querySelector(`[name="${fieldName}"]`);
            if (bySelector && bySelector.value !== undefined) {
                return String(bySelector.value).trim();
            }

            return '';
        } catch (err) {
            console.error(`RSVP: Error leyendo campo "${fieldName}":`, err);
            return '';
        }
    }

    /**
     * CAPA 3: Verifica que el payload tenga datos reales antes de enviarlo.
     * Si el nombre o la asistencia están vacíos, bloquea el envío.
     */
    function verifyPayload(payload) {
        if (!payload) return false;
        if (typeof payload.nombre !== 'string' || payload.nombre.length < 2) return false;
        if (typeof payload.asistira !== 'string' || payload.asistira.length === 0) return false;

        // Verificar que el JSON stringificado tenga contenido real
        const json = JSON.stringify(payload);
        if (json === '{}' || json === '[]' || json.length < 20) return false;

        return true;
    }

    /**
     * CAPA 2: Guarda los datos en localStorage como respaldo.
     * Si el envío falla, los datos no se pierden jamás.
     */
    function savePending(payload) {
        try {
            localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
        } catch (err) {
            console.warn('RSVP: No se pudo guardar respaldo local:', err);
        }
    }

    /**
     * CAPA 4: Envía los datos con reintentos automáticos.
     * Si falla, espera progresivamente más tiempo antes de reintentar.
     * Intento 1: inmediato | Intento 2: 2s | Intento 3: 4s
     */
    async function sendWithRetry(payload, maxRetries) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Verificar conexión antes de enviar
                if (!navigator.onLine) {
                    console.warn(`RSVP: Sin internet (intento ${attempt}/${maxRetries}).`);
                    if (attempt < maxRetries) {
                        await wait(2000 * attempt);
                        continue;
                    }
                    return false;
                }

                const jsonBody = JSON.stringify(payload);

                // Última verificación: el body no puede ser vacío
                if (jsonBody === '{}' || jsonBody.length < 20) {
                    console.error('RSVP CRÍTICO: Body vacío en intento', attempt);
                    return false;
                }

                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: jsonBody,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                console.log(`RSVP: Enviado exitosamente (intento ${attempt}).`);
                return true;

            } catch (err) {
                console.warn(`RSVP: Fallo intento ${attempt}/${maxRetries}:`, err.message);

                if (attempt < maxRetries) {
                    // Espera progresiva: 2s, 4s (backoff exponencial)
                    await wait(2000 * attempt);
                }
            }
        }
        return false;
    }

    /**
     * CAPA 5: Reenvía datos pendientes guardados en localStorage.
     * Se ejecuta al cargar la página Y cuando el internet se reconecta.
     * Así, si el usuario cierra la página sin internet, la próxima vez
     * que la abra, los datos se envían automáticamente.
     */
    async function retrySendPending() {
        const pendingRaw = localStorage.getItem(PENDING_KEY);
        if (!pendingRaw) return;

        try {
            const payload = JSON.parse(pendingRaw);

            // Verificar que los datos pendientes sean válidos
            if (!verifyPayload(payload)) {
                localStorage.removeItem(PENDING_KEY);
                return;
            }

            // Solo intentar si hay internet
            if (!navigator.onLine) return;

            console.log('RSVP: Reenviando datos pendientes...');
            const success = await sendWithRetry(payload, MAX_RETRIES);

            if (success) {
                localStorage.removeItem(PENDING_KEY);
                localStorage.setItem(STORAGE_KEY, 'true');
                console.log('RSVP: Datos pendientes enviados exitosamente.');

                // Si el formulario está visible, mostrar éxito
                if (!form.classList.contains('hidden')) {
                    form.classList.add('hidden');
                    successEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            console.error('RSVP: Error al reenviar pendientes:', err);
        }
    }

    // ── CAPA 5 (continuación): Escuchar cuando vuelva el internet ──
    window.addEventListener('online', () => {
        console.log('RSVP: Internet restaurado. Verificando pendientes...');
        retrySendPending();
    });

    /** Utilidad: espera N milisegundos */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
        nav_confirmar: 'Confirmar',
        hero_pre: 'Con la bendición de Dios',
        hero_title: 'Mis XV Años',
        hero_date: '25 de Julio, 2026',
        hero_cta: 'Confirmar Asistencia',
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
        faq_alert: '¡Atención! Por favor lee esto antes de confirmar',
        faq_q1: '¿Cuál es el código de vestimenta?',
        faq_a1: 'Formal (Etiqueta Rigurosa). Te pedimos amablemente NO utilizar el color morado ni plateado, ya que están reservados para la Quinceañera.',
        faq_q2: '¿Puedo llevar un acompañante o niños (plus one)?',
        faq_a2: 'Nuestra recepción es un evento privado y con capacidad limitada. Te rogamos asistir únicamente las personas especificadas en el formulario de confirmación (RSVP).',
        faq_q3: '¿Tienen alguna sugerencia de regalo?',
        faq_a3: 'El mejor regalo es tu presencia. Si deseas tener un detalle adicional con Brianna, agradecemos mucho el formato de "Lluvia de Sobres" (Efectivo o Gift Cards).',
        faq_q4: '¿Cuál es la fecha límite para confirmar asistencia?',
        faq_a4: 'Por favor confírmanos tu asistencia a más tardar el 25 de Junio, 2026, para poder organizar todos los detalles con anticipación.',
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
        nav_faq: 'Questions',
        nav_confirmar: 'RSVP',
        hero_pre: 'With the blessing of God',
        hero_title: 'My XV Years',
        hero_date: 'July 25, 2026',
        hero_cta: 'Confirm Attendance',
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
        faq_alert: 'Attention! Please read this before confirming',
        faq_q1: 'What is the dress code?',
        faq_a1: 'Formal (Black Tie). We kindly ask that you DO NOT wear purple or silver, as they are reserved for the Quinceañera.',
        faq_q2: 'Can I bring a plus one or children?',
        faq_a2: 'Our reception is a private event with limited capacity. We request that only the people specified in your confirmation form (RSVP) attend.',
        faq_q3: 'Do you have a gift registry?',
        faq_a3: 'Your presence is the best gift. If you wish to bring an additional detail for Brianna, we deeply appreciate the "Envelope Rain" format (Cash or Gift Cards).',
        faq_q4: 'What is the RSVP deadline?',
        faq_a4: 'Please confirm your attendance no later than June 25, 2026, so we can organize all details in advance.',
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

/**
 * XV Años — Brianna Itzel Gomez
 * Página de cierre de confirmaciones (evento privado)
 * Módulos: i18n, Calendario
 * Nota: El registro (RSVP) está cerrado — el formulario y su lógica de envío fueron retirados.
 */

document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    initCalendar();
});

/* ═══════════════════ i18n — BILINGUAL SYSTEM ═══════════════════ */

const translations = {
    es: {
        overline: 'Mis XV Años',
        notice: 'Evento privado — Acceso exclusivo para invitados confirmados',
        closed_title: 'Nuestra lista de invitados está completa',
        closed_msg1: 'El periodo para confirmar asistencia ha concluido. Agradecemos de todo corazón a cada una de las personas que confirmaron su presencia; será un honor compartir con ustedes este día tan especial.',
        closed_msg2: 'Por respeto al aforo y a la organización del evento, únicamente podrán asistir las personas que completaron su confirmación. La información de esta invitación está dirigida exclusivamente a ellas.',
        date_label: 'Fecha',
        date_value: 'Sábado, 25 de Julio, 2026',
        ceremony_label: 'Ceremonia Religiosa',
        ceremony_value: "2:00 PM — Iglesia St. Bonaventure's<br>174 Ramsey St., Paterson, NJ 07501",
        reception_label: 'Recepción',
        reception_value: '7:00 PM — Milan Banquets<br>32 Passaic St., Garfield, NJ 07026',
        map_link: 'Ver mapa',
        cal_btn: 'Añadir al Calendario',
        cal_google: 'Google Calendar',
        cal_apple: 'Apple / Outlook',
        farewell: 'Con cariño, Brianna y su familia',
        phone_q: '¿Tienes alguna pregunta sobre el evento?',
    },
    en: {
        overline: 'My XV Years',
        notice: 'Private event — Admission exclusively for confirmed guests',
        closed_title: 'Our guest list is complete',
        closed_msg1: 'The period to confirm attendance has come to an end. We wholeheartedly thank each person who confirmed their presence; it will be an honor to share this special day with you.',
        closed_msg2: 'Out of respect for the venue capacity and the organization of the event, only guests who completed their confirmation will be able to attend. The information on this invitation is intended exclusively for them.',
        date_label: 'Date',
        date_value: 'Saturday, July 25, 2026',
        ceremony_label: 'Religious Ceremony',
        ceremony_value: "2:00 PM — St. Bonaventure's Church<br>174 Ramsey St., Paterson, NJ 07501",
        reception_label: 'Reception',
        reception_value: '7:00 PM — Milan Banquets<br>32 Passaic St., Garfield, NJ 07026',
        map_link: 'View map',
        cal_btn: 'Add to Calendar',
        cal_google: 'Google Calendar',
        cal_apple: 'Apple / Outlook',
        farewell: 'With love, Brianna and her family',
        phone_q: 'Have a question about the event?',
    }
};

/* Claves cuyo texto contiene HTML (<br>) */
const HTML_KEYS = ['ceremony_value', 'reception_value'];

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

        if (HTML_KEYS.includes(key)) {
            el.innerHTML = dict[key];
        } else {
            el.textContent = dict[key];
        }
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

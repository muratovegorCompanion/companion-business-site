/**
 * Приймач заявок з форми «Домовитися про зустріч».
 * Cloudflare Worker: сайт на GitHub Pages не має власного бекенду,
 * а токен бота не можна тримати в коді сторінки.
 *
 * Секрети (Workers → Settings → Variables and Secrets):
 *   TELEGRAM_BOT_TOKEN   — токен бота від @BotFather
 *   TELEGRAM_CHAT_ID     — id чату або каналу, куди падають заявки
 *   ALLOWED_ORIGIN       — https://icompanion.com.ua (можна кілька через кому)
 *   RESEND_API_KEY       — необов’язково: дубль заявки на пошту
 *   MAIL_TO              — необов’язково: egor_m@icompanion.com.ua
 *   MAIL_BCC             — необов’язково: прихована копія
 *   MAIL_FROM            — необов’язково: verified-адреса відправника у Resend
 *
 * Деплой:
 *   npx wrangler deploy worker/meeting-form-worker.js --name companion-meeting-form
 */

const FIELDS = {
  name: { label: "Ім’я", max: 100, required: true },
  company: { label: 'Компанія', max: 160, required: true },
  contact: { label: 'Телефон або email', max: 180, required: true },
  interest: { label: 'Тема', max: 120, required: false },
  topic: { label: 'Тема', max: 120, required: false },
  message: { label: 'Задача', max: 2000, required: false },
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) },
  });

export default {
  async fetch(request, env) {
    // Під час переїзду сайт живе на двох доменах, тож приймаємо список.
    const allowedList = (env.ALLOWED_ORIGIN || 'https://icompanion.com.ua,https://sb-companion.com')
      .split(',').map((value) => value.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');
    // У відповідь віддаємо саме той origin, з якого прийшов запит,
    // інакше браузер відкине її як чужу.
    const allowed = allowedList.includes(origin) ? origin : allowedList[0];

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(allowed) });
    }
    if (request.method !== 'POST') {
      return json({ accepted: false, error: 'method_not_allowed' }, 405, allowed);
    }
    // Заявки приймаємо тільки з власного сайту.
    if (!allowedList.includes(origin)) {
      return json({ accepted: false, error: 'origin_not_allowed' }, 403, allowed);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ accepted: false, error: 'bad_json' }, 400, allowed);
    }

    // Приховане поле, яке заповнюють лише боти.
    if (typeof payload.website === 'string' && payload.website.trim() !== '') {
      return json({ accepted: true }, 200, allowed);
    }

    const clean = {};
    for (const [key, rule] of Object.entries(FIELDS)) {
      const value = typeof payload[key] === 'string' ? payload[key].trim() : '';
      if (rule.required && !value) {
        return json({ accepted: false, error: `missing_${key}` }, 400, allowed);
      }
      clean[key] = value.slice(0, rule.max);
    }

    const contact = clean.contact;
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const digits = contact.replace(/\D/g, '');
    const looksLikePhone = /^\+?[\d\s().-]+$/.test(contact) && digits.length >= 10 && digits.length <= 15;
    if (!looksLikeEmail && !looksLikePhone) {
      return json({ accepted: false, error: 'bad_contact' }, 400, allowed);
    }

    const lines = [
      '<b>Нова заявка з сайту</b>',
      '',
      ...Object.entries(FIELDS)
        .filter(([key]) => clean[key])
        .map(([key, rule]) => `<b>${rule.label}:</b> ${escapeHtml(clean[key])}`),
      '',
      `<i>${new Date().toISOString()}</i>`,
    ];
    const text = lines.join('\n');

    const telegram = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    );
    if (!telegram.ok) {
      return json({ accepted: false, error: 'delivery_failed' }, 502, allowed);
    }

    // Дубль на пошту — тільки якщо ключ Resend заданий.
    if (env.RESEND_API_KEY && env.MAIL_TO) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.MAIL_FROM || 'Компаньйон <no-reply@sb-companion.com>',
            to: [env.MAIL_TO],
            ...(env.MAIL_BCC ? { bcc: [env.MAIL_BCC] } : {}),
            reply_to: looksLikeEmail ? contact : undefined,
            subject: `Заявка з сайту: ${clean.company || clean.name}`,
            html: text.replace(/\n/g, '<br>'),
          }),
        });
      } catch {
        // Заявка вже в Telegram — пошта тут не критична.
      }
    }

    return json({ accepted: true }, 200, allowed);
  },
};

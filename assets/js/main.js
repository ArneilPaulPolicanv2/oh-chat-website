// Oh Chat website: the hero demo.
// One group chat, four members, four languages. Tapping a name shows that member's screen:
// their own message on the right (as written), everyone else's translated into their language.
(function () {
  'use strict';

  var LANG_NAME = { en: 'English', ko: 'Korean', ja: 'Japanese', es: 'Spanish' };
  var LANG_TAG = { en: 'en', ko: 'ko', ja: 'ja', es: 'es' };

  var PEOPLE = {
    john:  { name: 'John',  lang: 'en', color: 4 },
    minji: { name: 'Minji', lang: 'ko', color: 1 },
    kenji: { name: 'Kenji', lang: 'ja', color: 2 },
    lucia: { name: 'Lucía', lang: 'es', color: 3 }
  };

  // Each message: who wrote it, the time, and the text in every language
  // (the writer's own language is the original).
  var MESSAGES = [
    { from: 'minji', time: '20:14', text: {
      ko: '이번 주말에 부산 갈 사람? 🌊',
      en: 'Anyone up for Busan this weekend? 🌊',
      ja: '今週末、釜山に行く人いる？🌊',
      es: '¿Alguien se apunta a Busan este fin de semana? 🌊' } },
    { from: 'kenji', time: '20:15', text: {
      ja: '行きたい！土曜の朝はどう？',
      en: "I'd love to! How about Saturday morning?",
      ko: '가고 싶어요! 토요일 아침 어때요?',
      es: '¡Me encantaría! ¿Qué tal el sábado por la mañana?' } },
    { from: 'lucia', time: '20:15', text: {
      es: '¡Yo también! Llevo la cámara 📷',
      en: "Me too! I'll bring the camera 📷",
      ko: '저도요! 카메라 가져갈게요 📷',
      ja: '私も！カメラ持っていくね 📷' } },
    { from: 'john', time: '20:16', text: {
      en: 'Count me in. Meet at the station at 9?',
      ko: '저도 갈게요. 9시에 역에서 만날까요?',
      ja: '僕も行く！9時に駅で待ち合わせる？',
      es: 'Cuenta conmigo. ¿Nos vemos en la estación a las 9?' } }
  ];

  var body = document.getElementById('chat-body');
  var status = document.getElementById('demo-status');
  var buttons = document.querySelectorAll('.demo-switch button');
  if (!body || !buttons.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pendingTimer = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderMessage(msg, viewer, translating) {
    var author = PEOPLE[msg.from];
    var reader = PEOPLE[viewer];
    var mine = msg.from === viewer;
    var translated = !mine && author.lang !== reader.lang;

    var li = el('li', 'msg ' + (mine ? 'mine' : 'theirs'));
    if (!mine) {
      var avatar = el('span', 'avatar', author.name.charAt(0));
      avatar.setAttribute('data-c', author.color);
      avatar.setAttribute('aria-hidden', 'true');
      li.appendChild(avatar);
    }

    var wrap = el('div', 'bubble-wrap');
    if (!mine) wrap.appendChild(el('p', 'sender', author.name));

    var bubble = el('div', 'bubble');
    var p = el('p');
    var showingOriginal = false;

    function setText() {
      var lang = (translated && !showingOriginal) ? reader.lang : author.lang;
      p.textContent = msg.text[lang];
      p.setAttribute('lang', LANG_TAG[lang]);
    }

    if (translated && translating) {
      // Like the app: the message is there at once, the translation follows a moment later.
      bubble.classList.add('is-translating');
      var dots = el('span', 'typing-dots');
      dots.setAttribute('aria-label', 'Translating');
      dots.appendChild(el('span')); dots.appendChild(el('span')); dots.appendChild(el('span'));
      bubble.appendChild(dots);
    } else {
      setText();
      bubble.appendChild(p);
    }
    wrap.appendChild(bubble);

    var meta = el('p', 'meta');
    if (mine) {
      meta.textContent = msg.time + ' · Read';
    } else if (translated) {
      var label = el('span', null, translating ? 'Translating…' : 'Translated from ' + LANG_NAME[author.lang]);
      meta.appendChild(label);
      if (!translating) {
        var toggle = el('button', null, 'Show original');
        toggle.type = 'button';
        toggle.addEventListener('click', function () {
          showingOriginal = !showingOriginal;
          setText();
          toggle.textContent = showingOriginal ? 'Show translation' : 'Show original';
          label.textContent = showingOriginal ? 'Original in ' + LANG_NAME[author.lang] : 'Translated from ' + LANG_NAME[author.lang];
        });
        meta.appendChild(toggle);
      }
    } else {
      meta.textContent = msg.time;
    }
    wrap.appendChild(meta);
    li.appendChild(wrap);
    return li;
  }

  function render(viewer, translating) {
    var frag = document.createDocumentFragment();
    MESSAGES.forEach(function (m) { frag.appendChild(renderMessage(m, viewer, translating)); });
    body.replaceChildren(frag);
    body.scrollTop = body.scrollHeight; // newest message in view, like a real chat
  }

  function show(viewer, animate) {
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-viewer') === viewer));
    });
    var person = PEOPLE[viewer];
    status.textContent = person.name + "'s screen: " + person.name + ' reads everything in ' +
      LANG_NAME[person.lang] + ', and wrote the message on the right.';

    clearTimeout(pendingTimer);
    if (animate && !reduceMotion) {
      render(viewer, true);
      pendingTimer = setTimeout(function () { render(viewer, false); }, 650);
    } else {
      render(viewer, false);
    }
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-viewer'), true); });
  });

  // Replace the static (no-JavaScript) markup with the interactive version, keeping the caption.
  var caption = status.textContent;
  show('john', false);
  status.textContent = caption;
})();

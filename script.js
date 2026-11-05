(() => {
  'use strict';

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const storage = {
      read(key) {
        try {
          const raw = window.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch (_) {
          return null;
        }
      },
      remove(key) {
        try {
          window.localStorage.removeItem(key);
          return true;
        } catch (_) {
          return false;
        }
      },
      write(key, value) {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (_) {
          return false;
        }
      }
    };
    const focusSafely = (element) => {
      if (element && element.isConnected && typeof element.focus === 'function') {
        try { element.focus({ preventScroll: true }); } catch (_) { element.focus(); }
      }
    };
    const reducedMotion = () => typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The menu remains a normal set of links when JavaScript is unavailable.
    const menuToggle = $('.menu-toggle');
    const navigation = $('#site-nav') || $('.site-nav');
    const setMenu = (open, restoreFocus = false) => {
      if (!menuToggle || !navigation) return;
      menuToggle.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      if (open) focusSafely($('a', navigation));
      if (!open && restoreFocus) focusSafely(menuToggle);
    };
    if (menuToggle && navigation) {
      menuToggle.addEventListener('click', () => {
        setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
      });
      $$('a', navigation).forEach((link) => {
        link.addEventListener('click', () => setMenu(false));
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
          setMenu(false, true);
        }
      });
      document.addEventListener('click', (event) => {
        if (menuToggle.getAttribute('aria-expanded') === 'true'
          && !navigation.contains(event.target) && !menuToggle.contains(event.target)) {
          setMenu(false);
        }
      });
      if (typeof window.matchMedia === 'function') {
        const desktopMenu = window.matchMedia('(min-width: 1001px)');
        const closeOnDesktop = (event) => { if (event.matches) setMenu(false); };
        if (typeof desktopMenu.addEventListener === 'function') desktopMenu.addEventListener('change', closeOnDesktop);
      }
    }

    // Native dialogs provide focus trapping and return focus to the opener.
    const dialogOpeners = new WeakMap();
    const closeDialog = (dialog) => {
      if (!dialog) return;
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        focusSafely(dialogOpeners.get(dialog));
      }
    };
    const openDialog = (dialog, opener) => {
      if (!dialog) return false;
      dialogOpeners.set(dialog, opener || document.activeElement);
      setMenu(false);
      if (dialog.open) return true;
      try {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        return true;
      } catch (_) {
        return false;
      }
    };
    $$('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside || dialog.id === 'galleryDialog') closeDialog(dialog);
      });
      dialog.addEventListener('close', () => focusSafely(dialogOpeners.get(dialog)));
    });
    $$('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => closeDialog(button.closest('dialog')));
    });

    const searchRecords = [
      { title: 'КАДР — фотостудия', text: 'Пространство для ваших историй. Залы, съёмки и команда.', url: 'index.html', keywords: 'главная кадр студия аренда фотостудия' },
      { title: 'О студии', text: 'Наша команда, подход к съёмке и отзывы гостей.', url: 'about.html', keywords: 'о нас фотограф визажист команда отзывы' },
      { title: 'Наши пространства', text: 'Шесть залов для съёмок с разным настроением.', url: 'spaces.html', keywords: 'залы пространства интерьер аренда цены' },
      { title: 'Услуги и съёмки', text: 'Поможем с идеей, фотографом и подготовкой к съёмке.', url: 'services.html', keywords: 'услуги прайс стоимость съемка фотосессия' },
      { title: 'Портфолио', text: 'Портреты, семейные истории, love story и fashion.', url: 'portfolio.html', keywords: 'галерея работы фотографии портрет семейная любовь фэшн' },
      { title: 'Контакты и бронирование', text: 'Выберите зал, дату и время. Подготовьте заявку на съёмку.', url: 'contacts.html', keywords: 'контакты адрес телефон почта бронь бронирование заявка записаться' },
      { title: 'Зал LOFT', text: 'Светлый лофт. Аренда от 1 500 ₽/час.', url: 'spaces.html#loft', keywords: 'лофт loft свет окна интерьер 1500' },
      { title: 'Зал MINIMAL', text: 'Лаконичное пространство. Аренда от 1 700 ₽/час.', url: 'spaces.html#minimal', keywords: 'минимал minimal минимализм 1700' },
      { title: 'Зал CLASSIC', text: 'Классическое настроение. Аренда от 1 900 ₽/час.', url: 'spaces.html#classic', keywords: 'классик classic классический 1900' },
      { title: 'Зал WHITE', text: 'Белое пространство. Аренда от 2 100 ₽/час.', url: 'spaces.html#white', keywords: 'вайт white белый циклорама 2100' },
      { title: 'Зал DARK', text: 'Камерная атмосфера. Аренда от 2 300 ₽/час.', url: 'spaces.html#dark', keywords: 'дарк dark черный темный тёмный 2300' },
      { title: 'Зал VINTAGE', text: 'Винтажные детали. Аренда от 2 500 ₽/час.', url: 'spaces.html#vintage', keywords: 'винтаж vintage ретро 2500' },
      { title: 'Аренда зала', text: 'Выберите пространство и длительность съёмки.', url: 'services.html#extras', keywords: 'аренда зал стоимость часы оборудование свет' },
      { title: 'Индивидуальная съёмка', text: 'Портретная фотосессия от 5 000 ₽. Поможем с образом и позированием.', url: 'services.html#photoshoots', keywords: 'индивидуальная портретная портрет фотограф фотосессия 5000' },
      { title: 'Контент для бренда', text: 'Съёмки для брендов и социальных сетей от 7 000 ₽.', url: 'services.html#photoshoots', keywords: 'fashion фэшн бренд коммерческая каталог контент 7000' },
      { title: 'Свадебная съёмка', text: 'История вашего дня. Пакет съёмки от 25 000 ₽.', url: 'services.html#photoshoots', keywords: 'love story пара любовь лавстори свадьба свадебная 25000' },
      { title: 'Предметная съёмка', text: 'Товары для каталогов, свет и ретушь.', url: 'services.html#extras', keywords: 'предметная товары каталог предмет фото' },
      { title: 'Макияж и укладка', text: 'Подготовка образа к съёмке.', url: 'services.html#extras', keywords: 'макияж укладка визажист образ стилист' },
      { title: 'Обработка фотографий', text: 'Цветокоррекция и глубокая ретушь.', url: 'services.html#extras', keywords: 'обработка ретушь цветокоррекция фотографии' },
      { title: 'Свет и оборудование', text: 'Студийный свет, фоны и помощь с настройкой.', url: 'services.html#extras', keywords: 'оборудование свет фоны софтбокс стойки' }
    ];
    const searchDialog = $('#searchDialog');
    const searchInput = $('#searchInput');
    const searchResults = $('#searchResults');
    const normalize = (value) => String(value).toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
    const renderSearch = () => {
      if (!searchInput || !searchResults) return;
      searchResults.replaceChildren();
      const query = normalize(searchInput.value).slice(0, 200);
      if (!query) {
        const help = document.createElement('p');
        help.className = 'search-message';
        help.textContent = 'Начните вводить: название зала, услугу или «контакты».';
        searchResults.append(help);
        return;
      }
      const terms = query.split(/\s+/);
      const results = searchRecords.filter((record) => {
        const haystack = normalize(`${record.title} ${record.text} ${record.keywords}`);
        return terms.every((term) => haystack.includes(term));
      });
      if (!results.length) {
        const empty = document.createElement('p');
        empty.className = 'search-message';
        empty.textContent = 'Ничего не найдено. Попробуйте «LOFT», «семейная» или «бронирование».';
        searchResults.append(empty);
        return;
      }
      results.forEach((record) => {
        const link = document.createElement('a');
        link.className = 'search-result';
        link.href = record.url;
        const title = document.createElement('strong');
        title.textContent = record.title;
        const description = document.createElement('span');
        description.textContent = record.text;
        link.append(title, description);
        searchResults.append(link);
      });
    };
    $$('[data-open-search]').forEach((button) => {
      button.addEventListener('click', () => {
        if (openDialog(searchDialog, button)) {
          renderSearch();
          focusSafely(searchInput);
        }
      });
    });
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', renderSearch);
      searchInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || event.isComposing) return;
        event.preventDefault();
        const first = $('a', searchResults);
        if (first) first.click();
      });
      renderSearch();
    }

    const galleryDialog = $('#galleryDialog');
    const galleryImage = $('#galleryImage');
    const galleryCaption = $('#galleryCaption');
    const galleryCount = $('#galleryCount');
    let galleryItems = [];
    let galleryIndex = 0;
    const updateGallery = () => {
      const item = galleryItems[galleryIndex];
      if (!item || !galleryImage) return;
      const thumbnail = $('img', item);
      const source = item.dataset.gallery || item.dataset.full || (thumbnail && thumbnail.currentSrc) || (thumbnail && thumbnail.src);
      const visibleCaption = $('.gallery-caption', item);
      const caption = item.dataset.caption || (visibleCaption && visibleCaption.textContent.replace(/↗/g, '').replace(/\s+/g, ' ').trim()) || (thumbnail && thumbnail.alt) || 'Фотография студии КАДР';
      if (source) galleryImage.src = source;
      galleryImage.alt = (thumbnail && thumbnail.alt) || caption;
      if (galleryCaption) galleryCaption.textContent = caption;
      if (galleryCount) galleryCount.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
      $$('[data-gallery-prev], [data-gallery-next]').forEach((button) => { button.disabled = galleryItems.length < 2; });
    };
    const stepGallery = (direction) => {
      if (!galleryItems.length) return;
      galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
      updateGallery();
    };
    $$('[data-gallery]').forEach((button) => {
      button.addEventListener('click', (event) => {
        if (!galleryDialog || !galleryImage) return;
        event.preventDefault();
        galleryItems = $$('[data-gallery]').filter((item) => !item.hidden && !item.closest('[hidden]'));
        galleryIndex = galleryItems.indexOf(button);
        if (galleryIndex < 0) return;
        updateGallery();
        openDialog(galleryDialog, button);
      });
    });
    $$('[data-gallery-prev]').forEach((button) => button.addEventListener('click', () => stepGallery(-1)));
    $$('[data-gallery-next]').forEach((button) => button.addEventListener('click', () => stepGallery(1)));
    document.addEventListener('keydown', (event) => {
      if (!galleryDialog || !galleryDialog.open) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        stepGallery(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });

    const filterButtons = $$('[data-filter]');
    const filterItems = $$('.gallery-item[data-category]');
    const galleryStatus = $('#galleryStatus');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.filter;
        filterButtons.forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
        let count = 0;
        filterItems.forEach((item) => {
          const matches = category === 'all' || item.dataset.category.split(/\s+/).includes(category);
          item.hidden = !matches;
          if (matches) count += 1;
        });
        if (galleryStatus) galleryStatus.textContent = `Показано работ: ${count}`;
      });
    });

    const contactForm = $('#contactForm');
    if (contactForm) {
      const draftKey = 'kadr_booking_draft';
      const fields = ['name', 'phone', 'email', 'hall', 'date', 'time', 'duration', 'comment'];
           // Берем цены из localStorage, если админ их менял, иначе дефолтные
      const defaultHallPrices = { LOFT: 1500, MINIMAL: 1700, CLASSIC: 1900, WHITE: 2100, DARK: 2300, VINTAGE: 2500 };
      const hallPrices = storage.read('kadr_prices') || defaultHallPrices;
      const durations = ['1', '2', '3', '4', '6', '8'];
      const field = (name) => contactForm.elements.namedItem(name);
      const formSuccess = $('#formSuccess');
      const bookingMail = $('#bookingMail');
      const bookingEstimate = $('#bookingEstimate');
      const bookingSelection = $('#bookingSelection');
      const draftNotice = $('#draftNotice') || $('[data-draft-status]');
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (field('date')) field('date').min = today;
      const getValues = () => Object.fromEntries(fields.map((name) => [name, field(name) ? String(field(name).value).trim() : '']));
      const hasOption = (control, value) => control && [...control.options].some((option) => option.value === value);
      const draft = storage.read(draftKey);
      if (draft && draft.version === 1 && draft.values && typeof draft.values === 'object') {
        fields.forEach((name) => {
          const control = field(name);
          const value = draft.values[name];
          if (!control || typeof value !== 'string') return;
          if (name === 'hall' && (!Object.hasOwn(hallPrices, value) || !hasOption(control, value))) return;
          if (name === 'duration' && (!durations.includes(value) || !hasOption(control, value))) return;
          if (name === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < today)) return;
          if (name === 'time' && !/^\d{2}:\d{2}$/.test(value)) return;
          const limit = control.maxLength > 0 ? control.maxLength : (name === 'comment' ? 2000 : 300);
          control.value = value.slice(0, limit);
        });
        if (draftNotice) draftNotice.textContent = 'Восстановлен черновик из этого браузера. Данные ещё не отправлены в студию.';
      }
      try {
        const parameters = new URLSearchParams(window.location.search);
        const requestedHall = parameters.get('hall');
        const hall = requestedHall ? requestedHall.toUpperCase().trim() : '';
        if (Object.hasOwn(hallPrices, hall) && hasOption(field('hall'), hall)) field('hall').value = hall;
        const services = { portrait: 'Интересует портретная съёмка.', brand: 'Интересует съёмка контента для бренда.', wedding: 'Интересует свадебная съёмка.' };
        const service = parameters.get('service');
        if (Object.hasOwn(services, service) && field('comment') && !field('comment').value.trim()) {
          field('comment').value = services[service];
        }
      } catch (_) { /* A malformed local URL must not prevent the form from working. */ }
      const money = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
      const updateEstimate = () => {
        const hallControl = field('hall');
        const durationControl = field('duration');
        const hall = hallControl ? hallControl.value : '';
        const hours = durationControl ? durationControl.value : '';
        const selected = hallControl && hallControl.selectedOptions[0];
        const optionPrice = selected ? Number(selected.dataset.price) : 0;
        const price = optionPrice > 0 && Number.isFinite(optionPrice) ? optionPrice : hallPrices[hall];
        const valid = Object.hasOwn(hallPrices, hall) && durations.includes(hours);
        if (bookingEstimate) bookingEstimate.textContent = valid ? money(price * Number(hours)) : '— ₽';
        if (bookingSelection) bookingSelection.textContent = valid ? `${hall} · ${hours} ч · ${money(price)}/час` : 'Выберите зал и длительность';
      };
      const validatePhone = () => {
        const phone = field('phone');
        if (!phone) return;
        const count = phone.value.replace(/\D/g, '').length;
        phone.setCustomValidity(phone.value.trim() && (count < 10 || count > 15) ? 'Укажите номер телефона, содержащий от 10 до 15 цифр.' : '');
      };
      const saveDraft = () => storage.write(draftKey, { version: 1, savedAt: new Date().toISOString(), values: getValues() });
      contactForm.addEventListener('input', (event) => {
        if (event.target === field('phone')) validatePhone();
        updateEstimate();
      });
      contactForm.addEventListener('change', updateEstimate);
      validatePhone();
      updateEstimate();
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        validatePhone();
        if (!contactForm.reportValidity()) return;
        const values = getValues();
        const saved = saveDraft();
        const total = bookingEstimate ? bookingEstimate.textContent : '';
        const date = /^\d{4}-\d{2}-\d{2}$/.test(values.date) ? values.date.split('-').reverse().join('.') : values.date;
        const body = [
          'Здравствуйте! Хочу уточнить возможность бронирования фотостудии КАДР.',
          '',
          `Имя: ${values.name}`,
          `Телефон: ${values.phone}`,
          `Email: ${values.email || 'Не указан'}`,
          `Зал: ${values.hall}`,
          `Дата: ${date}`,
          `Время: ${values.time}`,
          `Длительность: ${values.duration} ч`,
          `Предварительная стоимость аренды: ${total}`,
          `Комментарий: ${values.comment || 'Нет'}`,
          '',
          'Пожалуйста, подтвердите доступность зала и окончательную стоимость.'
        ].join('\n');
        if (bookingMail) {
          bookingMail.href = `mailto:hello@kadr-studio.ru?subject=${encodeURIComponent(`Запрос бронирования: ${values.hall}, ${date}`)}&body=${encodeURIComponent(body)}`;
        }
        if (formSuccess) {
          const heading = $('h3', formSuccess);
          if (heading) heading.textContent = saved ? 'План съёмки сохранён' : 'План съёмки подготовлен';
          let message = $('[data-success-message]', formSuccess) || $('p', formSuccess);
          if (!message) {
            message = document.createElement('p');
            formSuccess.prepend(message);
          }
          message.textContent = saved
            ? 'Черновик сохранён только в этом браузере. Заявка не отправлена, зал не забронирован. Откройте подготовленное письмо и отправьте его из своей почты, чтобы уточнить доступность.'
            : 'Данные подготовлены только на этой странице. Сохранение в браузере недоступно. Заявка не отправлена, зал не забронирован. Откройте подготовленное письмо и отправьте его из своей почты.';
          formSuccess.hidden = false;
          if (!contactForm.contains(formSuccess)) contactForm.hidden = true;
          if (!formSuccess.hasAttribute('tabindex')) formSuccess.tabIndex = -1;
          focusSafely(formSuccess);
        }
        if (draftNotice) draftNotice.textContent = saved
          ? 'Черновик хранится на этом устройстве. Чтобы отправить запрос, воспользуйтесь подготовленным письмом.'
          : 'Сохранение на устройстве недоступно. Запрос можно отправить через подготовленное письмо.';
      });
      $$('[data-clear-draft]').forEach((button) => {
        button.addEventListener('click', () => {
          const cleared = storage.remove(draftKey);
          contactForm.reset();
          if (field('phone')) field('phone').setCustomValidity('');
          updateEstimate();
          if (formSuccess) formSuccess.hidden = true;
          contactForm.hidden = false;
          if (draftNotice) draftNotice.textContent = cleared ? 'Черновик очищен.' : 'Форма очищена. Сохранение в браузере недоступно.';
          focusSafely(field('name'));
        });
      });
      $$('[data-new-booking]').forEach((button) => {
        button.addEventListener('click', () => {
          if (formSuccess) formSuccess.hidden = true;
          contactForm.hidden = false;
          focusSafely(field('name'));
        });
      });
    }

    const reviewForm = $('#reviewForm');
    const reviewsGrid = $('#reviewsGrid');
    if (reviewForm && reviewsGrid) {
      const reviewKey = 'kadr_reviews';
      const reviewStatus = $('#reviewStatus');
      const validReview = (review) => review && typeof review.name === 'string' && typeof review.text === 'string'
        && review.name.trim().length > 0 && review.name.length <= 120 && review.text.trim().length > 0 && review.text.length <= 4000;
      const stored = storage.read(reviewKey);
      const reviews = stored && stored.version === 1 && Array.isArray(stored.reviews)
        ? stored.reviews.filter(validReview).slice(-50) : [];
      const appendReview = (review) => {
        const card = document.createElement('article');
        card.className = 'review-card';
        const text = document.createElement('p');
        text.className = 'review-text';
        text.textContent = review.text;
        const name = document.createElement('p');
        name.className = 'review-author';
        name.textContent = review.name;
        const local = document.createElement('span');
        local.className = 'review-local';
        local.textContent = 'Отзыв на этом устройстве';
        card.append(text, name, local);
        reviewsGrid.append(card);
      };
      reviews.forEach(appendReview);
      reviewForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nameInput = reviewForm.elements.namedItem('reviewName');
        const textInput = reviewForm.elements.namedItem('reviewText');
        if (!nameInput || !textInput) return;
        nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Укажите ваше имя.');
        textInput.setCustomValidity(textInput.value.trim() ? '' : 'Напишите отзыв.');
        if (!reviewForm.reportValidity()) return;
        const review = { name: nameInput.value.trim().slice(0, 120), text: textInput.value.trim().slice(0, 4000) };
        if (!validReview(review)) return;
        appendReview(review);
        reviews.push(review);
        if (reviews.length > 50) reviews.shift();
        const saved = storage.write(reviewKey, { version: 1, reviews });
        if (reviewStatus) reviewStatus.textContent = saved
          ? 'Отзыв сохранён только в этом браузере и виден на этом устройстве. В студию он не отправлен.'
          : 'Отзыв показан на этой странице. Сохранение в браузере недоступно. В студию он не отправлен.';
        reviewForm.reset();
      });
      reviewForm.addEventListener('input', (event) => {
        if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
      });
    }

    const backTop = $('.back-top');
    const header = $('.site-header') || $('header');
    let scrollScheduled = false;
    const updateScroll = () => {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
      if (backTop) backTop.hidden = window.scrollY <= 700;
      scrollScheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(updateScroll);
      }
    }, { passive: true });
    if (backTop) backTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
    updateScroll();

        if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            currentObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      $$('.reveal').forEach((element) => observer.observe(element));
    } else {
      $$('.reveal').forEach((element) => element.classList.add('in-view'));
    }

    // ==========================================
    // ЛОГИКА АДМИН-ПАНЕЛИ (admin.html)
    // ==========================================
    const loginForm = $('#loginForm');
    if (loginForm) {
      const loginScreen = $('#adminLogin');
      const panel = $('#adminPanel');
      const logoutBtn = $('#logoutBtn');
      const ordersList = $('#adminOrdersList');
      const reviewsList = $('#adminReviewsList');
      const pricesForm = $('#adminPrices');

      const checkAuth = () => {
        if (sessionStorage.getItem('kadr_admin') === 'true') {
          loginScreen.hidden = true;
          panel.hidden = false;
          renderAdminData();
        } else {
          loginScreen.hidden = false;
          panel.hidden = true;
        }
      };

      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = loginForm.elements.namedItem('pass').value;
        if (pass === 'admin') {
          sessionStorage.setItem('kadr_admin', 'true');
          $('#loginError').style.display = 'none';
          checkAuth();
        } else {
          $('#loginError').style.display = 'block';
        }
      });

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          sessionStorage.removeItem('kadr_admin');
          checkAuth();
        });
      }

      const renderAdminData = () => {
        // 1. ЗАЯВКИ
        const orders = storage.read('kadr_orders') || [];
        if (orders.length === 0) {
          ordersList.innerHTML = '<p class="admin-empty">Пока нет новых заявок.</p>';
        } else {
          ordersList.innerHTML = orders.map((order, index) => `
            <div class="admin-card">
              <div class="admin-card-header">
                <strong>${order.name || 'Без имени'}</strong>
                <span class="admin-status status-${order.status === 'Новая' ? 'new' : order.status === 'Подтверждена' ? 'confirmed' : 'done'}">${order.status || 'Новая'}</span>
              </div>
              <div class="admin-card-details">
                <div><span>Телефон:</span> ${order.phone || '—'}</div>
                <div><span>Email:</span> ${order.email || '—'}</div>
                <div><span>Зал:</span> ${order.hall || '—'}</div>
                <div><span>Дата:</span> ${order.date || '—'} ${order.time || ''}</div>
                <div style="grid-column: 1 / -1;"><span>Комментарий:</span> ${order.comment || '—'}</div>
              </div>
              <div class="admin-card-actions">
                <select data-order-index="${index}" class="order-status-select">
                  <option value="Новая" ${order.status === 'Новая' || !order.status ? 'selected' : ''}>Новая</option>
                  <option value="Подтверждена" ${order.status === 'Подтверждена' ? 'selected' : ''}>Подтверждена</option>
                  <option value="Выполнена" ${order.status === 'Выполнена' ? 'selected' : ''}>Выполнена</option>
                </select>
                <button class="text-link delete-order" data-index="${index}" style="color: #a00;">Удалить</button>
              </div>
            </div>
          `).join('');
        }

        // Обработчики для заявок
        $$('.order-status-select').forEach(select => {
          select.addEventListener('change', (e) => {
            const idx = e.target.dataset.orderIndex;
            orders[idx].status = e.target.value;
            storage.write('kadr_orders', orders);
            renderAdminData(); // Перерисовываем, чтобы обновить цвет статуса
          });
        });

        $$('.delete-order').forEach(btn => {
          btn.addEventListener('click', (e) => {
            if (confirm('Точно удалить эту заявку?')) {
              const idx = e.target.dataset.index;
              orders.splice(idx, 1);
              storage.write('kadr_orders', orders);
              renderAdminData();
            }
          });
        });

        // 2. ОТЗЫВЫ
        const stored = storage.read('kadr_reviews');
        const reviews = (stored && stored.version === 1 && Array.isArray(stored.reviews)) ? stored.reviews : [];
        if (reviews.length === 0) {
          reviewsList.innerHTML = '<p class="admin-empty">Пока нет отзывов.</p>';
        } else {
          reviewsList.innerHTML = reviews.map((rev, index) => `
            <div class="admin-card">
              <div class="admin-card-header">
                <strong>${rev.name}</strong>
              </div>
              <p style="font-size: 13px; margin-bottom: 10px;">${rev.text}</p>
              <button class="text-link delete-review" data-index="${index}" style="color: #a00;">Удалить отзыв</button>
            </div>
          `).join('');

          $$('.delete-review').forEach(btn => {
            btn.addEventListener('click', (e) => {
              if (confirm('Удалить отзыв?')) {
                const idx = e.target.dataset.index;
                reviews.splice(idx, 1);
                storage.write('kadr_reviews', { version: 1, reviews });
                renderAdminData();
              }
            });
          });
        }

        // 3. ЦЕНЫ
        const defaultPrices = { LOFT: 1500, MINIMAL: 1700, CLASSIC: 1900, WHITE: 2100, DARK: 2300, VINTAGE: 2500 };
        const savedPrices = storage.read('kadr_prices') || defaultPrices;
        
        pricesForm.innerHTML = Object.keys(defaultPrices).map(hall => `
          <div class="field" style="margin-bottom: 10px;">
            <label>${hall} (₽/час)</label>
            <input type="number" class="price-input" data-hall="${hall}" value="${savedPrices[hall]}" min="0" step="100">
          </div>
        `).join('') + '<button type="button" id="savePrices" class="button button-dark" style="margin-top: 10px;">Сохранить цены <span aria-hidden="true">↗</span></button>';

        $('#savePrices').addEventListener('click', () => {
          const newPrices = {};
          $$('.price-input').forEach(input => {
            newPrices[input.dataset.hall] = Number(input.value);
          });
          storage.write('kadr_prices', newPrices);
          alert('Цены сохранены! Они обновятся в калькуляторе на странице Контактов.');
        });
      };

      checkAuth();
    }

  }); 
})(); 
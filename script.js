const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const inquiryForm = document.querySelector(".inquiry-form");
const formNote = document.querySelector(".form-note");
const translations = window.HIMALAYAN_ORIGIN_TRANSLATIONS;
const languageCodes = ["en", "ja", "np"];

function getNestedValue(source, path) {
  return path.split(".").reduce((value, key) => (value ? value[key] : undefined), source);
}

function getCurrentLanguage() {
  const documentLanguage = document.documentElement.dataset.lang;
  const pathLanguage = window.location.pathname.split("/").find((part) => languageCodes.includes(part));
  return pathLanguage || documentLanguage || "en";
}

function getLanguageUrl(language) {
  if (window.location.protocol === "file:") {
    const inLanguageFolder = languageCodes.some((code) => window.location.pathname.includes(`/${code}/`));
    return inLanguageFolder ? `../${language}/index.html` : `${language}/index.html`;
  }

  return `/${language}/`;
}

function updateLanguageLinks(activeLanguage) {
  document.querySelectorAll("[data-lang-link]").forEach((link) => {
    const linkLanguage = link.dataset.langLink;
    link.href = getLanguageUrl(linkLanguage);
    link.classList.toggle("is-active", linkLanguage === activeLanguage);
    link.setAttribute("aria-current", linkLanguage === activeLanguage ? "true" : "false");
  });
}

function applyMeta(language, dictionary) {
  const meta = dictionary.meta;
  const absoluteUrl = `${window.location.origin}${meta.urlPath}`;

  document.documentElement.lang = meta.lang;
  document.documentElement.dir = meta.dir;
  document.documentElement.dataset.activeLang = language;
  document.body.classList.toggle("lang-ja", language === "ja");
  document.body.classList.toggle("lang-np", language === "np");
  document.title = meta.title;

  const selectors = {
    'meta[name="description"]': meta.description,
    'meta[property="og:title"]': meta.title,
    'meta[property="og:description"]': meta.description,
    'meta[property="og:url"]': absoluteUrl,
    'meta[property="og:locale"]': meta.locale,
    'meta[name="twitter:title"]': meta.title,
    'meta[name="twitter:description"]': meta.description,
    'link[rel="canonical"]': absoluteUrl,
  };

  Object.entries(selectors).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (!element) return;

    if (element.tagName === "LINK") {
      element.href = value;
    } else {
      element.setAttribute("content", value);
    }
  });
}

function applyTranslations(language) {
  const dictionary = translations[language] || translations.en;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getNestedValue(dictionary, element.dataset.i18n);
    if (value !== undefined) element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = getNestedValue(dictionary, element.dataset.i18nHtml);
    if (value !== undefined) element.innerHTML = value;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attribute, path] = pair.split(":").map((part) => part.trim());
      const value = getNestedValue(dictionary, path);
      if (attribute && value !== undefined) element.setAttribute(attribute, value);
    });
  });

  applyMeta(language, dictionary);
  updateLanguageLinks(language);
}

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  header.classList.remove("menu-active");
  navToggle.setAttribute("aria-expanded", "false");
}

applyTranslations(getCurrentLanguage());
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-active");
  document.body.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const language = getCurrentLanguage();
  formNote.textContent = (translations[language] || translations.en).inquiry.success;
  inquiryForm.reset();
});

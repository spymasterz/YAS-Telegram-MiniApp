
const categories = {
  sketch: "اسکچ طراحی",
  digital: "طراحی دیجیتال",
  moulage: "مولاژ"
};

const starterWorks = [
  {
    id: "sample-1",
    title: "فرم‌های آرام",
    category: "sketch",
    description: "مطالعه خطوط آزاد و سیلوئت‌های ساده در طراحی اولیه.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=850&q=80",
    sample: true
  },
  {
    id: "sample-2",
    title: "رنگ و سیلوئت",
    category: "digital",
    description: "ترکیب رنگ‌های خاکی با ساختار معاصر در طراحی دیجیتال.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=850&q=80",
    sample: true
  },
  {
    id: "sample-3",
    title: "بافت و حجم",
    category: "moulage",
    description: "جست‌وجو در حجم پارچه و شکل‌گیری فرم روی مانکن.",
    image: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=850&q=80",
    sample: true
  }
];

const STORAGE_KEY = "yas_portfolio_works_v1";

let works = loadWorks();
let adminUnlocked = false;
let pendingImage = "";

const $ = selector => document.querySelector(selector);

function loadWorks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : starterWorks.map(work => ({ ...work }));
  } catch {
    return starterWorks.map(work => ({ ...work }));
  }
}

function saveWorks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
    return true;
  } catch {
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function currentFilter() {
  return $(".filter-chip.active")?.dataset.filter || "all";
}

function renderWorks(filter = "all") {
  const grid = $("#workGrid");

  const filtered = works.filter(work =>
    filter === "all" || work.category === filter
  );

  $("#allCount").textContent = String(works.length).padStart(2, "0");

  if (!filtered.length) {
    grid.innerHTML =
      '<div class="empty-gallery">هنوز اثری در این دسته ثبت نشده است.</div>';
    return;
  }

  grid.innerHTML = filtered.map((work, index) => `
    <article class="work-card">
      <div
        class="work-image"
        role="button"
        tabindex="0"
        data-lightbox="${escapeHTML(work.id)}"
        aria-label="نمایش بزرگ ${escapeHTML(work.title)}"
      >
        <img
          src="${escapeHTML(work.image)}"
          alt="${escapeHTML(work.title)}"
          loading="lazy"
        >
        <span class="image-index">
          ${String(index + 1).padStart(2, "0")} / YAS
        </span>
      </div>

      <div class="work-details">
        <div class="work-meta">
          <span>${categories[work.category] || "اثر طراحی"}</span>
          <span class="work-code">
            YAS / ${String(index + 1).padStart(3, "0")}
          </span>
        </div>

        <h3>${escapeHTML(work.title)}</h3>

        ${
          work.description
            ? `<p>${escapeHTML(work.description)}</p>`
            : ""
        }
      </div>
    </article>
  `).join("");
}

/* فیلتر دسته‌بندی‌ها */

$("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");

  if (!button) return;

  $(".filter-chip.active")?.classList.remove("active");
  button.classList.add("active");

  renderWorks(button.dataset.filter);
});

$("#resetFilters").addEventListener("click", () => {
  $(".filter-chip.active")?.classList.remove("active");
  $('.filter-chip[data-filter="all"]').classList.add("active");

  renderWorks("all");
});

/* نمایش بزرگ تصویر */

function openLightbox(id) {
  const work = works.find(item => item.id === id);

  if (!work) return;

  $("#lightboxImage").src = work.image;
  $("#lightboxImage").alt = work.title;

  $("#lightboxCaption").textContent =
    `${work.title} — ${categories[work.category]}`;

  $("#lightbox").classList.add("open");
  $("#lightbox").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  $("#lightbox").classList.remove("open");
  $("#lightbox").setAttribute("aria-hidden", "true");

  $("#lightboxImage").src = "";
  document.body.style.overflow = "";
}

$("#workGrid").addEventListener("click", event => {
  const target = event.target.closest("[data-lightbox]");

  if (target) openLightbox(target.dataset.lightbox);
});

$("#workGrid").addEventListener("keydown", event => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.matches("[data-lightbox]")
  ) {
    event.preventDefault();
    openLightbox(event.target.dataset.lightbox);
  }
});

$("#lightboxClose").addEventListener("click", closeLightbox);

$("#lightbox").addEventListener("click", event => {
  if (event.target.id === "lightbox") closeLightbox();
});

/* باز و بسته کردن پنل مدیریت */

const adminModal = $("#adminModal");

function openAdmin() {
  adminModal.classList.add("open");
  adminModal.setAttribute("aria-hidden", "false");

  if (!adminUnlocked) {
    setTimeout(() => $("#adminPassword").focus(), 50);
  }
}

function closeAdmin() {
  adminModal.classList.remove("open");
  adminModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#openAdmin").addEventListener("click", openAdmin);
$("#closeAdmin").addEventListener("click", closeAdmin);

adminModal.addEventListener("click", event => {
  if (event.target === adminModal) closeAdmin();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeLightbox();
    closeAdmin();
  }
});

/* ورود نمایشی مدیریت */

$("#adminLoginForm").addEventListener("submit", event => {
  event.preventDefault();

  const password = $("#adminPassword").value;

  if (password === "yas2026") {
    adminUnlocked = true;

    $("#loginMessage").textContent = "";
    $("#adminLoginForm").hidden = true;
    $("#adminWorkspace").hidden = false;

    renderManageList();
  } else {
    $("#loginMessage").textContent = "رمز ورود صحیح نیست.";
    $("#adminPassword").select();
  }
});

$("#logoutAdmin").addEventListener("click", () => {
  adminUnlocked = false;

  $("#adminPassword").value = "";
  $("#adminLoginForm").hidden = false;
  $("#adminWorkspace").hidden = true;
  $("#workMessage").textContent = "";
});

/* انتخاب و پیش‌نمایش تصویر */

$("#workImage").addEventListener("change", () => {
  const file = $("#workImage").files[0];

  pendingImage = "";
  $("#imagePreview").hidden = true;
  $("#workMessage").textContent = "";

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    $("#workMessage").textContent =
      "فقط تصویر JPG، PNG یا WEBP قابل قبول است.";

    $("#workImage").value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    $("#workMessage").textContent =
      "حجم تصویر باید حداکثر ۵ مگابایت باشد.";

    $("#workImage").value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    pendingImage = reader.result;

    $("#previewImage").src = pendingImage;
    $("#imagePreview").hidden = false;
  };

  reader.readAsDataURL(file);
});

$("#clearImage").addEventListener("click", () => {
  pendingImage = "";
  $("#workImage").value = "";
  $("#imagePreview").hidden = true;
});

/* افزودن اثر جدید */

$("#workForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!adminUnlocked) return;

  const title = $("#workTitle").value.trim();
  const category = $("#workCategory").value;
  const description = $("#workDescription").value.trim();

  if (!title) {
    $("#workMessage").textContent = "عنوان اثر را وارد کنید.";
    return;
  }

  if (!pendingImage) {
    $("#workMessage").textContent = "ابتدا تصویر اثر را انتخاب کنید.";
    return;
  }

  const newWork = {
    id: "work-" + Date.now(),
    title,
    category,
    description,
    image: pendingImage,
    sample: false
  };

  works.unshift(newWork);

  if (!saveWorks()) {
    works.shift();

    $("#workMessage").textContent =
      "فضای ذخیره مرورگر کافی نیست؛ تصویر کوچک‌تری انتخاب کنید.";

    return;
  }

  $("#workForm").reset();

  pendingImage = "";
  $("#imagePreview").hidden = true;

  $("#workMessage").textContent =
    "اثر با موفقیت ذخیره شد.";

  renderWorks(currentFilter());
  renderManageList();
});

/* فهرست مدیریت و حذف آثار */

function renderManageList() {
  $("#adminCount").textContent = `${works.length} اثر`;

  if (!works.length) {
    $("#manageList").innerHTML =
      '<p class="form-message">هنوز اثری ثبت نشده است.</p>';
    return;
  }

  $("#manageList").innerHTML = works.map(work => `
    <div class="manage-item">
      <img src="${escapeHTML(work.image)}" alt="">

      <div class="manage-item-info">
        <strong>${escapeHTML(work.title)}</strong>
        <small>
          ${categories[work.category] || "اثر طراحی"}
          ${work.sample ? " · نمونه اولیه" : ""}
        </small>
      </div>

      <button type="button" data-delete="${escapeHTML(work.id)}">
        حذف
      </button>
    </div>
  `).join("");
}

$("#manageList").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");

  if (!button || !adminUnlocked) return;

  const work = works.find(item => item.id === button.dataset.delete);

  if (!work) return;

  if (!confirm(`اثر «${work.title}» حذف شود؟`)) return;

  const previousWorks = works;

  works = works.filter(item => item.id !== work.id);

  if (!saveWorks()) {
    works = previousWorks;

    alert("ذخیره تغییرات ناموفق بود.");
    return;
  }

  renderWorks(currentFilter());
  renderManageList();
});

/* منوی موبایل */

$("#menuToggle").addEventListener("click", () => {
  const nav = $("#mainNav");
  nav.classList.toggle("open");
});

$("#mainNav").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#mainNav").classList.remove("open");
  }
});

/* بازگشت به بالای صفحه */

$("#backTop").addEventListener("click", event => {
  event.preventDefault();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* اجرای اولیه */

renderWorks();

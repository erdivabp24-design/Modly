
// =========================================
// MOODLY - DIARY PERASAAN
// Penyimpanan data: localStorage browser
// =========================================

const KEY_MOODLY = "moodly_diary_entries";

// Mengambil catatan tersimpan
function ambilCatatan() {
  try {
    return JSON.parse(localStorage.getItem(KEY_MOODLY)) || [];
  } catch (error) {
    return [];
  }
}

// Menyimpan catatan
function simpanData(data) {
  localStorage.setItem(KEY_MOODLY, JSON.stringify(data));
}

// Format tanggal ke bahasa Indonesia
function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Mengamankan teks yang ditampilkan di HTML
function aman(teks) {
  return String(teks).replace(/[&<>"']/g, function (karakter) {
    const daftar = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return daftar[karakter];
  });
}

// =========================================
// HALAMAN DIARY
// =========================================

// Menampilkan tanggal hari ini
const tanggalHariIni = document.getElementById("tanggalHariIni");

if (tanggalHariIni) {
  tanggalHariIni.textContent = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Memilih mood
let moodDipilih = null;

const tombolMood = document.querySelectorAll(".mood-button");

tombolMood.forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    // Menghapus pilihan mood sebelumnya
    tombolMood.forEach(function (item) {
      item.classList.remove("selected");
    });

    // Menandai mood yang dipilih
    tombol.classList.add("selected");

    moodDipilih = {
      mood: tombol.dataset.mood,
      emoji: tombol.dataset.emoji
    };
  });
});

// Menghitung jumlah karakter
const ceritaMood = document.getElementById("ceritaMood");
const jumlahKarakter = document.getElementById("jumlahKarakter");

if (ceritaMood && jumlahKarakter) {
  ceritaMood.addEventListener("input", function () {
    jumlahKarakter.textContent = ceritaMood.value.length;
  });
}

// Tombol simpan
const tombolSimpan = document.getElementById("tombolSimpan");
const pesan = document.getElementById("pesan");

if (tombolSimpan) {
  tombolSimpan.addEventListener("click", function () {

    // Periksa mood
    if (!moodDipilih) {
      pesan.textContent = "Pilih perasaanmu terlebih dahulu ya ♡";
      return;
    }

    // Periksa cerita
    const cerita = ceritaMood.value.trim();

    if (cerita === "") {
      pesan.textContent = "Tuliskan cerita harimu terlebih dahulu ♡";
      ceritaMood.focus();
      return;
    }

    // Ambil data lama
    const data = ambilCatatan();

    // Buat catatan baru
    const catatanBaru = {
      id: Date.now(),
      mood: moodDipilih.mood,
      emoji: moodDipilih.emoji,
      cerita: cerita,
      tanggal: new Date().toISOString()
    };

    // Masukkan catatan baru di urutan paling atas
    data.unshift(catatanBaru);

    // Simpan data
    simpanData(data);

    // Pindah halaman setelah berhasil menyimpan
    window.location.href = "historyt.html?simpan=berhasil";
  });
}

// =========================================
// MEMBUAT KARTU CATATAN
// =========================================

function buatKartu(catatan) {
  return `
    <article class="entry-card">
      <div class="entry-top">
        <div class="entry-emoji">${aman(catatan.emoji)}</div>

        <div>
          <div class="entry-mood">${aman(catatan.mood)}</div>
          <div class="entry-date">${formatTanggal(catatan.tanggal)}</div>
        </div>
      </div>

      <p class="entry-story">${aman(catatan.cerita)}</p>
    </article>
  `;
}

// =========================================
// CATATAN TERBARU DI HALAMAN DIARY
// =========================================

function tampilkanCatatanTerbaru() {
  const tempat = document.getElementById("catatanTerbaru");

  if (!tempat) return;

  const data = ambilCatatan().slice(0, 3);

  if (data.length === 0) {
    tempat.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🌷</span>
        Belum ada catatan perasaan.<br>
        Yuk, simpan cerita pertamamu!
      </div>
    `;
    return;
  }

  tempat.innerHTML = data.map(buatKartu).join("");
}

// =========================================
// HALAMAN RIWAYAT
// =========================================

function tampilkanSemuaCatatan() {
  const tempat = document.getElementById("semuaCatatan");

  // Jika bukan halaman riwayat, berhenti
  if (!tempat) return;

  const data = ambilCatatan();

  // Jumlah semua catatan
  const total = document.getElementById("totalCatatan");

  if (total) {
    total.textContent = data.length;
  }

  // Mood yang paling sering dipilih
  const moodTerbanyak = document.getElementById("moodTerbanyak");

  if (moodTerbanyak) {
    if (data.length === 0) {
      moodTerbanyak.textContent = "-";
    } else {
      const hitungMood = {};

      data.forEach(function (catatan) {
        hitungMood[catatan.mood] =
          (hitungMood[catatan.mood] || 0) + 1;
      });

      let moodFavorit = "";
      let jumlahTerbesar = 0;

      for (const mood in hitungMood) {
        if (hitungMood[mood] > jumlahTerbesar) {
          jumlahTerbesar = hitungMood[mood];
          moodFavorit = mood;
        }
      }

      moodTerbanyak.textContent = moodFavorit;
    }
  }

  // Jika belum ada catatan
  if (data.length === 0) {
    tempat.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">☁️</span>
        Belum ada riwayat perasaan.<br>
        Isi diary pertamamu dan ceritakan harimu.
      </div>
    `;
    return;
  }

  // Tampilkan semua catatan
  tempat.innerHTML = data.map(buatKartu).join("");
}

// =========================================
// NOTIFIKASI SETELAH BERHASIL MENYIMPAN
// =========================================

const pesanBerhasil = document.getElementById("pesanBerhasil");

if (pesanBerhasil) {
  const parameter = new URLSearchParams(window.location.search);

  if (parameter.get("simpan") === "berhasil") {
    pesanBerhasil.hidden = false;
  }
}

// Jalankan tampilan catatan
tampilkanCatatanTerbaru();
tampilkanSemuaCatatan();

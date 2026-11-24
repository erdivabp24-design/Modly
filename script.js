
const KEY_MOODLY = "moodly_diary_entries";

// Mengambil data catatan dari penyimpanan browser
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

// Format tanggal Indonesia
function formatTanggal(tanggal) {
    return new Date(tanggal).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Mengamankan teks yang ditampilkan
function aman(teks) {
    const div = document.createElement("div");
    div.textContent = teks ?? "";
    return div.innerHTML;
}


// =============================
// PILIH MOOD DAN SIMPAN CERITA
// =============================

const tombolMood = document.querySelectorAll(".mood-button");
const textarea = document.getElementById("ceritaMood");
const tombolSimpan = document.getElementById("tombolSimpan");
const pesan = document.getElementById("pesan");
const jumlahKarakter = document.getElementById("jumlahKarakter");

let moodDipilih = "";
let emojiDipilih = "";

// Pilih mood
tombolMood.forEach(function(tombol) {
    tombol.addEventListener("click", function() {

        tombolMood.forEach(function(item) {
            item.classList.remove("active");
        });

        tombol.classList.add("active");

        moodDipilih = tombol.dataset.mood;
        emojiDipilih = tombol.dataset.emoji;

        if (pesan) {
            pesan.textContent = "";
        }
    });
});

// Hitung jumlah karakter
if (textarea && jumlahKarakter) {
    textarea.addEventListener("input", function() {
        jumlahKarakter.textContent = textarea.value.length;
    });
}

// Simpan cerita
if (tombolSimpan) {
    tombolSimpan.addEventListener("click", function() {

        if (!moodDipilih) {
            pesan.textContent = "Pilih mood kamu terlebih dahulu.";
            return;
        }

        const cerita = textarea.value.trim();

        if (cerita === "") {
            pesan.textContent = "Tuliskan ceritamu terlebih dahulu.";
            textarea.focus();
            return;
        }

        const catatanBaru = {
            id: Date.now(),
            mood: moodDipilih,
            emoji: emojiDipilih,
            cerita: cerita,
            tanggal: new Date().toISOString()
        };

        const data = ambilCatatan();
        data.unshift(catatanBaru);

        try {
            simpanData(data);
            sessionStorage.setItem("moodlyBerhasil", "ya");

            // INI LINK HALAMAN 3 YANG SUDAH DIPERBAIKI
            window.location.href = "history.html";

        } catch (error) {
            pesan.textContent = "Catatan gagal disimpan. Penyimpanan browser penuh.";
        }
    });
}


// =============================
// CATATAN TERBARU DI DIARY
// =============================

function tampilkanCatatanTerbaru() {
    const tempat = document.getElementById("catatanTerbaru");
    if (!tempat) return;

    const data = ambilCatatan();

    if (data.length === 0) {
        tempat.innerHTML = `
            <div class="empty-state">
                Belum ada cerita. Mulailah menulis perasaanmu hari ini ♡
            </div>
        `;
        return;
    }

    tempat.innerHTML = "";

    data.slice(0, 3).forEach(function(catatan) {
        tempat.innerHTML += `
            <div class="note-card">
                <div class="note-top">
                    <span class="note-emoji">${aman(catatan.emoji)}</span>
                    <div>
                        <div class="note-mood">${aman(catatan.mood)}</div>
                        <div class="note-date">${formatTanggal(catatan.tanggal)}</div>
                    </div>
                </div>
                <div class="note-story">${aman(catatan.cerita)}</div>
            </div>
        `;
    });
}


// =============================
// HALAMAN RIWAYAT
// =============================

function tampilkanSemuaCatatan() {
    const tempat = document.getElementById("semuaCatatan");
    if (!tempat) return;

    const data = ambilCatatan();
    const total = document.getElementById("totalCatatan");
    const moodTerbanyak = document.getElementById("moodTerbanyak");

    // Total cerita
    if (total) {
        total.textContent = data.length;
    }

    // Mood paling sering
    if (moodTerbanyak) {
        if (data.length === 0) {
            moodTerbanyak.textContent = "-";
        } else {
            const jumlahMood = {};

            data.forEach(function(catatan) {
                jumlahMood[catatan.mood] =
                    (jumlahMood[catatan.mood] || 0) + 1;
            });

            let moodTeratas = "";
            let nilaiTeratas = 0;

            for (const mood in jumlahMood) {
                if (jumlahMood[mood] > nilaiTeratas) {
                    nilaiTeratas = jumlahMood[mood];
                    moodTeratas = mood;
                }
            }

            moodTerbanyak.textContent = moodTeratas;
        }
    }

    // Jika belum ada cerita
    if (data.length === 0) {
        tempat.innerHTML = `
            <div class="empty-state">
                <p>Belum ada catatan perasaan.</p>
                <br>
                <a href="diary.html" class="btn">Mulai Menulis</a>
            </div>
        `;
        return;
    }

    // Menampilkan seluruh cerita
    tempat.innerHTML = "";

    data.forEach(function(catatan) {
        tempat.innerHTML += `
            <div class="note-card">
                <div class="note-top">
                    <span class="note-emoji">${aman(catatan.emoji)}</span>
                    <div>
                        <div class="note-mood">${aman(catatan.mood)}</div>
                        <div class="note-date">${formatTanggal(catatan.tanggal)}</div>
                    </div>
                </div>
                <div class="note-story">${aman(catatan.cerita)}</div>
            </div>
        `;
    });

    // Pesan setelah berhasil menyimpan
    const banner = document.getElementById("pesanBerhasil");

    if (banner && sessionStorage.getItem("moodlyBerhasil") === "ya") {
        banner.hidden = false;
        sessionStorage.removeItem("moodlyBerhasil");
    }
}


// =============================
// JALANKAN SEMUA
// =============================

tampilkanCatatanTerbaru();
tampilkanSemuaCatatan();

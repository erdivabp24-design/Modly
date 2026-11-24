// ===================================
// MOODLY - SISTEM CATATAN PERASAAN
// ===================================

const KEY_MOODLY = "moodly_diary_entries";

// Mengambil data catatan
function ambilCatatan() {
    try {
        return JSON.parse(localStorage.getItem(KEY_MOODLY)) || [];
    } catch (error) {
        return [];
    }
}

// Menyimpan data catatan
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

// Mengamankan tulisan agar tidak dianggap HTML
function aman(teks) {
    const div = document.createElement("div");
    div.textContent = teks;
    return div.innerHTML;
}


// ===================================
// HALAMAN DIARY
// ===================================

const tombolMood = document.querySelectorAll(".mood-button");
const textarea = document.getElementById("ceritaMood");
const tombolSimpan = document.getElementById("tombolSimpan");
const pesan = document.getElementById("pesan");
const jumlahKarakter = document.getElementById("jumlahKarakter");

let moodDipilih = null;
let emojiDipilih = null;

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

// Menghitung karakter
if (textarea && jumlahKarakter) {

    textarea.addEventListener("input", function() {
        jumlahKarakter.textContent = textarea.value.length;
    });

}

// Tombol simpan cerita
if (tombolSimpan) {

    tombolSimpan.addEventListener("click", function() {

        // Memeriksa mood
        if (!moodDipilih) {
            pesan.textContent = "Silakan pilih perasaanmu terlebih dahulu.";
            return;
        }

        // Memeriksa isi cerita
        const cerita = textarea.value.trim();

        if (cerita === "") {
            pesan.textContent = "Silakan tuliskan ceritamu terlebih dahulu.";
            textarea.focus();
            return;
        }

        // Membuat data baru
        const catatanBaru = {
            id: Date.now(),
            mood: moodDipilih,
            emoji: emojiDipilih,
            cerita: cerita,
            tanggal: new Date().toISOString()
        };

        // Menambahkan catatan ke data lama
        const semuaCatatan = ambilCatatan();

        semuaCatatan.unshift(catatanBaru);

        // Menyimpan data
        simpanData(semuaCatatan);

        // Penanda bahwa cerita berhasil disimpan
        sessionStorage.setItem("moodlyBerhasil", "ya");

        // Pindah ke halaman riwayat
        window.location.href = "historyt.html";

    });

}


// ===================================
// MENAMPILKAN 3 CATATAN TERBARU
// ===================================

function tampilkanCatatanTerbaru() {

    const tempat = document.getElementById("catatanTerbaru");

    if (!tempat) return;

    const data = ambilCatatan();

    if (data.length === 0) {
        tempat.innerHTML = `
            <div class="empty-state">
                <p>Belum ada cerita.</p>
                <p>Mulailah menulis perasaanmu hari ini ♡</p>
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


// ===================================
// HALAMAN RIWAYAT
// ===================================

function tampilkanSemuaCatatan() {

    const tempat = document.getElementById("semuaCatatan");

    if (!tempat) return;

    const data = ambilCatatan();

    const total = document.getElementById("totalCatatan");
    const moodTerbanyak = document.getElementById("moodTerbanyak");

    // Jumlah semua cerita
    if (total) {
        total.textContent = data.length;
    }

    // Menghitung mood terbanyak
    if (moodTerbanyak) {

        if (data.length === 0) {
            moodTerbanyak.textContent = "-";
        } else {

            const jumlahMood = {};

            data.forEach(function(catatan) {
                jumlahMood[catatan.mood] =
                    (jumlahMood[catatan.mood] || 0) + 1;
            });

            const moodPalingBanyak = Object.keys(jumlahMood).reduce(
                function(a, b) {
                    return jumlahMood[a] >= jumlahMood[b] ? a : b;
                }
            );

            moodTerbanyak.textContent = moodPalingBanyak;
        }
    }

    // Jika belum ada catatan
    if (data.length === 0) {

        tempat.innerHTML = `
            <div class="empty-state">
                <p>Belum ada catatan perasaan.</p>
                <p>Yuk, tulis cerita pertamamu hari ini ♡</p>
                <br>
                <a href="diary.html" class="btn">Mulai Menulis</a>
            </div>
        `;

        return;
    }

    // Menampilkan seluruh catatan
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


// ===================================
// MENJALANKAN FUNGSI
// ===================================

tampilkanCatatanTerbaru();
tampilkanSemuaCatatan();

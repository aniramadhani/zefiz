let u = (function(){ try { return JSON.parse(localStorage.getItem("activeUser")); } catch(e) { return null; } })();
if (!u || u.role !== "admin") {
  location.href = "login.html";
}
// header
function loadHeader() {
  if (!u) return;

  let sapaan = "Selamat Datang";

  if (u.jk === "L") sapaan = "Selamat Datang Bapak";
  else if (u.jk === "P") sapaan = "Selamat Datang Ibu";

  const welcome = document.getElementById("welcomeText");
  const nama = document.getElementById("namaUser");
  const role = document.getElementById("roleUser");
  const sekolah = document.getElementById("sekolahUser");

  if (welcome) welcome.innerText = `${sapaan} ${u.nama || ""}`;
  if (nama) nama.innerText = u.nama || "-";
  if (role) role.innerText = u.role || "-";
  if (sekolah) sekolah.innerText = u.sekolah || "-";
}

// ambil nomor surat (admin)
function loadKodeSurat() {
  const select = document.getElementById("inputKodeSurat");
  if (!select) return;

  let data = (function(){ try { return JSON.parse(localStorage.getItem("kodeSurat")); } catch(e) { return null; } })();
  const defaultData = [
    { kode: "001", nama: "Rekapitulasi" },
    { kode: "002", nama: "Kepegawaian" },
    { kode: "003", nama: "Keuangan" },
    { kode: "004", nama: "Inventaris" },
    { kode: "005", nama: "Resmi" },
    { kode: "006", nama: "Keputusan" },
  ];
  const finalData = Array.isArray(data) && data.length > 0 ? data : defaultData;

  select.innerHTML = "";
  finalData.forEach((k) => {
    const opt = document.createElement("option");
    opt.value = k.kode;
    opt.textContent = `${k.kode} - ${k.nama}`;
    select.appendChild(opt);
  });
}

function getRomanMonth(monthIndex) {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return roman[monthIndex - 1];
}

function generateNomor() {
  const kode = document.getElementById("inputKodeSurat")?.value;
  let tanggal = document.getElementById("tanggal")?.value;

  if (!tanggal) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    tanggal = `${yyyy}-${mm}-${dd}`;
    if (document.getElementById("tanggal")) {
        document.getElementById("tanggal").value = tanggal;
    }
  }

  const [tahun, bulan, hari] = tanggal.split("-");
  const romanMonth = getRomanMonth(parseInt(bulan, 10));

  const key = `counter_${kode}_${tahun}`;
  let counter = localStorage.getItem(key) || 1;

  const namaSekolah = u && u.sekolah ? u.sekolah.replace(/\s+/g, "").toUpperCase() : "INSTANSI";
  const nomor = `${kode}/${String(counter).padStart(3, "0")}-${namaSekolah}/${romanMonth}/${tahun}`;
  const hasil = document.getElementById("hasil");
  if (hasil) {
    if(hasil.tagName.toLowerCase() === 'input') {
      hasil.value = nomor;
    } else {
      hasil.innerText = nomor;
    }
  }
}

function simpanSurat() {
  const hasilEl = document.getElementById("hasil");
  const nomor = hasilEl ? (hasilEl.tagName.toLowerCase() === 'input' ? hasilEl.value : hasilEl.innerText) : "-";
  if (!nomor || nomor === "-" || nomor === "") return Swal.fire({ icon: 'warning', title: 'Belum Ada Nomor', text: 'Generate nomor dulu sebelum menyimpan!' });

  const kode = document.getElementById("inputKodeSurat")?.value;
  const tanggal = document.getElementById("tanggal")?.value;
  if(tanggal && nomor && nomor !== "-") {
      const [tahun] = tanggal.split("-");
      const key = `counter_${kode}_${tahun}`;
      let counter = localStorage.getItem(key) || 1;
      localStorage.setItem(key, Number(counter) + 1);
  }

  let data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];

  data.push({
    nomor,
    status: "pending",
    user: u.nama,
    sekolah: u.sekolah,
  });

  localStorage.setItem("arsip", JSON.stringify(data));
  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: 'Surat berhasil diajukan.',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'OK'
  }).then(() => {
    // Reset form fields
    if(document.getElementById("tanggal")) document.getElementById("tanggal").value = "";
    if (document.getElementById("hasil")) {
      if(document.getElementById("hasil").tagName.toLowerCase() === 'input') document.getElementById("hasil").value = "";
      else document.getElementById("hasil").innerText = "-";
    }
    if (document.getElementById("judulSurat")) document.getElementById("judulSurat").value = "";
    if (document.getElementById("isiSurat")) document.getElementById("isiSurat").value = "";
    
    // Refresh table and move to verifikasi tab
    loadAdmin();
    loadRekap();
    loadArsip();
    if (typeof showSection === "function") {
      showSection('verifikasi');
      // Update sidebar active state
      document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
      const buttons = document.querySelectorAll('.menu-item');
      buttons.forEach(b => {
        if(b.innerText.includes('Verifikasi')) b.classList.add('active');
      });
    }
  });
}

// verifikasi surat
function loadAdmin() {
  const data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  const list = document.getElementById("dataSurat");
  if (!list) return;

  list.innerHTML = "";

  let pendingCount = 0;
  data.forEach((a, i) => {
    if (a.status === "pending" || a.status === "revisi") {
      pendingCount++;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge ${a.status}">${a.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; margin-right: 5px;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; margin-right: 5px; color: #dc2626; border-color: #fca5a5;" onclick="verif(${i})"><i class="ri-edit-2-line"></i> Revisi</button>
          <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="kirim(${i})"><i class="ri-send-plane-fill"></i> Kirim ke Kepsek</button>
        </td>
      `;
      list.appendChild(tr);
    }
  });
  const pendingEl = document.getElementById("statPending");
  if (pendingEl) pendingEl.innerText = pendingCount;
}

function verif(i) {
  let data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  if (!data[i]) return;

  data[i].status = "Telah Dikirim Balik Ke User";
  localStorage.setItem("arsip", JSON.stringify(data));
  Swal.fire('Dikembalikan!', 'Surat telah dikembalikan ke User untuk revisi.', 'success');
  loadAdmin();
  loadRekap();
  loadArsip();
}

function kirim(i) {
  let data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  if (!data[i]) return;

  data[i].status = "Telah Dikirim Ke Kepala Sekolah";
  localStorage.setItem("arsip", JSON.stringify(data));
  Swal.fire('Terkirim!', 'Surat telah diteruskan ke Kepala Sekolah.', 'success');
  loadAdmin();
  loadRekap();
  loadArsip();
}

// rekap
function loadRekap() {
  const data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  const list = document.getElementById("rekapList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach((a) => {
    if (
      a.status === "Mohon Cek Kembali Dokumen Dan Generate Ulang" ||
      a.status === "Telah Dikirim Ke Kepala Sekolah" ||
      a.status === "Telah Dikirim Balik Ke User" ||
      a.status === "disetujui" ||
      a.status === "ditolak"
    ) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge" style="background:#e2e8f0; color:#475569;">${a.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
        </td>
      `;
      list.appendChild(tr);
    }
  });
}

// arsip
function loadArsip() {
  const data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  const list = document.getElementById("arsipList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach((a) => {
    if (a.status === "disetujui") {
      const tr = document.createElement("tr");
      let badgeClass = "disetujui";

      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
        </td>
      `;
      list.appendChild(tr);
    }
  });
}

// total user
function loadUserCount() {
  const users = (function(){ try { return JSON.parse(localStorage.getItem("users")); } catch(e) { return null; } })() || [];
  const el = document.getElementById("totalUser");
  const list = document.getElementById("userList");
  
  if (el) el.innerText = users.length;
  
  if(list) {
    list.innerHTML = "";
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${u.nama}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge" style="background:#f1f5f9; color:#475569;">${u.role}</span></td>
        <td>${u.sekolah}</td>
      `;
      list.appendChild(tr);
    });
  }
}

// lihat surat (global)
window.lihatSurat = function(nomor) {
  let data = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  let surat = data.find(s => s.nomor === nomor);
  
  if (surat) {
    Swal.fire({
      title: 'Detail Surat',
      html: `
        <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px;">
          <p style="margin-bottom:8px;"><strong>Nomor Surat:</strong> <br/>${surat.nomor}</p>
          <p style="margin-bottom:8px;"><strong>Status:</strong> <br/><span class="badge ${surat.status}">${surat.status}</span></p>
          <p style="margin-bottom:8px;"><strong>Diajukan Oleh:</strong> <br/>${surat.user}</p>
          <p style="margin-bottom:8px;"><strong>Instansi:</strong> <br/>${surat.sekolah}</p>
          <p style="margin-bottom:8px;"><strong>Lampiran Draft:</strong> <br/><a href="#" style="color: #3b82f6; text-decoration:none;"><i class="ri-file-pdf-line"></i> draft_surat.pdf</a></p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#3b82f6'
    });
  }
}

// init
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadKodeSurat();
  loadAdmin();
  loadRekap();
  loadArsip();
  loadUserCount();
  generateNomor(); // Auto generate on load
});


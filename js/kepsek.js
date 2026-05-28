let u = (function(){ try { return JSON.parse(localStorage.getItem("activeUser")); } catch(e) { return null; } })();
if (!u || u.role !== "kepsek") location = "login.html";

/* =========================
   HEADER
========================= */
function loadHeader() {
  if (!u) return;

  let sapaan = "Selamat Datang";
  if (u.jk === "L") sapaan = "Selamat Datang Bapak";
  else if (u.jk === "P") sapaan = "Selamat Datang Ibu";

  const welcome = document.getElementById("welcomeText");
  const nama = document.getElementById("namaUser");
  const sekolah = document.getElementById("sekolahUser");

  if (welcome) welcome.innerText = `${sapaan} ${u.nama || ""}`;
  if (nama) nama.innerText = u.nama || "-";
  if (sekolah) sekolah.innerText = u.sekolah || "-";
}

/* =========================
   LOAD PERSETUJUAN
========================= */
function load() {
  let d = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  const list = document.getElementById("dataKepsek");
  if (!list) return;

  list.innerHTML = "";
  let pendingCount = 0;
  let disetujuiCount = 0;

  d.forEach((a, i) => {
    // Also accept "ke_kepsek" to be safe with older test data
    if (a.status === "Telah Dikirim Ke Kepala Sekolah" || a.status === "ke_kepsek") {
      pendingCount++;
      let tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge" style="background:#fef3c7; color:#d97706;">Menunggu Persetujuan</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; margin-right: 5px;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
          <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: var(--secondary); margin-right: 5px;" onclick="ok(${i})"><i class="ri-check-line"></i> Setujui</button>
          <button class="btn-logout" style="padding: 6px 12px; font-size: 0.8rem;" onclick="no(${i})"><i class="ri-close-line"></i> Tolak</button>
        </td>
      `;
      list.appendChild(tr);
    }
    
    if (a.status === "disetujui") disetujuiCount++;
  });

  const pendingEl = document.getElementById("statPending");
  const disetujuiEl = document.getElementById("statDisetujui");
  if (pendingEl) pendingEl.innerText = pendingCount;
  if (disetujuiEl) disetujuiEl.innerText = disetujuiCount;
}

function ok(i) {
  let d = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })();
  if (d[i]) {
    d[i].status = "disetujui";
    localStorage.setItem("arsip", JSON.stringify(d));
    Swal.fire('Disetujui!', 'Surat berhasil disetujui.', 'success');
    load();
    loadArsip();
  }
}

function no(i) {
  let d = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })();
  if (d[i]) {
    d[i].status = "ditolak";
    localStorage.setItem("arsip", JSON.stringify(d));
    Swal.fire('Ditolak!', 'Surat telah ditolak.', 'error');
    load();
    loadArsip();
  }
}

/* =========================
   ARSIP
========================= */
function loadArsip() {
  let d = (function(){ try { return JSON.parse(localStorage.getItem("arsip")); } catch(e) { return null; } })() || [];
  const list = document.getElementById("arsipList");
  if (!list) return;

  list.innerHTML = "";

  d.forEach((a) => {
    if (a.status === "disetujui" || a.status === "ditolak") {
      let tr = document.createElement("tr");
      let badgeClass = a.status === "disetujui" ? "disetujui" : "revisi";
      
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

/* =========================
   LIHAT SURAT (GLOBAL)
========================= */
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

document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  load();
  loadArsip();
});

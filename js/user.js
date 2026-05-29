let u = (function () { try { return JSON.parse(localStorage.getItem("activeUser")); } catch (e) { return null; } })();
if (!u) location = "login.html";

// header user
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

// load kode surat
function loadKodeSurat() {
  const select = document.getElementById("kodeSurat");
  if (!select) return;

  let data = (function () { try { return JSON.parse(localStorage.getItem("kodeSurat")); } catch (e) { return null; } })();
  const defaultData = [
    { kode: "800", nama: "Surat Tugas" },
    { kode: "421", nama: "Surat Undangan" },
    { kode: "421", nama: "Surat Keterangan" },
    { kode: "421", nama: "Surat Pemberitahuan" },
    { kode: "421", nama: "Surat Rekomendasi" },
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

// generate nomor surat
function getRomanMonth(monthIndex) {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return roman[monthIndex - 1];
}

function generateNomor() {
  const kode = document.getElementById("kodeSurat")?.value;
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

// simpan surat
function simpanSurat() {
  const hasilEl = document.getElementById("hasil");
  const nomor = hasilEl ? (hasilEl.tagName.toLowerCase() === 'input' ? hasilEl.value : hasilEl.innerText) : "-";
  if (!nomor || nomor === "-" || nomor === "") return Swal.fire({ icon: 'warning', title: 'Belum Ada Nomor', text: 'Generate nomor dulu sebelum menyimpan!' });

  const kode = document.getElementById("kodeSurat")?.value;
  const tanggal = document.getElementById("tanggal")?.value;
  if(tanggal && nomor && nomor !== "-") {
      const [tahun] = tanggal.split("-");
      const key = `counter_${kode}_${tahun}`;
      let counter = localStorage.getItem(key) || 1;
      localStorage.setItem(key, Number(counter) + 1);
  }

  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
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
    if (document.getElementById("tanggal")) document.getElementById("tanggal").value = "";
    if (document.getElementById("hasil")) {
      if(document.getElementById("hasil").tagName.toLowerCase() === 'input') document.getElementById("hasil").value = "";
      else document.getElementById("hasil").innerText = "-";
    }
    if (document.getElementById("judulSurat")) document.getElementById("judulSurat").value = "";
    if (document.getElementById("isiSurat")) document.getElementById("isiSurat").value = "";
    if (document.getElementById("fileSurat")) document.getElementById("fileSurat").value = "";

    // Refresh table and move to riwayat tab
    loadArsip();
    if (typeof showSection === "function") {
      showSection('riwayatSurat');
      // Update sidebar active state
      document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
      const buttons = document.querySelectorAll('.menu-item');
      buttons.forEach(b => {
        if (b.innerText.includes('Riwayat')) b.classList.add('active');
      });
    }
  });
}

// reset & draft
window.resetForm = function () {
  if (document.getElementById("kodeSurat")) document.getElementById("kodeSurat").selectedIndex = 0;
  if (document.getElementById("tanggal")) document.getElementById("tanggal").value = "";
  if (document.getElementById("hasil")) {
    if(document.getElementById("hasil").tagName.toLowerCase() === 'input') document.getElementById("hasil").value = "";
    else document.getElementById("hasil").innerText = "-";
  }
  if (document.getElementById("judulSurat")) document.getElementById("judulSurat").value = "";
  if (document.getElementById("isiSurat")) document.getElementById("isiSurat").value = "";
  if (document.getElementById("fileSurat")) document.getElementById("fileSurat").value = "";
  Swal.fire({ icon: 'info', title: 'Di-reset', text: 'Formulir telah dikosongkan.', timer: 1500, showConfirmButton: false });
};

window.simpanDraft = function () {
  const hasilEl = document.getElementById("hasil");
  const nomor = hasilEl ? (hasilEl.tagName.toLowerCase() === 'input' ? hasilEl.value : hasilEl.innerText) : "-";
  if (!nomor || nomor === "-" || nomor === "") return Swal.fire({ icon: 'warning', title: 'Belum Ada Nomor', text: 'Generate nomor dulu sebelum menyimpan ke draft!' });

  const kode = document.getElementById("kodeSurat")?.value;
  const tanggal = document.getElementById("tanggal")?.value;
  if(tanggal && nomor && nomor !== "-") {
      const [tahun] = tanggal.split("-");
      const key = `counter_${kode}_${tahun}`;
      let counter = localStorage.getItem(key) || 1;
      localStorage.setItem(key, Number(counter) + 1);
  }

  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
  data.push({
    nomor,
    status: "draft",
    user: u.nama,
    sekolah: u.sekolah,
  });
  localStorage.setItem("arsip", JSON.stringify(data));

  Swal.fire({
    icon: 'success',
    title: 'Disimpan ke Draft!',
    text: 'Surat berhasil disimpan ke Draft.',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'OK'
  }).then(() => {
    resetForm();
    loadArsip();
    if (typeof showSection === "function") {
      showSection('riwayatSurat');
      document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
      const buttons = document.querySelectorAll('.menu-item');
      buttons.forEach(b => {
        if (b.innerText.includes('Riwayat')) b.classList.add('active');
      });
    }
  });
};

// load arsip (filter user)
function loadArsip() {
  const list = document.getElementById("arsipList");
  const listFinal = document.getElementById("arsipFinalList");
  if (!list) return;

  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
  list.innerHTML = "";
  if (listFinal) listFinal.innerHTML = "";

  let totalDiajukan = 0;
  let totalDisetujui = 0;

  data
    .filter((a) => a.user === u.nama)
    .forEach((a) => {
      totalDiajukan++;
      if (a.status === 'disetujui') totalDisetujui++;

      let badgeClass = "pending";
      if (a.status === "disetujui") badgeClass = "disetujui";
      else if (a.status === "ditolak" || a.status === "Telah Dikirim Balik Ke User" || a.status === "draft") badgeClass = "revisi";

      let btnEdit = "";
      if (a.status === "Telah Dikirim Balik Ke User" || a.status === "ditolak" || a.status === "draft") {
        let labelBtn = a.status === "draft" ? "Lanjutkan" : "Revisi";
        btnEdit = `<button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: var(--secondary); margin-left: 5px;" onclick="editSurat('${a.nomor}')"><i class="ri-edit-line"></i> ${labelBtn}</button>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
          ${btnEdit}
        </td>
      `;
      list.appendChild(tr);

      if (a.status === 'disetujui' && listFinal) {
        const trFinal = document.createElement("tr");
        trFinal.innerHTML = `
          <td><strong>${a.nomor}</strong></td>
          <td><span class="badge disetujui">${a.status}</span></td>
          <td>
            <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
          </td>
        `;
        listFinal.appendChild(trFinal);
      }
    });

  if (document.getElementById("statTotalSurat")) document.getElementById("statTotalSurat").innerText = totalDiajukan;
  if (document.getElementById("statDisetujui")) document.getElementById("statDisetujui").innerText = totalDisetujui;
}

// search arsip
function searchArsip(keyword) {
  const list = document.getElementById("arsipList");
  if (!list) return;

  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
  list.innerHTML = "";

  data
    .filter((a) => a.user === u.nama && a.nomor.toLowerCase().includes((keyword || "").toLowerCase()))
    .forEach((a) => {
      let badgeClass = "pending";
      if (a.status === "disetujui") badgeClass = "disetujui";
      else if (a.status === "ditolak" || a.status === "Telah Dikirim Balik Ke User" || a.status === "draft") badgeClass = "revisi";

      let btnEdit = "";
      if (a.status === "Telah Dikirim Balik Ke User" || a.status === "ditolak" || a.status === "draft") {
        let labelBtn = a.status === "draft" ? "Lanjutkan" : "Revisi";
        btnEdit = `<button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: var(--secondary); margin-left: 5px;" onclick="editSurat('${a.nomor}')"><i class="ri-edit-line"></i> ${labelBtn}</button>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
          ${btnEdit}
        </td>
      `;
      list.appendChild(tr);
    });
}

// filter arsip
function filterArsip(status) {
  const list = document.getElementById("arsipList");
  if (!list) return;

  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
  list.innerHTML = "";

  data
    .filter((a) => a.user === u.nama && (status === "all" || a.status === status))
    .forEach((a) => {
      let badgeClass = "pending";
      if (a.status === "disetujui") badgeClass = "disetujui";
      else if (a.status === "ditolak" || a.status === "Telah Dikirim Balik Ke User" || a.status === "draft") badgeClass = "revisi";

      let btnEdit = "";
      if (a.status === "Telah Dikirim Balik Ke User" || a.status === "ditolak" || a.status === "draft") {
        let labelBtn = a.status === "draft" ? "Lanjutkan" : "Revisi";
        btnEdit = `<button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: var(--secondary); margin-left: 5px;" onclick="editSurat('${a.nomor}')"><i class="ri-edit-line"></i> ${labelBtn}</button>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${a.nomor}</strong></td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="lihatSurat('${a.nomor}')"><i class="ri-eye-line"></i> Lihat</button>
          ${btnEdit}
        </td>
      `;
      list.appendChild(tr);
    });
}

// lihat surat (global)
window.lihatSurat = function (nomor) {
  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
  let surat = data.find(s => s.nomor === nomor);

  if (surat) {
    let badgeClass = "pending";
    if (surat.status === "disetujui") badgeClass = "disetujui";
    else if (surat.status === "ditolak" || surat.status === "Telah Dikirim Balik Ke User" || surat.status === "draft") badgeClass = "revisi";

    Swal.fire({
      title: 'Detail Surat',
      html: `
        <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px;">
          <p style="margin-bottom:8px;"><strong>Nomor Surat:</strong> <br/>${surat.nomor}</p>
          <p style="margin-bottom:8px;"><strong>Status:</strong> <br/><span class="badge ${badgeClass}">${surat.status}</span></p>
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

// edit surat (revisi / draft)
window.editSurat = function (nomor) {
  let data = (function () { try { return JSON.parse(localStorage.getItem("arsip")); } catch (e) { return null; } })() || [];
  let index = data.findIndex(s => s.nomor === nomor);

  if (index !== -1) {
    let actionText = data[index].status === 'draft' ? 'Ajukan Sekarang' : 'Ajukan Ulang';
    let titleText = data[index].status === 'draft' ? 'Lanjutkan Draft' : 'Revisi Surat';

    Swal.fire({
      title: titleText,
      html: `
        <div style="text-align: left; padding-top: 10px;">
          <p style="margin-bottom: 15px; font-size: 0.9rem; color: #64748b;">Nomor: <strong>${nomor}</strong></p>
          <p style="margin-bottom: 10px; font-weight: 500;">Silakan upload ulang file draft yang sudah diperbaiki:</p>
          <input type="file" id="revisiFile" class="swal2-input" accept=".pdf,.doc,.docx" style="max-width: 100%; margin: 0; font-size: 0.9rem;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: `<i class="ri-upload-cloud-2-line"></i> ${actionText}`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#10b981', // green for success/update
      preConfirm: () => {
        const file = document.getElementById('revisiFile').files[0];
        if (!file) {
          Swal.showValidationMessage('Anda harus memilih file draft baru!');
        }
        return file;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        data[index].status = 'pending';
        localStorage.setItem("arsip", JSON.stringify(data));
        Swal.fire('Berhasil!', 'Draft surat telah berhasil diajukan ke Admin.', 'success');
        loadArsip();
      }
    });
  }
}

// init
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadKodeSurat();
  loadArsip();
  generateNomor(); // Auto generate on load
});


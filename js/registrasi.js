function register() {
  let email = document.getElementById("email").value;
  let nama = document.getElementById("nama").value;
  let pass = document.getElementById("regPass").value;
  let jk = document.getElementById("jk").value;
  let sekolah = document.getElementById("sekolah").value;
  let role = document.getElementById("role").value;

  // validasi
  if (!email || !nama || !pass || !jk || !sekolah || !role) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Semua field wajib diisi!' });
    return;
  }

  let data = JSON.parse(localStorage.getItem("users")) || [];

  // cek email
  let cek = data.find((u) => u.email === email);
  if (cek) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Email sudah terdaftar!' });
    return;
  }

  // simpan data
  data.push({
    email: email,
    nama: nama,
    pass: pass,
    jk: jk,
    sekolah: sekolah,
    role: role,
  });

  localStorage.setItem("users", JSON.stringify(data));

  Swal.fire({
    icon: 'success',
    title: 'Registrasi Berhasil!',
    text: 'Silakan login dengan akun baru Anda.',
    timer: 2000,
    showConfirmButton: false
  }).then(() => {
    window.location.href = "login.html";
  });
}

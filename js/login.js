function login() {
  let email = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPass").value;

  let data = JSON.parse(localStorage.getItem("users")) || [];

  if (data.length === 0) {
    // Seed default users for testing
    data = [
      { email: "user@test.com", pass: "123", nama: "Guru Budi", role: "user", sekolah: "SMAN 1" },
      { email: "admin@test.com", pass: "123", nama: "Admin TU", role: "admin", sekolah: "Dinas" },
      { email: "kepsek@test.com", pass: "123", nama: "Kepsek Joko", role: "kepsek", sekolah: "SMAN 1" }
    ];
    localStorage.setItem("users", JSON.stringify(data));
  }

  // ✅ PERBAIKAN DI SINI
  let found = data.find((u) => u.email === email && u.pass === pass);

  if (found) {
    localStorage.setItem("activeUser", JSON.stringify(found));

    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil!',
      text: 'Mengarahkan ke dashboard...',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      if (found.role === "user") window.location.href = "user.html";
      else if (found.role === "admin") window.location.href = "admin.html";
      else if (found.role === "kepsek") window.location.href = "kepsek.html";
    });
  } else {
    Swal.fire({ icon: 'error', title: 'Login Gagal', text: 'Email atau password salah!' });
  }
}

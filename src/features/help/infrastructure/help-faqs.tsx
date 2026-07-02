/* eslint-disable react-refresh/only-export-components */
import type { HelpFaq } from "@/features/help/domain/help-faq";
import { appAssets } from "@/shared/assets/app-assets";

function WhatsappLine({ phone }: { phone: string }) {
  return (
    <span className="mt-2 flex items-center justify-center gap-2 font-bold text-[#111827]">
      <img src={appAssets.whatsappIcon} alt="" className="h-6 w-6 object-contain brightness-0 md:h-8 md:w-8" />
      <span>: {phone}</span>
    </span>
  );
}

export const helpFaqs: HelpFaq[] = [
  {
    id: "akun-aplikasi",
    question: "Bagaimana cara mendapatkan akun aplikasi ?",
    answer: (
      <ol className="list-decimal space-y-1 pl-8">
        <li>
          Akun Untuk aplikasi Pegawai ini <strong>tidak dapat di buat secara mandiri</strong> oleh pengguna.
        </li>
        <li>
          Username dan password hanya diberikan oleh <strong>administrasi resmi aplikasi</strong>
        </li>
        <li>
          Jika Anda belum menerima akun, silahkan menghubungi admin melalui WhatsApp di nomor berikut:
          <WhatsappLine phone="0813-3161-7801" />
        </li>
      </ol>
    ),
  },
  {
    id: "tidak-login",
    question: "Tidak dapat login ke aplikasi ?",
    answer: (
      <ol className="list-decimal space-y-1 pl-8">
        <li>Username atau password yang di masukan tidak sesuai.</li>
        <li>Koneksi internet tidak stabil.</li>
        <li>Aplikasi membutuhkan pembaruan versi terbaru. Silakan. pastikan kembali data login dan koneksi anda.</li>
        <li>
          Jika semua sudah benar namun tetap gagal, segera hubungi admin di,
          <WhatsappLine phone="0813-3161-7801" />
        </li>
      </ol>
    ),
  },
  {
    id: "lupa-password",
    question: "Lupa password akun ?",
    answer: (
      <div className="space-y-5 pl-5">
        <p>
          Apabila anda lupa password,silahkan menghubungi <strong>administrator</strong> untuk melakukan reset kata sandi. Admin akan segera membantu memulihkan akses akun anda, hubungi admin di,
        </p>
        <WhatsappLine phone="0813-3161-7801" />
        <p>Sebutkan nama lengkap Anda dan instansi/unit terkait terkendalanya agar proses verifikasi berjalan cepat</p>
      </div>
    ),
  },
  {
    id: "force-close",
    question: "Aplikasi tidak dapat di buka/force close?",
    answer: (
      <ol className="list-decimal space-y-1 pl-8">
        <li>Tutup aplikasi sepenuhnya.</li>
        <li>Periksa koneksi internet.</li>
        <li>Hapus cache aplikasi.</li>
        <li>Perbarui aplikasi.</li>
        <li>Restart perangkat.</li>
        <li>
          instal ulang aplikasi <strong>jika perlu.</strong>
        </li>
        <li>
          Jika semua sudah benar namun tetap gagal, segera hubungi admin di,
          <WhatsappLine phone="0813-3161-7801" />
        </li>
      </ol>
    ),
  },
  {
    id: "ganti-akun",
    question: "Bisa dapat mengganti atau membuat akun baru sendiri ?",
    answer: (
      <div className="space-y-2 pl-2">
        <p>
          Tidak bisa. Seluruh akun hanya dibuat dan di kelola oleh administrator pusat untuk menjaga keamanan sistem dan pada data pengguna. Jika anda membutuhkan akses baru (misalnya karena pindah unit atau pengantian perangkat), silakan ajukan ke admin melalui Whatsapp
        </p>
        <WhatsappLine phone="0813-3161-7801" />
      </div>
    ),
  },
  {
    id: "tanpa-internet",
    question: "Apakah bisa digunakan tanpa internet ?",
    answer: (
      <p className="pl-2">
        Tidak bisa. Aplikasi ini memerlukan koneksi internet aktif agar data dapat terhubung langsung dengan server pusat.Tanpa koneksi internet Pengguna tidak dapat login ke aplikasi. Maka Data pegawai dan aktivitas tidak akan tersinkronisasi. Serta beberapa fitur seperti absensi, laporan. dan update informasi tidak bisa dijalankan.
      </p>
    ),
  },
  {
    id: "beberapa-perangkat",
    question: "login di beberapa perangkat?",
    answer: (
      <p className="pl-2">
        Tidak disarankan, bahkan pada beberapa akun tidak diperbolehkan. Setiap akun pegawai hanya boleh digunakan di satu perangkat aktif pada satu waktu untuk menjaga keamanan data dan mencegah duplikasi aktivitas..
      </p>
    ),
  },
  {
    id: "kendala-lain",
    question: "Kendala lain ?",
    answer: (
      <div className="space-y-2 pl-2">
        <p>
          Jika Anda mengalami kendala lain yang belum disebutkan di atas, silakan segera hubungi tim admin atau teknisi untuk mendapatkan penanganan lebih lanjut. Sampaikan secara detail jenis kendala yang Anda alami, seperti fitur yang tidak berfungsi, tampilan yang error, atau kesulitan saat login, agar tim kami dapat membantu dengan lebih cepat dan tepat.
        </p>
        <p>Dukungan kami tersedia selama jam kerja untuk memastikan aplikasi dapat kembali berjalan dengan baik dan mendukung aktivitas kerja Anda tanpa hambatan.</p>
        <WhatsappLine phone="0821-4565-2729" />
      </div>
    ),
  },
];

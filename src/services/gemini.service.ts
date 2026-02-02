import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  constructor() {
    console.log('Silaq AI Service (Mock Mode) Initialized');
  }

  /**
   * MOCK: Simulasi Analisis Gambar Makanan
   * Mengembalikan respons sukses seolah-olah AI telah menganalisis gambar.
   */
  async analyzeFoodImage(base64Image: string): Promise<any> {
    // 1. Simulasi loading "Berpikir" (1.5 - 2.5 detik) agar terasa proses AI berjalan
    const delay = Math.floor(Math.random() * 1000) + 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 2. Variasi Hasil Deteksi agar terlihat "Real" dan Dinamis saat demo
    const foodItems = [
        'Nasi Kotak Ayam', 
        'Roti Manis & Kue', 
        'Buah-buahan Segar', 
        'Paket Sembako',
        'Lauk Pauk Matang'
    ];
    const detected = foodItems[Math.floor(Math.random() * foodItems.length)];

    // 3. Kembalikan JSON persis seperti format Gemini asli
    return {
      isEdible: true,
      safetyStatus: "aman",
      detectedItem: detected,
      condition: "Kemasan terlihat utuh, makanan tampak segar dan higienis.",
      recommendationTitle: "Lolos Sensor AI",
      recommendationReason: "Makanan memenuhi standar kelayakan konsumsi manusia.",
      targetRecipient: "Panti Asuhan / Masyarakat Umum"
    };
  }

  /**
   * MOCK: Simulasi Chatbot
   * Menggunakan logika keyword sederhana + jawaban acak agar terasa nyambung.
   */
  async chatWithBot(message: string, role: 'expert' | 'admin' | 'community', context?: string): Promise<string> {
    // 1. Simulasi mengetik (1 - 2 detik)
    const delay = Math.floor(Math.random() * 1000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    const lowerMsg = message.toLowerCase();

    // --- LOGIKA ADMIN ---
    if (role === 'admin') {
      if (lowerMsg.includes('halo') || lowerMsg.includes('hai')) return "Halo! Selamat datang di layanan Admin Silaq. Ada yang bisa kami bantu?";
      if (lowerMsg.includes('salah') || lowerMsg.includes('error') || lowerMsg.includes('masalah')) return "Mohon maaf atas ketidaknyamanannya. Bisa jelaskan detail kendala yang Anda alami?";
      if (lowerMsg.includes('poin') || lowerMsg.includes('reward')) return "Poin bisa ditukarkan di menu Profil > Tukar Poin. Pastikan Anda sudah memverifikasi akun ya.";
      
      return "Terima kasih telah menghubungi kami. Tim support akan segera meninjau pesan Anda. Mohon tunggu sebentar ya.";
    } 
    
    // --- LOGIKA EXPERT (PAKAR) ---
    if (role === 'expert') {
        // Keyword spesifik pertanian/limbah
        if (lowerMsg.includes('maggot') || lowerMsg.includes('bsf')) return "Maggot BSF sangat efektif! Pastikan media tumbuhnya tidak terlalu basah (becek) agar maggot tidak kabur. Idealnya kelembaban 60%.";
        if (lowerMsg.includes('kompos') || lowerMsg.includes('pupuk')) return "Untuk kompos, rasio C/N (Coklat/Hijau) sangat penting. Campurkan daun kering dengan sisa sayur agar tidak bau.";
        if (lowerMsg.includes('bau') || lowerMsg.includes('busuk')) return "Jika kompos berbau busuk, artinya terlalu basah atau kurang oksigen. Coba tambahkan sekam atau daun kering dan aduk rata.";
        
        // Jawaban umum pakar
        const expertResponses = [
            "Pertanyaan bagus. Dalam pengelolaan organik, konsistensi adalah kunci. Jangan lupa memilah sampah plastik agar tidak tercampur.",
            "Saran saya, mulailah dari skala kecil dulu di rumah. Manfaatkan ember bekas untuk komposter sederhana.",
            "Secara teknis itu sangat mungkin dilakukan. Yang penting pastikan sirkulasi udara lancar.",
            "Betul sekali. Mengolah limbah bukan hanya soal teknik, tapi juga soal merawat lingkungan jangka panjang."
        ];
        return expertResponses[Math.floor(Math.random() * expertResponses.length)];
    }

    // --- LOGIKA COMMUNITY (WARGA) ---
    if (role === 'community') {
        if (lowerMsg.includes('lokasi') || lowerMsg.includes('dimana')) return "Lokasinya ada di daerah Mataram kak, dekat Islamic Center.";
        if (lowerMsg.includes('jemput') || lowerMsg.includes('ambil')) return "Bisa banget, nanti dikabari kalau relawan sudah jalan ya.";
        if (lowerMsg.includes('terima kasih') || lowerMsg.includes('makasih')) return "Sama-sama kak! Berkah selalu ya.";

        // Jawaban umum warga
        const communityResponses = [
            "Wah mantap infonya gan!",
            "Siap, izin merapat ke lokasi.",
            "Semoga berkah untuk kita semua.",
            "Ada yang tau info pengepul jelantah daerah sini?",
            "Luar biasa gerakan Silaq ini, sangat terbantu."
        ];
        return communityResponses[Math.floor(Math.random() * communityResponses.length)];
    }

    return "Maaf, saya kurang mengerti. Bisa dijelaskan lagi?";
  }
}
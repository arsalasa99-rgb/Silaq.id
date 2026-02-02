import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async analyzeFoodImage(base64Image: string): Promise<any> {
    try {
      const prompt = `
        Berperanlah sebagai 'Silaq AI Sensor'. Tugasmu adalah memilah makanan untuk dua jalur donasi berbeda:
        
        JALUR 1: DONASI MAKANAN (Human Consumption)
        - Target: Panti Asuhan, Panti Jompo, Masyarakat Umum.
        - Syarat: Higienis, belum kadaluwarsa, tidak basi, kemasan utuh/baik, sangat layak makan.
        
        JALUR 2: DONASI SAMPAH MAKANAN (Organic Waste)
        - Target: Petani Kompos, Peternak Maggot BSF.
        - Syarat: Makanan sisa, nasi basi, kulit buah, sayuran layu, tulang, atau makanan yang sudah tidak layak bagi manusia.

        Analisis gambar ini dan kembalikan JSON murni (tanpa markdown):
        {
          "isEdible": boolean, // true jika JALUR 1, false jika JALUR 2
          "safetyStatus": "aman" | "waspada" | "bahaya",
          "detectedItem": "Nama benda (misal: Nasi Kotak, Kulit Pisang, Roti Berjamur)",
          "condition": "Deskripsi kondisi fisik (misal: 'Segar dan tertutup', 'Berjamur dan berair')",
          "recommendationTitle": "Judul Rekomendasi (misal: 'Lolos Sensor AI' atau 'Alihkan ke Limbah')",
          "recommendationReason": "Alasan singkat (misal: 'Makanan terlihat higienis', 'Terdeteksi jamur, berbahaya bagi manusia')",
          "targetRecipient": "Saran penerima (misal: 'Panti Asuhan/Jompo', 'Peternak Maggot', 'Petani Kompos')"
        }
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text);

    } catch (error) {
      console.error('Gemini Analysis Error:', error);
      throw error;
    }
  }

  async chatWithBot(message: string, role: 'expert' | 'admin' | 'community', context?: string): Promise<string> {
    try {
      // Base strict formatting rule added to all personas
      const formattingRule = "PENTING: JANGAN gunakan format markdown sedikitpun. Jangan gunakan tanda bintang (** atau *) untuk menebalkan huruf. Gunakan teks polos biasa saja. Gunakan paragraf singkat.";

      let systemInstruction = "";

      if (role === 'admin') {
        systemInstruction = `Anda adalah Admin Support resmi aplikasi 'Silaq.id'. Aplikasi ini adalah platform donasi makanan dan limbah organik di Lombok. Jawablah pertanyaan pengguna dengan ramah, singkat, dan solutif. ${formattingRule}`;
      } else if (role === 'expert') {
        systemInstruction = `Anda adalah seorang Ahli/Pakar bernama ${context || 'Pakar Silaq'} di bidang pertanian, pengelolaan limbah, atau gizi. Jawab pertanyaan pengguna secara teknis namun mudah dimengerti. Berikan tips praktis. ${formattingRule}. Fokus pada topik: Maggot BSF, Kompos, Pertanian Organik, dan Gizi Makanan.`;
      } else if (role === 'community') {
        systemInstruction = `Anda adalah anggota komunitas ${context || 'Warga Lombok'} di aplikasi Silaq.id. Berikan balasan yang santai, akrab, suportif, dan menggunakan bahasa sehari-hari. Anda antusias tentang donasi makanan dan lingkungan. Jawablah singkat seperti chatting di grup WA. ${formattingRule}`;
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: message,
        config: {
          systemInstruction: systemInstruction
        }
      });

      // Clean up any accidental markdown if the model hallucinates it
      let text = response.text || "Maaf, saya sedang tidak bisa menjawab saat ini.";
      text = text.replace(/\*\*/g, '').replace(/\*/g, ''); 
      
      return text;
    } catch (error) {
      console.error('Chat Error:', error);
      return "Mohon maaf, koneksi sedang gangguan. Silahkan coba lagi nanti.";
    }
  }
}
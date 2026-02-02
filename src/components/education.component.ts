import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Material {
  id: number;
  title: string;
  channelName: string;
  views: string;
  duration: string;
  image: string;
  category: 'religion' | 'technical' | 'compost';
  isTrending?: boolean;
}

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#E6DDC5] pb-24 relative overflow-hidden">
      
      <!-- Video Player Overlay (YouTube Style) -->
      @if (viewMode() === 'player' && selectedMaterial()) {
        <div class="fixed inset-0 z-[60] bg-[#1C1C1E] flex flex-col animate-fade-in overflow-y-auto">
             <!-- (Same Player UI as before, just kept for functionality) -->
             <div class="relative w-full aspect-video bg-black flex items-center justify-center sticky top-0 z-10">
                 <img [src]="selectedMaterial()!.image" class="w-full h-full object-contain opacity-60">
                 <div class="absolute inset-0 flex items-center justify-center">
                     <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 animate-pulse cursor-pointer hover:scale-110 transition-transform">
                         <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     </div>
                 </div>
                 <button (click)="closePlayer()" class="absolute top-4 left-4 text-white bg-black/40 p-2 rounded-full backdrop-blur-md hover:bg-black/60">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                 </button>
             </div>
             
             <div class="p-5 text-white pb-20">
                 <h2 class="text-xl font-bold leading-snug mb-2">{{ selectedMaterial()!.title }}</h2>
                 <div class="flex items-center text-xs text-gray-400 mb-4 gap-2">
                    <span>{{ selectedMaterial()!.views }} x ditonton</span>
                    <span>•</span>
                    <span>2 hari yang lalu</span>
                 </div>
                 
                 <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#C04E35] flex items-center justify-center text-white font-bold text-sm">
                            {{ selectedMaterial()!.channelName.charAt(0) }}
                        </div>
                        <div>
                            <p class="font-bold text-sm">{{ selectedMaterial()!.channelName }}</p>
                            <p class="text-xs text-gray-400">12.5 rb subscriber</p>
                        </div>
                    </div>
                    <button class="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">Subscribe</button>
                 </div>
                 
                 <h3 class="font-bold text-sm mb-4">Rekomendasi</h3>
                 @for (item of filteredMaterials().slice(0, 5); track item.id) {
                     <div class="flex gap-3 mb-4 cursor-pointer" (click)="openMaterial(item)">
                         <div class="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                             <img [src]="item.image" class="w-full h-full object-cover">
                         </div>
                         <div class="flex-1">
                             <h4 class="text-sm font-bold line-clamp-2 text-white">{{ item.title }}</h4>
                             <p class="text-xs text-gray-400 mt-1">{{ item.channelName }}</p>
                         </div>
                     </div>
                 }
             </div>
        </div>
      }

      <!-- MAIN SCROLLABLE AREA -->
      <div class="flex-1 overflow-y-auto pb-32 scroll-smooth bg-[#E6DDC5]">
        
        <!-- 1. HEADER & SEARCH -->
        <div class="px-5 pt-12 pb-2 bg-[#E6DDC5] sticky top-0 z-30">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                     <div class="w-8 h-8 bg-[#C04E35] rounded-lg flex items-center justify-center text-white text-sm">📺</div>
                     <h1 class="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">Silaq TV</h1>
                </div>
                <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" class="w-full h-full bg-white">
                </div>
            </div>

            <!-- Search Bar -->
            <div class="relative">
                <input 
                    type="text" 
                    [(ngModel)]="searchQuery" 
                    placeholder="Cari video edukasi..." 
                    class="w-full bg-white border border-[#D1CDC4] rounded-full px-5 py-3 pl-11 text-sm font-bold text-[#1C1C1E] shadow-sm focus:outline-none focus:border-[#C04E35] transition-colors"
                >
                <svg class="absolute left-4 top-3.5 text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
        </div>

        <!-- 2. TUPOKSI WIDGET (Purpose of Education Feature) - Compact -->
        <div class="px-5 mt-4">
            <div class="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] rounded-xl p-4 text-white relative overflow-hidden shadow-lg border border-white/10 flex items-center justify-between">
                <div class="relative z-10 max-w-[70%]">
                    <p class="text-[#D98C36] text-[9px] font-bold uppercase tracking-widest mb-1">Ruang Belajar</p>
                    <h3 class="font-bold text-sm leading-tight">Edukasi Pengelolaan Limbah & Adab Berbagi</h3>
                    <p class="text-[10px] text-gray-400 mt-1 line-clamp-1">Pelajari cara mengolah sampah jadi berkah.</p>
                </div>
                <div class="w-10 h-10 bg-[#D98C36]/20 rounded-full flex items-center justify-center text-xl relative z-10 border border-[#D98C36]/30">
                    🎓
                </div>
                <!-- Decorative Circle -->
                <div class="absolute -right-4 -bottom-10 w-24 h-24 bg-[#D98C36]/10 rounded-full blur-xl"></div>
            </div>
        </div>

        <!-- 3. TRENDING SECTION (Horizontal Scroll) -->
        <div class="mt-6 border-b border-[#D1CDC4]/50 pb-6">
            <div class="px-5 flex items-center justify-between mb-3">
                <h3 class="font-bold text-[#1C1C1E] text-sm flex items-center gap-1">
                    🔥 Sedang Trending
                </h3>
            </div>
            
            <div class="flex overflow-x-auto px-5 gap-4 no-scrollbar">
                @for (item of trendingMaterials(); track item.id) {
                    <div (click)="openMaterial(item)" class="flex-shrink-0 w-64 group cursor-pointer">
                        <div class="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-white/40 mb-2">
                             <img [src]="item.image" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
                             <span class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">{{ item.duration }}</span>
                        </div>
                        <h4 class="font-bold text-xs text-[#1C1C1E] line-clamp-2 leading-snug mb-0.5">{{ item.title }}</h4>
                        <p class="text-[10px] text-[#636366]">{{ item.channelName }} • {{ item.views }}</p>
                    </div>
                }
            </div>
        </div>

        <!-- 4. CATEGORY PILLS (Sticky) -->
        <div class="px-5 py-3 sticky top-[120px] z-20 bg-[#E6DDC5]/95 backdrop-blur-sm border-b border-[#D1CDC4]/50">
             <div class="flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                    (click)="activeCategory.set('all')"
                    class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap"
                    [class.bg-[#1C1C1E]]="activeCategory() === 'all'"
                    [class.text-white]="activeCategory() === 'all'"
                    [class.bg-white]="activeCategory() !== 'all'"
                    [class.border-transparent]="activeCategory() === 'all'"
                    [class.border-[#D1CDC4]]="activeCategory() !== 'all'"
                >
                    Semua
                </button>
                <button 
                    (click)="activeCategory.set('compost')"
                    class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap"
                    [class.bg-[#5D7A45]]="activeCategory() === 'compost'"
                    [class.text-white]="activeCategory() === 'compost'"
                    [class.bg-white]="activeCategory() !== 'compost'"
                    [class.border-transparent]="activeCategory() === 'compost'"
                    [class.border-[#D1CDC4]]="activeCategory() !== 'compost'"
                >
                    🌱 Kompos Sederhana
                </button>
                <button 
                    (click)="activeCategory.set('religion')"
                    class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap"
                    [class.bg-[#1C1C1E]]="activeCategory() === 'religion'"
                    [class.text-white]="activeCategory() === 'religion'"
                    [class.bg-white]="activeCategory() !== 'religion'"
                    [class.border-transparent]="activeCategory() === 'religion'"
                    [class.border-[#D1CDC4]]="activeCategory() !== 'religion'"
                >
                    Kajian Religi
                </button>
                <button 
                    (click)="activeCategory.set('technical')"
                    class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap"
                    [class.bg-[#1C1C1E]]="activeCategory() === 'technical'"
                    [class.text-white]="activeCategory() === 'technical'"
                    [class.bg-white]="activeCategory() !== 'technical'"
                    [class.border-transparent]="activeCategory() === 'technical'"
                    [class.border-[#D1CDC4]]="activeCategory() !== 'technical'"
                >
                    Teknik Limbah
                </button>
             </div>
        </div>

        <!-- 5. MAIN VIDEO LIST (Compact YouTube Style) -->
        <div class="flex flex-col px-5 pt-4 pb-12 gap-5">
            @for (item of filteredMaterials(); track item.id) {
                <div (click)="openMaterial(item)" class="flex flex-col gap-2 cursor-pointer group active:scale-[0.98] transition-transform">
                    <!-- Thumbnail -->
                    <div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-white/50 bg-gray-100">
                        <img [src]="item.image" class="w-full h-full object-cover">
                        <span class="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {{ item.duration }}
                        </span>
                        <!-- Play Overlay -->
                         <div class="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <svg class="w-4 h-4 text-[#1C1C1E] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                             </div>
                        </div>
                    </div>
                    
                    <!-- Meta -->
                    <div class="flex gap-3 px-1">
                        <div class="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                             <img [src]="'https://picsum.photos/seed/' + item.channelName + '/100'" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1">
                            <h3 class="text-[#1C1C1E] font-bold text-sm leading-tight line-clamp-2 mb-1">{{ item.title }}</h3>
                            <div class="text-[#636366] text-[11px] font-medium flex items-center gap-1">
                                <span>{{ item.channelName }}</span>
                                <span class="text-[8px]">•</span>
                                <span>{{ item.views }} x ditonton</span>
                            </div>
                        </div>
                        <button class="text-gray-400 self-start">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                        </button>
                    </div>
                </div>
            }
            @if (filteredMaterials().length === 0) {
                <div class="text-center py-10 text-gray-500">
                    <p>Tidak ada video ditemukan.</p>
                </div>
            }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class EducationComponent {
  activeCategory = signal<'all' | 'religion' | 'technical' | 'compost'>('all');
  viewMode = signal<'list' | 'player'>('list');
  selectedMaterial = signal<Material | null>(null);
  searchQuery = '';

  // GENERATING 20+ ITEMS
  allMaterials: Material[] = [
    // NEW: COMPOST EDUCATION (Edukasi Pembuatan Kompos Sederhana) - Kept from previous step
    { id: 201, category: 'compost', title: "Cara Membuat Kompos dari Sisa Dapur (Langkah demi Langkah)", channelName: "Kebun Rumah", views: "150 rb", duration: "10:15", image: "https://android-kit.com/wp-content/uploads/2024/05/9-Langkah-Cara-Membuat-Kompos-Dari-Sisa-Dapur.jpg", isTrending: true },
    { id: 202, category: 'compost', title: "Tutorial Pupuk Cair dari Kulit Pisang untuk Anggrek", channelName: "Tani Hias", views: "88 rb", duration: "08:20", image: "https://i.ytimg.com/vi/AvqdJxhpVHE/maxresdefault.jpg" },
    { id: 203, category: 'compost', title: "Jangan Buang Nasi Basi! Olah Jadi MOL (Mikroorganisme Lokal)", channelName: "Organik Jaya", views: "200 rb", duration: "12:05", image: "https://asset.kompas.com/crops/UiuDBG_L3N5GTPUrmHk3zCfQNhg=/0x120:1440x1080/750x500/data/photo/2023/04/05/642d8cb6a4b8a.png", isTrending: true },
    { id: 204, category: 'compost', title: "Tips Mengaplikasikan Kompos pada Tanaman Sayur di Pot", channelName: "Urban Farming", views: "45 rb", duration: "07:30", image: "https://assets.api.gamma.app/7vmrodicyfffutb/screenshots/yosu180ui9gldlg/627oz8xrl1zrt0g/slide/TOatyzcphAMc60fCXA7R7zn1UiU" },
    { id: 205, category: 'compost', title: "Rahasia Kompos Tidak Bau Busuk", channelName: "Zero Waste ID", views: "110 rb", duration: "09:10", image: "https://i.ytimg.com/vi/RDBewb1HKUQ/maxresdefault.jpg" },

    // Trending items (Kept)
    { id: 1, category: 'technical', title: "Cara Ternak Maggot BSF Pemula Sukses 100%", channelName: "Juragan Maggot", views: "1.2 jt", duration: "12:05", image: "https://i.ytimg.com/vi/-w2PwNtRQvM/maxresdefault.jpg", isTrending: true },
    { id: 2, category: 'religion', title: "Hukum Membuang Makanan dalam Islam", channelName: "Silaq Dakwah", views: "890 rb", duration: "15:30", image: "https://i.pinimg.com/564x/c8/b4/b2/c8b4b262a6423bc7b3a07e1cd32f4049.jpg", isTrending: true },
    { id: 3, category: 'technical', title: "Rahasia Pupuk Kompos Cair Super Cepat", channelName: "Kebun Organik", views: "450 rb", duration: "08:45", image: "https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786027819429_Panduan-Membuat-Pupuk-Kompos-Cair-Spm.jpg", isTrending: true },
    { id: 4, category: 'technical', title: "Daur Ulang Minyak Jelantah Jadi Sabun", channelName: "DIY Kreatif", views: "200 rb", duration: "10:10", image: "https://media-origin.kompas.tv/library/image/thumbnail/1602047892/SABUN_MINYAK_JELANTAH1602047892.a_675_380.jpg" },
    { id: 5, category: 'technical', title: "Biopori: Solusi Banjir & Sampah", channelName: "Green Earth", views: "120 rb", duration: "06:20", image: "https://waste4change.com/blog/wp-content/uploads/lubang-biopori-580x326.png" },
    { id: 6, category: 'technical', title: "Panen Cuan dari Sampah Plastik", channelName: "Bisnis Sampah", views: "340 rb", duration: "18:00", image: "https://cdn.medcom.id/dynamic/content/2022/01/29/1382851/Al6n4D2FSo.jpeg?w=1024" },

    // Technical List (Updating images for ID 7-11)
    { id: 7, category: 'technical', title: "Eco-Enzyme: Cairan Sejuta Manfaat", channelName: "Sehat Alami", views: "56 rb", duration: "09:50", image: "https://i.ytimg.com/vi/sgavJisrbuQ/maxresdefault.jpg" },
    { id: 8, category: 'technical', title: "Review Tong Komposter Rumah Tangga", channelName: "Review Alat", views: "12 rb", duration: "14:15", image: "https://down-id.img.susercontent.com/file/id-11134207-7rbk9-m6xmv1kllbqfe6" },
    { id: 9, category: 'technical', title: "Cara Memilah Sampah 3 Warna", channelName: "Edu Waste", views: "90 rb", duration: "05:00", image: "https://th.bing.com/th/id/R.8b77eaa5104f72bf6a064c1461595579?rik=46fyzxbS96ypAw&pid=ImgRaw&r=0" },
    { id: 10, category: 'technical', title: "Budidaya Cacing Tanah untuk Pakan", channelName: "Tani Jaya", views: "110 rb", duration: "11:20", image: "https://mediaternak.com/wp-content/uploads/2024/11/Panduan-Lengkap-Budidaya-Cacing-Tanah-untuk-Pemula-768x480.jpg" },
    { id: 11, category: 'technical', title: "Membuat Kerajinan dari Bungkus Kopi", channelName: "Kreatif Daur Ulang", views: "300 rb", duration: "08:10", image: "https://zact.id/wp-content/uploads/2021/07/Sebuah-Kerajinan-Tangan-dari-Bungkus-Kopi-yang-Bernilai-Seni-Tinggi-3-1024x576.jpg" },

    // Religion List (Updating images for ID 12-21)
    { id: 12, category: 'religion', title: "Adab Makan Rasulullah SAW", channelName: "Kisah Teladan", views: "1.5 jt", duration: "20:00", image: "https://assets.pikiran-rakyat.com/crop/0x0:0x0/720x0/webp/photo/2025/03/10/336764494.jpg" },
    { id: 13, category: 'religion', title: "Keutamaan Sedekah Makanan", channelName: "Ustadz Berbagi", views: "780 rb", duration: "13:40", image: "https://senyummandiri.org/wp-content/uploads/2024/10/Gambar-WhatsApp-2024-10-10-pukul-20.19.28_eb20b043.webp" },
    { id: 14, category: 'religion', title: "Bahaya Sifat Tabzir (Boros)", channelName: "Kajian Harian", views: "230 rb", duration: "16:10", image: "https://portalmadura.com/wp-content/uploads/2020/09/boros.jpg" },
    { id: 15, category: 'religion', title: "Menghargai Rezeki: Jangan Sisakan Nasi", channelName: "Motivasi Islam", views: "450 rb", duration: "07:30", image: "https://mjscolombo.com/public/2023/03/4aa3f1a545fd39bee41a5e5abead989e64262419e5cab.jpg" },
    { id: 16, category: 'religion', title: "Kisah Sahabat yang Gemar Memberi Makan", channelName: "Sirah Nabawiyah", views: "900 rb", duration: "25:00", image: "https://memberimakna-id.b-cdn.net/wp-content/uploads/2024/02/Abu-Umamah-1024x644.png" },
    { id: 17, category: 'religion', title: "Fiqih Makanan Halal & Haram", channelName: "Belajar Fiqih", views: "120 rb", duration: "30:00", image: "https://bimbinganislam.com/wp-content/uploads/2022/02/Kaidah-Kaidah-Fiqih-Terkait-Halal-Haram-Makanan-2.webp" },
    { id: 18, category: 'religion', title: "Merawat Bumi adalah Ibadah", channelName: "Islam & Alam", views: "67 rb", duration: "12:15", image: "https://kas.or.id/wp-content/uploads/2022/11/maxresdefault-6.jpg" },
    { id: 19, category: 'religion', title: "Puasa dan Kepedulian Sosial", channelName: "Ramadhan TV", views: "1.1 jt", duration: "15:00", image: "https://i.ytimg.com/vi/FkSHbkQ0GbQ/maxresdefault.jpg" },
    { id: 20, category: 'religion', title: "Doa Sebelum & Sesudah Makan", channelName: "Anak Sholeh", views: "2.5 jt", duration: "03:45", image: "https://www.lafalquran.com/wp-content/uploads/2020/03/DOA-SEBELUM-MAKAN.jpg" },
    { id: 21, category: 'religion', title: "Konsep Halalan Toyyiban", channelName: "Gaya Hidup Halal", views: "340 rb", duration: "14:20", image: "https://0901.static.prezi.com/preview/v2/75likcubowkbtb73pg5zhgxo5d6jc3sachvcdoaizecfr3dnitcq_3_0.png" }
  ];

  trendingMaterials = computed(() => {
    return this.allMaterials.filter(m => m.isTrending);
  });

  filteredMaterials = computed(() => {
    let result = this.allMaterials;
    
    // Category Filter
    if (this.activeCategory() !== 'all') {
        result = result.filter(m => m.category === this.activeCategory());
    }

    // Search Filter
    if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(m => 
            m.title.toLowerCase().includes(query) || 
            m.channelName.toLowerCase().includes(query)
        );
    }

    return result;
  });

  openMaterial(item: Material) {
    this.selectedMaterial.set(item);
    this.viewMode.set('player');
  }

  closePlayer() {
    this.viewMode.set('list');
    this.selectedMaterial.set(null);
  }
}
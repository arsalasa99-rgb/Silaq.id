
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

type RecipientStep = 'type-select' | 'details' | 'evidence' | 'location' | 'summary' | 'marketplace' | 'confirm_pickup' | 'success';

@Component({
  selector: 'app-recipient-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pb-32">
        
        <!-- HEADER WIZARD -->
        @if (currentStep() !== 'type-select' && currentStep() !== 'success') {
            <div class="glass-panel px-6 py-4 sticky top-0 z-30 border-b border-[#D1CDC4] transition-all duration-500">
                <div class="flex items-center mb-3">
                    <button type="button" (click)="goBack()" class="mr-3 p-2 rounded-full hover:bg-black/5 transition-colors active:scale-90 duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div>
                        <h1 class="font-extrabold text-sm uppercase tracking-widest" 
                            [class.text-[#E07A5F]]="requestType() === 'food'"
                            [class.text-[#5D7A45]]="requestType() === 'waste'">
                            {{ requestType() === 'food' ? 'Request Makanan' : 'Cari Limbah' }}
                        </h1>
                        <p class="text-[10px] text-[#1B1B1B]/60 font-bold">{{ getStepTitle() }}</p>
                    </div>
                </div>

                <!-- PROGRESS BAR (Dynamic based on type) -->
                <div class="flex gap-2">
                    @for (step of getProgressSteps(); track $index) {
                        <div class="flex-1 flex flex-col gap-1">
                            <div class="h-1 rounded-full transition-all duration-500"
                                [class.bg-[#E07A5F]]="requestType() === 'food' && isStepActive($index)"
                                [class.bg-[#5D7A45]]="requestType() === 'waste' && isStepActive($index)"
                                [class.bg-[#D1CDC4]]="!isStepActive($index)">
                            </div>
                        </div>
                    }
                </div>
            </div>
        } @else if (currentStep() === 'type-select') {
            <div class="px-6 pt-8 pb-4">
                <h1 class="text-3xl font-extrabold text-[#1B1B1B] leading-tight">Buat<br><span class="text-[#BFA15F]">Permintaan</span> Baru.</h1>
                <p class="text-sm text-[#3D405B] mt-2 font-medium">Apa yang sedang Anda butuhkan atau kelola hari ini?</p>
            </div>
        }

        <div class="p-6">
            
            <!-- STEP 1: SELECT TYPE -->
            @if (currentStep() === 'type-select') {
              <div class="space-y-6 animate-slide-up">
                
                <!-- CARD 1: REQUEST FOOD -->
                <div (click)="selectType('food')" class="group relative bg-white rounded-[40px] p-1 shadow-sm border border-[#9CAF88]/30 hover:border-[#E07A5F] transition-all duration-300 cursor-pointer overflow-hidden btn-3d active:scale-[0.98]">
                  <div class="bg-[#FFF0F0] rounded-[36px] p-7 relative overflow-hidden">
                      <div class="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#E07A5F]/10 rounded-full blur-2xl"></div>
                      <div class="flex justify-between items-start relative z-10">
                        <div>
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-[#E07A5F]">🍽️</div>
                            <h3 class="text-xl font-extrabold text-[#1B1B1B] mb-1">Butuh Makanan</h3>
                            <p class="text-[#3D405B] text-[11px] mt-1 font-bold leading-relaxed max-w-[80%]">Ajukan permintaan donasi makanan untuk Panti/Komunitas.</p>
                        </div>
                        <div class="bg-white p-2 rounded-full shadow-sm group-hover:bg-[#E07A5F] group-hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                  </div>
                </div>

                <!-- CARD 2: MANAGE WASTE (MARKETPLACE) -->
                <div (click)="selectType('waste')" class="group relative bg-white rounded-[40px] p-1 shadow-sm border border-[#9CAF88]/30 hover:border-[#5D7A45] transition-all duration-300 cursor-pointer overflow-hidden btn-3d active:scale-[0.98]">
                   <div class="bg-[#F4F1DE] rounded-[36px] p-7 relative overflow-hidden">
                      <div class="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-[#98A869]/20 rounded-full blur-2xl"></div>
                      <div class="flex justify-between items-start relative z-10">
                        <div>
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-[#5D7A45]">♻️</div>
                            <h3 class="text-xl font-extrabold text-[#1B1B1B] mb-1">Cari Limbah</h3>
                            <p class="text-[#3D405B] text-[11px] mt-1 font-bold leading-relaxed max-w-[80%]">Lihat & ambil limbah organik tersedia di sekitar Anda.</p>
                        </div>
                        <div class="bg-white p-2 rounded-full shadow-sm group-hover:bg-[#5D7A45] group-hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            }

            <!-- =========================== -->
            <!-- FLOW 1: REQUEST FOOD (FORM) -->
            <!-- =========================== -->

            <!-- STEP 2: DETAILS FORM -->
            @if (currentStep() === 'details') {
                <div class="space-y-6 animate-slide-up">
                    <div class="bg-white p-6 rounded-[40px] space-y-6 border border-[#E07A5F]/30 shadow-sm">
                        <h2 class="text-xl font-bold text-[#1B1B1B]">Detail Kebutuhan</h2>

                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-wider ml-1 text-gray-500">Jenis</label>
                            <select [(ngModel)]="formData.category" class="w-full input-luxury px-5 py-4 appearance-none font-bold text-[#1B1B1B]">
                                <option value="rice">Nasi Kotak (Siap Santap)</option>
                                <option value="groceries">Sembako / Bahan Mentah</option>
                                <option value="snacks">Snack / Roti</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                           <label class="text-xs font-bold uppercase tracking-wider ml-1 text-gray-500">Jumlah Dibutuhkan</label>
                           <div class="flex gap-3">
                               <input type="number" [(ngModel)]="formData.quantity" class="flex-1 input-luxury px-5 py-4 font-bold" placeholder="0">
                               <div class="w-36 flex items-center justify-center bg-gray-100 rounded-2xl font-bold text-sm text-gray-600">Porsi/Paket</div>
                           </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-wider ml-1 text-gray-500">Catatan</label>
                            <textarea [(ngModel)]="formData.notes" rows="3" class="w-full input-luxury px-5 py-4 font-bold text-sm" placeholder="Contoh: Untuk makan siang anak asuh..."></textarea>
                        </div>
                    </div>

                    <button type="button" (click)="currentStep.set('evidence')" class="w-full btn-primary bg-[#E07A5F] border-[#E07A5F] text-white font-bold py-5 rounded-2xl mt-6 shadow-lg btn-3d active:scale-95 transition-all">
                      Lanjut ke Bukti
                    </button>
                </div>
            }

            <!-- STEP 3: EVIDENCE UPLOAD (FIXED: OVERLAY METHOD) -->
            @if (currentStep() === 'evidence') {
                <div class="space-y-6 animate-slide-up">
                    <div class="text-center">
                        <h2 class="text-xl font-bold text-[#1B1B1B] mb-2">Upload Foto Bukti</h2>
                        <p class="text-xs text-gray-500 px-4">Mohon unggah foto kondisi panti/gudang penyimpanan atau banner acara untuk validasi permintaan.</p>
                    </div>

                    <div class="w-full aspect-[4/3] bg-white rounded-[40px] border-2 border-dashed border-[#E07A5F]/40 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-[#FFF0F0] transition-colors">
                        
                        @if (evidenceImage()) {
                            <img [src]="evidenceImage()" class="w-full h-full object-cover pointer-events-none">
                            <button type="button" (click)="evidenceImage.set(null); $event.stopPropagation()" class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur hover:bg-red-500 transition-colors z-50">✕</button>
                        } @else {
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                                <div class="w-16 h-16 bg-[#FFF0F0] rounded-full flex items-center justify-center shadow-sm mb-3 text-3xl text-[#E07A5F]">📸</div>
                                <p class="text-sm font-bold text-[#1C1C1E]">Ketuk untuk ambil foto</p>
                            </div>
                            <!-- INPUT OVERLAY -->
                            <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 z-40 cursor-pointer" (change)="handleEvidenceFile($event)">
                        }
                    </div>

                    <button type="button" [disabled]="!evidenceImage()" (click)="currentStep.set('location')" class="w-full btn-primary bg-[#E07A5F] border-[#E07A5F] text-white font-bold py-5 rounded-2xl shadow-lg btn-3d active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none">
                      Lanjut ke Lokasi
                    </button>
                </div>
            }

            <!-- STEP 4: LOCATION -->
            @if (currentStep() === 'location') {
                <div class="space-y-6 animate-slide-up">
                    <div class="bg-white p-8 rounded-[40px] space-y-6 shadow-sm border border-[#E07A5F]/30">
                        <h3 class="font-bold text-xl text-[#1B1B1B]">Titik Penerimaan</h3>
                        <div class="relative w-full h-40 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group cursor-pointer">
                            <div class="absolute inset-0 opacity-60 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')] bg-cover bg-center filter grayscale group-hover:filter-none transition-all"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-10 h-10 bg-[#E07A5F] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-xl animate-bounce">📍</div>
                            </div>
                        </div>
                        <div class="space-y-2">
                             <label class="text-xs font-bold uppercase tracking-wider ml-1 text-gray-500">Alamat Lengkap</label>
                             <textarea rows="2" class="w-full input-luxury px-5 py-3 font-bold text-sm" placeholder="Jl. Mawar No. 12...">{{ user()?.recipientDetails?.address || 'Mataram, NTB' }}</textarea>
                        </div>
                    </div>
                    <button type="button" (click)="currentStep.set('summary')" class="w-full btn-primary bg-[#E07A5F] border-[#E07A5F] text-white font-bold py-5 rounded-2xl shadow-lg btn-3d active:scale-95 transition-all">
                      Tinjau Permintaan
                    </button>
                </div>
            }

            <!-- STEP 5: SUMMARY -->
            @if (currentStep() === 'summary') {
                <div class="space-y-6 animate-slide-up">
                    <div class="bg-white rounded-[40px] overflow-hidden shadow-xl border border-[#D1CDC4]">
                        <div class="p-8 text-center bg-[#FFF0F0] border-b border-[#E07A5F]/20">
                            <h3 class="font-bold text-2xl text-[#1B1B1B] mb-2">Konfirmasi</h3>
                            <p class="text-sm text-gray-500">Pastikan data permintaan Anda benar.</p>
                        </div>
                        <div class="p-6 space-y-4">
                            <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span class="text-xs text-gray-500 font-bold">Kategori</span>
                                <span class="text-sm font-bold uppercase">{{ formData.category }}</span>
                            </div>
                            <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span class="text-xs text-gray-500 font-bold">Jumlah</span>
                                <span class="text-sm font-bold">{{ formData.quantity }} Porsi</span>
                            </div>
                            <div class="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                                <p class="text-[10px] text-yellow-800 leading-relaxed font-medium">
                                    Permintaan ini akan muncul di peta donatur. Relawan akan menghubungi Anda jika ada donasi yang cocok.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button type="button" (click)="currentStep.set('success')" class="w-full btn-primary bg-[#E07A5F] border-[#E07A5F] text-white font-bold py-5 rounded-2xl mt-2 shadow-lg btn-3d active:scale-95 flex items-center justify-center gap-2">
                      <span>🚀</span> Terbitkan Permintaan
                    </button>
                </div>
            }

            <!-- =========================== -->
            <!-- FLOW 2: WASTE MARKETPLACE -->
            <!-- =========================== -->

            <!-- STEP: MARKETPLACE LIST -->
            @if (currentStep() === 'marketplace') {
                <div class="animate-slide-up space-y-4">
                    <h2 class="text-xl font-bold text-[#1B1B1B] px-2">Limbah Tersedia (4)</h2>
                    
                    @for (item of wasteList; track item.id) {
                        <div (click)="selectWasteItem(item)" class="bg-white rounded-[28px] p-4 shadow-sm border border-gray-200 flex gap-4 cursor-pointer hover:border-[#5D7A45] hover:shadow-md transition-all active:scale-[0.98]">
                            <div class="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                <img [src]="item.image" class="w-full h-full object-cover">
                                <div class="absolute bottom-0 left-0 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-tr-lg font-bold">{{ item.distance }}</div>
                            </div>
                            <div class="flex-1 flex flex-col justify-center">
                                <div class="flex justify-between items-start mb-1">
                                    <span class="bg-[#5D7A45]/10 text-[#5D7A45] px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">{{ item.type }}</span>
                                    <span class="text-[10px] text-gray-400 font-bold">{{ item.time }}</span>
                                </div>
                                <h3 class="font-bold text-[#1C1C1E] text-sm leading-tight mb-1">{{ item.title }}</h3>
                                <p class="text-xs text-gray-500 mb-2">{{ item.location }}</p>
                                <div class="flex items-center gap-2 mt-auto">
                                    <img [src]="item.avatar" class="w-5 h-5 rounded-full">
                                    <span class="text-[10px] font-bold text-gray-600">{{ item.user }}</span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }

            <!-- STEP: CONFIRM PICKUP (For Waste) -->
            @if (currentStep() === 'confirm_pickup') {
                <div class="animate-slide-up space-y-6">
                    <div class="bg-white rounded-[40px] overflow-hidden shadow-xl border border-[#5D7A45]">
                        <div class="relative h-48">
                            <img [src]="selectedWaste?.image" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                <div>
                                    <h2 class="text-xl font-bold text-white leading-tight">{{ selectedWaste?.title }}</h2>
                                    <p class="text-white/80 text-xs mt-1">{{ selectedWaste?.location }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="bg-[#F4F1DE] p-4 rounded-2xl border border-[#5D7A45]/20 mb-6">
                                <h4 class="font-bold text-[#5D7A45] text-xs uppercase tracking-widest mb-2">Detail Limbah</h4>
                                <ul class="space-y-2 text-sm text-[#3D405B] font-medium">
                                    <li class="flex justify-between border-b border-[#5D7A45]/10 pb-1"><span>Berat:</span> <span>{{ selectedWaste?.weight }}</span></li>
                                    <li class="flex justify-between border-b border-[#5D7A45]/10 pb-1"><span>Kondisi:</span> <span>Segar (Hari ini)</span></li>
                                    <li class="flex justify-between pt-1"><span>Pemberi:</span> <span>{{ selectedWaste?.user }}</span></li>
                                </ul>
                            </div>
                            
                            <p class="text-xs text-center text-gray-500 mb-4">Dengan menekan tombol, Anda berkomitmen menjemput limbah ini.</p>
                            
                            <button type="button" (click)="currentStep.set('success')" class="w-full btn-primary bg-[#5D7A45] border-[#5D7A45] text-white font-bold py-4 rounded-2xl shadow-lg btn-3d active:scale-95 flex items-center justify-center gap-2">
                                <span>🚚</span> Konfirmasi Jemput
                            </button>
                            <button type="button" (click)="currentStep.set('marketplace')" class="w-full mt-3 py-3 text-gray-400 text-xs font-bold hover:text-[#1C1C1E]">Batal</button>
                        </div>
                    </div>
                </div>
            }

            <!-- SUCCESS (Shared) -->
            @if (currentStep() === 'success') {
                <div class="flex flex-col items-center justify-center pt-10 animate-fade-in text-center px-6">
                    <div class="w-40 h-40 bg-[#E0F2F1] rounded-full flex items-center justify-center text-6xl mb-6 shadow-inner animate-bounce">
                        🎉
                    </div>
                    <h2 class="text-3xl font-extrabold text-[#1B1B1B] mb-4">Berhasil!</h2>
                    <p class="text-[#3D405B] mb-8 leading-relaxed max-w-xs mx-auto text-sm">
                        {{ requestType() === 'food' ? 'Permintaan Anda telah tayang. Relawan akan segera menghubungi.' : 'Konfirmasi berhasil. Silahkan menuju lokasi penjemputan.' }}
                    </p>
                    <button type="button" (click)="finish()" class="w-full btn-primary py-4 rounded-2xl font-bold shadow-lg">
                        Kembali ke Beranda
                    </button>
                </div>
            }

        </div>
    </div>
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1); }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class RecipientWizardComponent {
  stateService = inject(StateService);
  user = this.stateService.currentUser;

  currentStep = signal<RecipientStep>('type-select');
  requestType = signal<'food' | 'waste'>('food');
  evidenceImage = signal<string | null>(null);

  // Form Data for Food Request
  formData = {
      category: 'rice',
      quantity: '',
      notes: ''
  };

  // Marketplace Data for Waste
  wasteList = [
      { id: 1, title: 'Kulit Pisang & Sayur', weight: '5 Kg', type: 'Organik', distance: '0.5 km', location: 'Warung Bu Siti', time: 'Baru saja', image: 'https://cdn.idntimes.com/content-images/community/2020/12/vegetable-peels-683412-1920-552d6a78222938090740924976783d2d_600x400.jpg', user: 'Bu Siti', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
      { id: 2, title: 'Nasi Sisa Hajatan', weight: '1 Karung', type: 'Nasi Basi', distance: '1.2 km', location: 'Rumah Pak RT', time: '1 jam lalu', image: 'https://asset.kompas.com/crops/UiuDBG_L3N5GTPUrmHk3zCfQNhg=/0x120:1440x1080/750x500/data/photo/2023/04/05/642d8cb6a4b8a.png', user: 'Pak RT', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RT' },
      { id: 3, title: 'Ampas Kopi', weight: '2 Kg', type: 'Ampas', distance: '2.5 km', location: 'Kopi Kenangan Mantan', time: '3 jam lalu', image: 'https://awsimages.detik.net.id/community/media/visual/2022/06/16/ilustrasi-ampas-kopi-1.jpeg?w=1200', user: 'Barista', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coffee' },
      { id: 4, title: 'Daun Kering Kebun', weight: '3 Karung', type: 'Daun', distance: '3.0 km', location: 'Taman Kota', time: '5 jam lalu', image: 'https://assets.kompasiana.com/items/album/2020/10/22/sampah-daun-kering-5f910408d541df473d207c72.jpg?t=o&v=770', user: 'Dinas', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dinas' },
  ];
  selectedWaste: any = null;

  selectType(type: 'food' | 'waste') {
      this.requestType.set(type);
      if (type === 'food') {
          this.formData.category = 'rice';
          this.currentStep.set('details');
      } else {
          this.currentStep.set('marketplace');
      }
  }

  // --- Food Request Logic ---
  handleEvidenceFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.evidenceImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Waste Marketplace Logic ---
  selectWasteItem(item: any) {
      this.selectedWaste = item;
      this.currentStep.set('confirm_pickup');
  }

  // --- Nav Logic ---
  getStepTitle() {
      const titles: Record<string, string> = {
          'type-select': 'Pilih Jenis',
          'details': 'Isi Rincian',
          'evidence': 'Upload Bukti',
          'location': 'Lokasi',
          'summary': 'Tinjauan',
          'marketplace': 'Pilih Limbah',
          'confirm_pickup': 'Konfirmasi',
          'success': 'Selesai'
      };
      return titles[this.currentStep()] || '';
  }

  // Helper for Food Progress bar (steps 0-4)
  getProgressSteps() {
      if (this.requestType() === 'food') return [1,2,3,4,5]; // 5 steps
      return [1,2]; // Waste has fewer visible steps in wizard
  }

  isStepActive(index: number): boolean {
      if (this.requestType() === 'food') {
          const steps = ['type-select', 'details', 'evidence', 'location', 'summary'];
          return index <= steps.indexOf(this.currentStep());
      } else {
          const steps = ['type-select', 'marketplace', 'confirm_pickup'];
          return index <= steps.indexOf(this.currentStep());
      }
  }

  goBack() {
      const foodMap: Record<string, RecipientStep> = {
          'details': 'type-select',
          'evidence': 'details',
          'location': 'evidence',
          'summary': 'location',
          'success': 'type-select'
      };
      const wasteMap: Record<string, RecipientStep> = {
          'marketplace': 'type-select',
          'confirm_pickup': 'marketplace',
          'success': 'type-select'
      };
      
      const map = this.requestType() === 'food' ? foodMap : wasteMap;
      if (map[this.currentStep()]) {
          this.currentStep.set(map[this.currentStep()]);
      } else {
          this.currentStep.set('type-select');
      }
  }

  finish() {
      this.stateService.navigateToTab('home');
  }
}

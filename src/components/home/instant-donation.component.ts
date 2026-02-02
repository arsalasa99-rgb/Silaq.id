
import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-instant-donation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 relative overflow-hidden">
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-40 h-40 bg-[#E07A5F]/5 rounded-bl-[100px] pointer-events-none"></div>
        
        <div class="relative z-10 space-y-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-extrabold text-[#1B1B1B]">Bagi Makanan Kecil</h3>
                    <p class="text-[11px] text-[#636366] font-medium mt-1">Maksimal 25 porsi. Dijemput relawan terdekat.</p>
                </div>
                <div class="w-10 h-10 bg-[#E07A5F]/10 rounded-full flex items-center justify-center text-xl text-[#E07A5F]">⚡</div>
            </div>

            <!-- Input Fields -->
            <div class="grid grid-cols-2 gap-3">
                <div class="col-span-2">
                     <label class="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Apa yang didonasikan?</label>
                     <input type="text" [(ngModel)]="instantForm.item" placeholder="Contoh: 5 Nasi Bungkus" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1C1C1E] focus:outline-none focus:border-[#E07A5F] focus:bg-white transition-all">
                </div>

                <div>
                    <label class="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jumlah</label>
                    <div class="flex items-center bg-gray-50 rounded-xl border border-gray-200 px-2">
                        <button (click)="adjustQty(-1)" class="w-8 h-10 flex items-center justify-center text-gray-500 font-bold hover:text-[#E07A5F] active:scale-90 transition-transform">-</button>
                        <input type="number" [(ngModel)]="instantForm.quantity" class="w-full bg-transparent text-center font-bold text-[#1C1C1E] outline-none h-10" readonly>
                        <button (click)="adjustQty(1)" class="w-8 h-10 flex items-center justify-center text-gray-500 font-bold hover:text-[#E07A5F] active:scale-90 transition-transform">+</button>
                    </div>
                </div>

                <div>
                    <label class="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Penerima</label>
                    <select [(ngModel)]="instantForm.targetRecipient" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-sm font-bold text-[#1C1C1E] focus:outline-none focus:border-[#E07A5F] h-[46px]">
                        <option value="Siapapun">Siapapun</option>
                        <option value="Masjid Terdekat">Masjid Terdekat</option>
                        <option value="Panti Asuhan">Panti Asuhan</option>
                        <option value="Tetangga">Tetangga</option>
                        <option value="Orang Jalanan">Orang Jalanan</option>
                    </select>
                </div>
            </div>
            
            <div>
                 <label class="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lokasi Jemput</label>
                 <div class="flex items-center gap-2">
                     <div class="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                         <span class="mr-2 text-gray-400">📍</span>
                         <input type="text" [(ngModel)]="instantForm.pickupLocation" placeholder="Lokasi Anda saat ini..." class="w-full bg-transparent outline-none text-sm font-bold text-[#1C1C1E]">
                     </div>
                     <button (click)="onOpenMap.emit()" class="px-4 py-3 bg-[#E07A5F]/10 text-[#E07A5F] rounded-xl border border-[#E07A5F]/20 hover:bg-[#E07A5F] hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                     </button>
                 </div>
            </div>

            <!-- Action Button -->
            <button (click)="start()" class="w-full bg-[#1C1C1E] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2 btn-3d active:scale-95">
                <span class="animate-pulse">📡</span> Panggil Relawan Sekarang
            </button>
            
            @if (instantForm.quantity >= 25) {
                <p class="text-[10px] text-[#C04E35] font-bold text-center bg-[#FFF0F0] py-2 rounded-lg border border-[#C04E35]/20">
                    Untuk jumlah > 25, Anda akan dialihkan ke form donasi lengkap.
                </p>
            }
        </div>
    </div>
  `
})
export class InstantDonationComponent {
  stateService = inject(StateService);
  
  // Outputs
  onStartSimulation = output<any>();
  onOpenMap = output<void>();

  // Input to update location from parent if map picked
  externalLocation = input<string | undefined>(undefined);

  instantForm = {
      item: '',
      quantity: 1,
      targetRecipient: 'Siapapun',
      pickupLocation: ''
  };

  constructor() {
    effect(() => {
        const val = this.externalLocation();
        if(val) this.instantForm.pickupLocation = val;
    });
  }

  adjustQty(delta: number) {
      const newQty = this.instantForm.quantity + delta;
      if (newQty > 0) this.instantForm.quantity = newQty;
  }

  start() {
      // 1. Validation
      if (!this.instantForm.item) {
          alert('Mohon isi nama barang donasi (misal: Nasi Bungkus).');
          return;
      }

      // 2. Redirect logic for large quantities
      if (this.instantForm.quantity >= 25) {
          if(confirm('Jumlah donasi cukup besar (> 25). Kami sarankan menggunakan fitur Donasi Lengkap agar data lebih terperinci. Lanjutkan ke Donasi Lengkap?')) {
              this.stateService.navigateToTab('donate');
          }
          return;
      }

      // 3. Emit start event to parent (who will show the tracking overlay)
      this.onStartSimulation.emit({...this.instantForm});
  }

  reset() {
      this.instantForm = { item: '', quantity: 1, targetRecipient: 'Siapapun', pickupLocation: '' };
  }
}
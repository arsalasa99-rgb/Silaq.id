
import { Component, signal, input, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracking-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
        <div class="bg-[#F5F5F5] rounded-t-[40px] h-[90vh] w-full flex flex-col relative overflow-hidden animate-slide-up-sheet shadow-2xl">
            
            <!-- Map Background (Simulated) -->
            <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                 style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png'); background-size: cover; filter: grayscale(100%);">
            </div>
            <div class="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-white/80 to-[#F5F5F5]"></div>

            <!-- Close Button -->
            <button (click)="closeTracking()" class="absolute top-6 right-6 z-20 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500 hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <!-- CONTENT CONTAINER (Scrollable) -->
            <div class="relative z-10 flex-1 flex flex-col px-8 pt-12 pb-24 overflow-y-auto overscroll-contain">
                
                <!-- Header Status -->
                <div class="text-center mb-6 flex-shrink-0">
                    <span class="inline-block px-4 py-1.5 rounded-full bg-[#BFA15F]/10 text-[#BFA15F] text-[10px] font-bold uppercase tracking-widest border border-[#BFA15F]/20 mb-3 shadow-sm">
                        Live Monitor
                    </span>
                    <h2 class="text-2xl font-extrabold text-[#1C1C1E] animate-pulse">
                        @switch(trackingState()) {
                            @case('searching') { Mencari Relawan... }
                            @case('found') { Relawan Ditemukan! }
                            @case('pickup') { Menuju Lokasi Anda }
                            @case('otw') { Mengantar Donasi }
                            @case('done') { Donasi Selesai }
                        }
                    </h2>
                    <p class="text-xs text-gray-500 font-medium mt-1">ID: #INSTANT-{{ requestData().quantity }}-{{ requestData().item.substring(0,3).toUpperCase() }}</p>
                </div>

                <!-- STATE 1: SEARCHING (RADAR) -->
                @if (trackingState() === 'searching') {
                    <div class="flex-1 flex items-center justify-center py-10 min-h-[300px]">
                        <div class="relative w-48 h-48 flex items-center justify-center">
                            <div class="absolute inset-0 bg-[#BFA15F] rounded-full opacity-20 animate-ping"></div>
                            <div class="absolute inset-4 bg-[#BFA15F] rounded-full opacity-30 animate-ping" style="animation-delay: 0.5s"></div>
                            <div class="relative z-10 w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-4xl border-4 border-[#BFA15F]">
                                📡
                            </div>
                        </div>
                    </div>
                    <p class="text-center text-gray-500 text-sm pb-10">Menghubungkan dengan relawan Silaq terdekat...</p>
                }

                <!-- STATE 2, 3, 4: ACTIVE & DONE -->
                @if (trackingState() !== 'searching') {
                    
                    <!-- Volunteer Card -->
                    <div class="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 flex items-center gap-5 mb-6 animate-scale-in relative overflow-hidden flex-shrink-0">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" class="w-16 h-16 rounded-full object-cover border-2 border-[#BFA15F]">
                            <div class="absolute bottom-0 right-0 bg-[#BFA15F] text-white text-[8px] px-1.5 py-0.5 rounded-full border border-white font-bold">4.9★</div>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-bold text-lg text-[#1C1C1E]">Rian Pratama</h3>
                            <p class="text-xs text-gray-500 font-medium mb-2">Relawan Silaq • Honda Beat (DR 4521 KA)</p>
                            <div class="flex gap-2">
                                <a href="tel:08123456789" class="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-green-200 transition-colors active:scale-95">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    Telepon
                                </a>
                                <button (click)="toggleDriverChat()" class="bg-[#1C1C1E] text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-gray-800 transition-colors active:scale-95">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    Chat
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- DRIVER CHAT OVERLAY -->
                    @if (showDriverChat()) {
                        <div class="bg-white rounded-[24px] shadow-lg border border-gray-200 p-4 mb-4 animate-scale-in flex-shrink-0">
                            <div class="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                                <span class="text-xs font-bold">Chat Relawan</span>
                                <button (click)="toggleDriverChat()" class="text-gray-400">✕</button>
                            </div>
                            <div class="h-32 overflow-y-auto space-y-2 mb-3 bg-gray-50 p-2 rounded-xl">
                                @for (msg of driverMessages(); track $index) {
                                    <div class="flex" [class.justify-end]="msg.isMe">
                                        <div class="max-w-[80%] px-3 py-1.5 rounded-xl text-[10px] font-medium" 
                                             [class.bg-[#BFA15F]]="msg.isMe" 
                                             [class.text-white]="msg.isMe"
                                             [class.bg-white]="!msg.isMe"
                                             [class.border]="!msg.isMe"
                                             [class.border-gray-200]="!msg.isMe">
                                            {{ msg.text }}
                                        </div>
                                    </div>
                                }
                            </div>
                            <div class="flex gap-2">
                                <input type="text" [(ngModel)]="chatInput" placeholder="Ketik pesan..." class="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs outline-none">
                                <button (click)="sendDriverMessage()" class="bg-[#BFA15F] text-white p-2 rounded-lg">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                </button>
                            </div>
                        </div>
                    }

                    <!-- Timeline Visualization (Hidden if Done to show Proof) -->
                    @if (trackingState() !== 'done') {
                        <div class="bg-white/60 rounded-[32px] p-6 border border-white relative mb-4 flex-shrink-0">
                            <!-- Line -->
                            <div class="absolute left-10 top-10 bottom-10 w-0.5 bg-gray-200"></div>
                            <div class="absolute left-10 top-10 w-0.5 bg-[#BFA15F] transition-all duration-[2000ms] ease-linear" 
                                 [style.height.%]="trackingProgress()"></div>

                            <!-- Step 1: Pickup -->
                            <div class="relative flex items-center gap-4 mb-8 group">
                                <div class="w-8 h-8 rounded-full z-10 flex items-center justify-center border-2 bg-white transition-colors duration-500"
                                     [class.border-[#BFA15F]]="trackingState() !== 'searching'"
                                     [class.text-[#BFA15F]]="trackingState() !== 'searching'">
                                    🏠
                                </div>
                                <div [class.opacity-50]="trackingState() === 'found'">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titik Jemput</p>
                                    <p class="font-bold text-[#1C1C1E] text-sm">{{ requestData().pickupLocation || 'Lokasi Anda' }}</p>
                                </div>
                            </div>

                            <!-- Step 2: On The Way -->
                            <div class="relative flex items-center gap-4 mb-8 group">
                                 <div class="w-8 h-8 rounded-full z-10 flex items-center justify-center border-2 transition-colors duration-500 bg-white"
                                     [class.border-[#BFA15F]]="['otw', 'done'].includes(trackingState())"
                                     [class.border-gray-200]="!['otw', 'done'].includes(trackingState())">
                                    🛵
                                </div>
                                <div [class.opacity-50]="!['otw', 'done'].includes(trackingState())">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <p class="font-bold text-[#1C1C1E] text-sm">
                                        {{ trackingState() === 'otw' ? 'Sedang menuju lokasi target...' : (trackingState() === 'done' ? 'Telah sampai' : 'Menunggu pickup') }}
                                    </p>
                                </div>
                            </div>

                            <!-- Step 3: Destination -->
                            <div class="relative flex items-center gap-4 group">
                                 <div class="w-8 h-8 rounded-full z-10 flex items-center justify-center border-2 transition-colors duration-500 bg-white"
                                     [class.border-[#5D7A45]]="trackingState() === 'done'"
                                     [class.text-[#5D7A45]]="trackingState() === 'done'"
                                     [class.border-gray-200]="trackingState() !== 'done'">
                                    📍
                                </div>
                                <div [class.opacity-50]="trackingState() !== 'done'">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tujuan</p>
                                    <p class="font-bold text-[#1C1C1E] text-sm">{{ requestData().targetRecipient }}</p>
                                </div>
                            </div>
                        </div>
                    }

                    <!-- Proof Photo (Only when DONE) -->
                    @if (trackingState() === 'done') {
                        <div class="bg-white p-5 rounded-[32px] shadow-lg animate-scale-in border border-green-100 relative overflow-hidden flex-shrink-0">
                            <div class="absolute top-0 right-0 bg-[#5D7A45] text-white text-[9px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">Laporan Selesai</div>
                            
                            <h3 class="font-bold text-lg text-[#1C1C1E] mb-4">Bukti Penyerahan</h3>
                            
                            <div class="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden relative shadow-inner mb-4">
                                <img [src]="selectedProofImage()" class="w-full h-full object-cover">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                    <div class="flex items-center gap-2 text-white mb-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                        <p class="text-xs font-medium">{{ requestData().targetRecipient }}</p>
                                    </div>
                                    <p class="text-white/80 text-[10px]">{{ completionTime() }}</p>
                                </div>
                            </div>
                            
                            <div class="bg-green-50 rounded-xl p-3 border border-green-100 mb-4">
                                <p class="text-[11px] text-[#5D7A45] font-medium leading-relaxed">
                                    "Alhamdulillah, donasi telah diterima dengan baik oleh pengurus setempat. Terima kasih orang baik!"
                                </p>
                            </div>

                            <button (click)="closeTracking()" class="w-full bg-[#5D7A45] text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform btn-3d">
                                Selesai & Beri Rating
                            </button>
                        </div>
                    }
                }

            </div>
        </div>
    </div>
  `,
  styles: [`
    .animate-slide-up-sheet { animation: slideUpSheet 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    
    @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class TrackingSimulationComponent implements OnInit, OnDestroy {
  // Input the form data from parent
  requestData = input.required<any>();
  onClose = output<void>();

  // Internal State
  trackingState = signal<'idle' | 'searching' | 'found' | 'pickup' | 'otw' | 'done'>('searching');
  trackingProgress = signal(0);
  completionTime = signal('');
  
  // Custom Proof Images
  proofImages = [
      'https://wiz.or.id/wp-content/uploads/2022/05/Berbagi-Sedekah-di-Pagi-Hari-untuk-Pahlawan-Keluarga-di-Jalanan.jpeg',
      'https://dsh.co.id/wp-content/uploads/2015/06/tebar-takjil.jpg',
      'https://cdn1-production-images-kly.akamaized.net/5cZVa5CzUwO8A8glLm8Z2c3rA0w=/1231x710/smart/filters:quality(75):strip_icc():format(jpeg)/kly-media-production/medias/4389538/original/036224500_1681126473-Anak-Anak-Berbagi-Takjil-saat-Ramadhan-merdeka-3.jpg',
      'https://rmol.id/images/berita/normal/2022/09/556490_04170910092022_BerkAH_.jpg',
      'https://www.dompetdhuafa.org/wp-content/uploads/2024/10/Shopee-Berbagi-Makanan_4.jpg',
      'https://www.kadamchoeling.or.id/wp-content/uploads/2016/06/BagiNasiBungkus1.jpg',
      'https://wiz.or.id/wp-content/uploads/2023/07/Jumat-Berkah-Berbagi-Makanan-Gratis.jpeg'
  ];
  selectedProofImage = signal('');

  // Driver Chat State
  showDriverChat = signal(false);
  driverMessages = signal<{text: string, isMe: boolean}[]>([
      {text: 'Halo kak, saya menuju titik jemput ya.', isMe: false}
  ]);
  chatInput = '';
  
  timers: any[] = [];

  ngOnInit() {
      // Pick random proof image
      const randomIdx = Math.floor(Math.random() * this.proofImages.length);
      this.selectedProofImage.set(this.proofImages[randomIdx]);
      
      this.startSimulation();
  }

  ngOnDestroy() {
      this.timers.forEach(t => clearTimeout(t));
  }

  startSimulation() {
      // 0s: Searching (Default)
      
      // 2.5s: Found Volunteer
      this.timers.push(setTimeout(() => {
          this.trackingState.set('found');
          this.trackingProgress.set(10);
      }, 2500));

      // 5s: Pickup
      this.timers.push(setTimeout(() => {
          this.trackingState.set('pickup');
          this.trackingProgress.set(30);
      }, 5000));

      // 8s: OTW
      this.timers.push(setTimeout(() => {
          this.trackingState.set('otw');
          this.trackingProgress.set(60);
      }, 8000));

      // 12s: Done
      this.timers.push(setTimeout(() => {
          this.trackingState.set('done');
          this.trackingProgress.set(100);
          this.completionTime.set(new Date().toLocaleString('id-ID'));
      }, 12000));
  }

  toggleDriverChat() {
      this.showDriverChat.update(v => !v);
  }

  sendDriverMessage() {
      if(!this.chatInput) return;
      this.driverMessages.update(m => [...m, {text: this.chatInput, isMe: true}]);
      this.chatInput = '';
      
      this.timers.push(setTimeout(() => {
         this.driverMessages.update(m => [...m, {text: 'Siap kak, terima kasih infonya.', isMe: false}]);
      }, 2000));
  }

  closeTracking() {
      this.onClose.emit();
  }
}

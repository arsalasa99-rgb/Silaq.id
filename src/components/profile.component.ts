import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';
import { FormsModule } from '@angular/forms';

type ProfileView = 'main' | 'address' | 'notifications' | 'security' | 'help';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-32 pt-16 bg-[#E6DDC5] min-h-screen relative overflow-hidden">
        
        <!-- MAIN PROFILE VIEW -->
        @if (currentView() === 'main') {
            <div class="animate-slide-in-left h-full">
                <!-- Profile Header -->
                <div class="flex flex-col items-center mb-10 px-6">
                    <div class="relative group cursor-pointer">
                        <div class="absolute inset-0 bg-[#C04E35] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        @if (stateService.currentUser()) {
                            <img [src]="stateService.currentUser()?.avatar" class="relative w-32 h-32 rounded-full border-[4px] border-white shadow-xl mb-5 object-cover">
                        } @else {
                            <div class="relative w-32 h-32 rounded-full border-[4px] border-white shadow-xl mb-5 bg-gray-200 flex items-center justify-center text-4xl">👤</div>
                        }
                        <button class="absolute bottom-2 right-0 bg-[#C04E35] text-white p-2.5 rounded-full border-[4px] border-white shadow-md hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                    </div>
                    <h2 class="text-3xl font-extrabold text-[#1C1C1E]">{{ stateService.currentUser()?.name || 'Tamu' }}</h2>
                    <div class="mt-3 flex items-center gap-2">
                        <span class="bg-white/50 text-[#C04E35] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#C04E35]/20">{{ stateService.currentUser()?.type || 'Guest' }}</span>
                        <!-- Gold Accent used for Membership -->
                        <span class="bg-[#D98C36]/20 text-[#1C1C1E] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#D98C36]/20">Gold Member</span>
                    </div>
                </div>

                <!-- Menu List -->
                <div class="px-6 space-y-6">
                    <!-- Section 1 -->
                    <div>
                        <h3 class="text-xs font-bold text-[#1C1C1E]/60 uppercase tracking-widest mb-4 ml-4">Pengaturan</h3>
                        <div class="glass-panel rounded-[32px] overflow-hidden bg-white/60 border border-white/50">
                            <button (click)="currentView.set('address')" class="w-full flex items-center justify-between p-5 hover:bg-white/50 border-b border-gray-200 transition-colors group">
                                <div class="flex items-center gap-5">
                                    <div class="p-3 bg-[#FFF0F0] text-[#C04E35] rounded-2xl group-hover:scale-110 transition-transform">📍</div>
                                    <span class="text-sm font-bold text-[#1C1C1E]">Alamat Saya</span>
                                </div>
                                <span class="text-gray-400 font-bold text-xl group-hover:text-[#C04E35] group-hover:translate-x-1 transition-all">›</span>
                            </button>
                            <button (click)="currentView.set('notifications')" class="w-full flex items-center justify-between p-5 hover:bg-white/50 border-b border-gray-200 transition-colors group">
                                <div class="flex items-center gap-5">
                                    <div class="p-3 bg-[#FFFDD0] text-[#3A3A3C] rounded-2xl group-hover:scale-110 transition-transform">🔔</div>
                                    <span class="text-sm font-bold text-[#1C1C1E]">Notifikasi</span>
                                </div>
                                <span class="text-gray-400 font-bold text-xl group-hover:text-[#C04E35] group-hover:translate-x-1 transition-all">›</span>
                            </button>
                            <button (click)="currentView.set('security')" class="w-full flex items-center justify-between p-5 hover:bg-white/50 transition-colors group">
                                <div class="flex items-center gap-5">
                                    <div class="p-3 bg-[#FFF0F0] text-[#C04E35] rounded-2xl group-hover:scale-110 transition-transform">🛡️</div>
                                    <span class="text-sm font-bold text-[#1C1C1E]">Keamanan</span>
                                </div>
                                <span class="text-gray-400 font-bold text-xl group-hover:text-[#C04E35] group-hover:translate-x-1 transition-all">›</span>
                            </button>
                        </div>
                    </div>

                    <!-- Section 2: Help & Info -->
                    <div>
                        <h3 class="text-xs font-bold text-[#1C1C1E]/60 uppercase tracking-widest mb-4 ml-4">Lainnya</h3>
                        <div class="glass-panel rounded-[32px] overflow-hidden bg-white/60 border border-white/50">
                            <button (click)="currentView.set('help')" class="w-full flex items-center justify-between p-5 hover:bg-white/50 transition-colors group">
                                <div class="flex items-center gap-5">
                                    <div class="p-3 bg-[#D98C36]/20 text-[#D98C36] rounded-2xl group-hover:scale-110 transition-transform">💡</div>
                                    <span class="text-sm font-bold text-[#1C1C1E]">Bantuan</span>
                                </div>
                                <span class="text-gray-400 font-bold text-xl group-hover:text-[#C04E35] group-hover:translate-x-1 transition-all">›</span>
                            </button>
                        </div>
                    </div>

                    <!-- Logout -->
                    <button (click)="stateService.logout()" class="w-full glass-panel text-[#9E2A2B] font-bold py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-red-50 transition-all active:scale-95 btn-3d mt-8 border-white/50 bg-white/70">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Keluar
                    </button>
                    
                    <p class="text-center text-[10px] text-[#1C1C1E]/60 font-bold uppercase tracking-widest mt-6">Silaq v4.4 (Earthy Batik)</p>
                </div>
            </div>
        }

        <!-- SUB-VIEWS -->
        @if (currentView() !== 'main') {
            <div class="fixed inset-0 bg-[#E6DDC5] z-50 flex flex-col animate-slide-in-right overflow-y-auto">
                <!-- SUB-HEADER -->
                <div class="px-6 pt-12 pb-4 bg-[#E6DDC5]/95 backdrop-blur-md sticky top-0 z-10 flex items-center gap-4 shadow-sm border-b border-[#D1CDC4]">
                    <button (click)="currentView.set('main')" class="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
                        <svg class="w-6 h-6 text-[#1C1C1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <h2 class="text-xl font-extrabold text-[#1C1C1E]">
                        @switch (currentView()) {
                            @case ('address') { Alamat Saya }
                            @case ('notifications') { Notifikasi }
                            @case ('security') { Keamanan }
                            @case ('help') { Pusat Bantuan }
                        }
                    </h2>
                </div>

                <!-- CONTENT AREA -->
                <div class="p-6 pb-32 space-y-6">
                    
                    <!-- 1. ADDRESS VIEW -->
                    @if (currentView() === 'address') {
                        @for (addr of addresses(); track $index) {
                            <div class="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
                                @if (addr.isPrimary) {
                                    <div class="absolute top-0 right-0 bg-[#C04E35] text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Utama</div>
                                }
                                <div class="flex gap-4 items-start">
                                    <div class="w-10 h-10 rounded-full bg-[#FFF0F0] text-[#C04E35] flex items-center justify-center text-xl shrink-0">
                                        {{ $index === 0 ? '🏠' : '🏢' }}
                                    </div>
                                    <div class="flex-1">
                                        <h3 class="font-bold text-[#1C1C1E] text-sm mb-1">{{ addr.label }}</h3>
                                        <p class="text-xs text-gray-500 font-medium leading-relaxed mb-3">{{ addr.detail }}</p>
                                        <div class="flex gap-3">
                                            <button class="text-[10px] font-bold text-[#C04E35] bg-[#C04E35]/10 px-3 py-1.5 rounded-lg hover:bg-[#C04E35] hover:text-white transition-colors">Edit</button>
                                            @if (!addr.isPrimary) {
                                                <button (click)="setPrimaryAddress($index)" class="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Jadikan Utama</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        <button class="w-full border-2 border-dashed border-[#C04E35]/30 rounded-[24px] py-4 text-[#C04E35] font-bold text-sm hover:bg-[#C04E35]/5 transition-colors flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Tambah Alamat Baru
                        </button>
                    }

                    <!-- 2. NOTIFICATIONS VIEW -->
                    @if (currentView() === 'notifications') {
                         <div class="bg-white rounded-[32px] overflow-hidden border border-gray-100">
                             <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                                 <div>
                                     <h3 class="font-bold text-[#1C1C1E] text-sm">Chat & Diskusi</h3>
                                     <p class="text-[10px] text-gray-400">Pesan masuk dari komunitas & ahli.</p>
                                 </div>
                                 <div class="relative inline-block w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer" 
                                      [class.bg-[#C04E35]]="notifications().chat" [class.bg-gray-200]="!notifications().chat"
                                      (click)="toggleNotify('chat')">
                                     <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                          [class.translate-x-6]="notifications().chat"></div>
                                 </div>
                             </div>
                             <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                                 <div>
                                     <h3 class="font-bold text-[#1C1C1E] text-sm">Promo & Event</h3>
                                     <p class="text-[10px] text-gray-400">Info terbaru seputar donasi & event.</p>
                                 </div>
                                 <div class="relative inline-block w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer" 
                                      [class.bg-[#C04E35]]="notifications().promo" [class.bg-gray-200]="!notifications().promo"
                                      (click)="toggleNotify('promo')">
                                     <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                          [class.translate-x-6]="notifications().promo"></div>
                                 </div>
                             </div>
                             <div class="p-5 flex items-center justify-between">
                                 <div>
                                     <h3 class="font-bold text-[#1C1C1E] text-sm">Status Transaksi</h3>
                                     <p class="text-[10px] text-gray-400">Update status penjemputan donasi.</p>
                                 </div>
                                 <div class="relative inline-block w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer" 
                                      [class.bg-[#C04E35]]="notifications().transaction" [class.bg-gray-200]="!notifications().transaction"
                                      (click)="toggleNotify('transaction')">
                                     <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                          [class.translate-x-6]="notifications().transaction"></div>
                                 </div>
                             </div>
                         </div>
                    }

                    <!-- 3. SECURITY VIEW -->
                    @if (currentView() === 'security') {
                        <div class="space-y-4">
                            <div class="bg-white rounded-[24px] p-5 border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 class="font-bold text-[#1C1C1E] text-sm">Biometrik Login</h3>
                                    <p class="text-[10px] text-gray-400">Masuk menggunakan sidik jari/wajah.</p>
                                </div>
                                 <div class="relative inline-block w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer" 
                                      [class.bg-[#5D7A45]]="security().biometric" [class.bg-gray-200]="!security().biometric"
                                      (click)="toggleSecurity('biometric')">
                                     <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                          [class.translate-x-6]="security().biometric"></div>
                                 </div>
                            </div>

                             <div class="bg-white rounded-[24px] p-5 border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 class="font-bold text-[#1C1C1E] text-sm">Verifikasi 2 Langkah</h3>
                                    <p class="text-[10px] text-gray-400">Kode OTP via SMS/Email.</p>
                                </div>
                                 <div class="relative inline-block w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer" 
                                      [class.bg-[#5D7A45]]="security().twoFactor" [class.bg-gray-200]="!security().twoFactor"
                                      (click)="toggleSecurity('twoFactor')">
                                     <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                          [class.translate-x-6]="security().twoFactor"></div>
                                 </div>
                            </div>

                            <button class="w-full bg-white rounded-[24px] p-5 text-left border border-gray-100 hover:bg-gray-50 transition-colors group">
                                <h3 class="font-bold text-[#1C1C1E] text-sm mb-1">Ubah Password</h3>
                                <p class="text-[10px] text-gray-400">Terakhir diubah 3 bulan lalu.</p>
                                <div class="mt-3 text-[#C04E35] text-xs font-bold group-hover:underline">Update Sekarang ›</div>
                            </button>

                            <div class="bg-gray-100/50 rounded-[24px] p-5">
                                <h3 class="font-bold text-[#1C1C1E] text-xs uppercase tracking-widest mb-3">Aktivitas Login</h3>
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">📱</div>
                                    <div>
                                        <p class="font-bold text-xs">iPhone 13 Pro</p>
                                        <p class="text-[10px] text-gray-400">Mataram • Sedang Aktif</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 opacity-60">
                                    <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">💻</div>
                                    <div>
                                        <p class="font-bold text-xs">Chrome on Windows</p>
                                        <p class="text-[10px] text-gray-400">Mataram • 2 jam lalu</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <!-- 4. HELP VIEW -->
                    @if (currentView() === 'help') {
                        <div class="space-y-4">
                             <div class="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                                <div class="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#C04E35]/20 rounded-full blur-2xl"></div>
                                <h2 class="text-xl font-bold mb-2 relative z-10">Live Chat 24/7</h2>
                                <p class="text-sm opacity-80 mb-6 relative z-10 max-w-[80%]">Tim support kami siap membantu kendala donasi Anda.</p>
                                <button (click)="goToChat()" class="w-full bg-white text-[#1C1C1E] font-bold py-3.5 rounded-2xl shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 relative z-10">
                                    <span>💬</span> Hubungi CS
                                </button>
                            </div>

                            <div class="bg-white rounded-[24px] overflow-hidden border border-gray-100">
                                <button class="w-full p-5 text-left border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center">
                                    <span class="text-sm font-bold text-[#1C1C1E]">Laporkan Masalah</span>
                                    <span class="text-gray-400">›</span>
                                </button>
                                <button class="w-full p-5 text-left border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center">
                                    <span class="text-sm font-bold text-[#1C1C1E]">Syarat & Ketentuan</span>
                                    <span class="text-gray-400">›</span>
                                </button>
                                <button class="w-full p-5 text-left hover:bg-gray-50 flex justify-between items-center">
                                    <span class="text-sm font-bold text-[#1C1C1E]">Kebijakan Privasi</span>
                                    <span class="text-gray-400">›</span>
                                </button>
                            </div>
                            
                            <div class="text-center mt-8">
                                <p class="text-xs text-gray-400">Terhubung dengan kami</p>
                                <div class="flex justify-center gap-4 mt-3">
                                    <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600">IG</div>
                                    <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600">FB</div>
                                    <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600">X</div>
                                </div>
                            </div>
                        </div>
                    }

                </div>
            </div>
        }
    </div>
  `,
  styles: [`
    .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .animate-slide-in-left { animation: slideInLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes slideInLeft { from { transform: translateX(-20%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ProfileComponent {
  stateService = inject(StateService);
  currentView = signal<ProfileView>('main');

  // MOCK DATA
  addresses = signal([
    { label: 'Rumah', detail: 'Jl. Majapahit No. 45, Mataram', isPrimary: true },
    { label: 'Kantor', detail: 'Jl. Udayana No. 10, Mataram', isPrimary: false }
  ]);

  notifications = signal({
    chat: true,
    promo: false,
    transaction: true,
    community: true
  });

  security = signal({
    biometric: true,
    twoFactor: false
  });

  // LOGIC
  setPrimaryAddress(index: number) {
      this.addresses.update(addrs => {
          return addrs.map((a, i) => ({ ...a, isPrimary: i === index }));
      });
  }

  toggleNotify(key: keyof typeof this.notifications) {
      this.notifications.update(n => ({ ...n, [key]: !n[key as keyof typeof n] }));
  }

  toggleSecurity(key: 'biometric' | 'twoFactor') {
      this.security.update(s => ({ ...s, [key]: !s[key] }));
  }

  goToChat() {
      this.stateService.navigateToTab('chat');
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-6 pb-20 relative overflow-hidden bg-[#E6DDC5]">
        
        <!-- 1. PATTERN -->
        <div class="absolute inset-0 z-0 opacity-[0.05]" 
           style="background-image: 
              linear-gradient(45deg, #BFA15F 25%, transparent 25%, transparent 75%, #BFA15F 75%, #BFA15F), 
              linear-gradient(45deg, #BFA15F 25%, transparent 25%, transparent 75%, #BFA15F 75%, #BFA15F);
              background-position: 0 0, 20px 20px;
              background-size: 40px 40px;">
        </div>
        
        <!-- 2. LIVING ELEMENTS -->
        <div class="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-[#FFFFFF]/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-[#BFA15F]/10 rounded-full blur-[100px] animate-pulse-slow" style="animation-delay: 2s;"></div>

        <!-- Back Button (Floating) -->
        @if (!isLogin()) {
        <button (click)="isLogin.set(true)" class="absolute top-12 left-6 p-3 rounded-full bg-white/40 backdrop-blur border border-white/50 text-[#1C1C1E] shadow-sm z-30 hover:bg-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        }

        <!-- Main Content -->
        <div class="w-full max-w-md z-10 animate-fade-in-up mt-10">
            
            <!-- Branding Header -->
            <div class="flex flex-col items-center text-center mb-2">
                
                <!-- Logo -->
                @if(isLogin()) {
                    <div class="relative -mb-24">
                        <div class="absolute inset-0 bg-white/50 rounded-full blur-3xl transform scale-75"></div>
                        <img 
                            src="https://i.ibb.co.com/XZYPKfVc/Gemini-Generated-Image-m7jh8em7jh8em7jh-1.png" 
                            class="relative w-96 h-96 object-contain drop-shadow-2xl animate-float"
                            alt="Logo"
                        />
                    </div>
                }
                
                <h1 class="text-3xl font-extrabold text-[#1C1C1E] tracking-tight mb-1 relative z-10">{{ isLogin() ? 'Selamat Datang di SILAQ.ID' : 'Buat Akun Baru' }}</h1>
                <p class="text-[#1C1C1E]/70 text-sm font-medium relative z-10">{{ isLogin() ? 'Masuk untuk mulai berbagi kebaikan.' : 'Bergabunglah dengan komunitas Silaq.' }}</p>
            </div>

            <!-- Form Container (Glass Panel) -->
            <div class="glass-panel rounded-[32px] p-6 relative overflow-hidden bg-white/50 backdrop-blur-xl shadow-xl border border-white/50 max-h-[60vh] overflow-y-auto">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                <div class="space-y-4">
                    
                    <!-- ROLE SELECTION (FIRST if Registering) -->
                    @if (!isLogin()) {
                        <div class="space-y-2 pt-1">
                            <label class="text-xs font-bold text-[#1C1C1E]/60 uppercase tracking-wider ml-1">Saya mendaftar sebagai</label>
                            <div class="grid grid-cols-2 gap-4">
                                <button 
                                    (click)="userType.set('donor')"
                                    class="relative rounded-2xl p-3 text-center cursor-pointer transition-all duration-300 btn-3d border-2"
                                    [class.border-[#BFA15F]]="userType() === 'donor'"
                                    [class.bg-[#FFFDF5]]="userType() === 'donor'"
                                    [class.border-transparent]="userType() !== 'donor'"
                                    [class.bg-white/50]="userType() !== 'donor'"
                                >
                                    <div class="text-xl mb-1">🎁</div>
                                    <span class="text-xs font-bold" [class.text-[#BFA15F]]="userType() === 'donor'" [class.text-[#636366]]="userType() !== 'donor'">Pendonatur</span>
                                    @if(userType() === 'donor') { <div class="absolute top-2 right-2 w-2.5 h-2.5 bg-[#BFA15F] rounded-full shadow-sm"></div> }
                                </button>
                                <button 
                                    (click)="userType.set('recipient')"
                                    class="relative rounded-2xl p-3 text-center cursor-pointer transition-all duration-300 btn-3d border-2"
                                    [class.border-[#BFA15F]]="userType() === 'recipient'"
                                    [class.bg-[#FFFDF5]]="userType() === 'recipient'"
                                    [class.border-transparent]="userType() !== 'recipient'"
                                    [class.bg-white/50]="userType() !== 'recipient'"
                                >
                                    <div class="text-xl mb-1">🤲</div>
                                    <span class="text-xs font-bold" [class.text-[#BFA15F]]="userType() === 'recipient'" [class.text-[#636366]]="userType() !== 'recipient'">Penerima / Relawan</span>
                                    @if(userType() === 'recipient') { <div class="absolute top-2 right-2 w-2.5 h-2.5 bg-[#BFA15F] rounded-full shadow-sm"></div> }
                                </button>
                            </div>
                        </div>
                    }

                    <!-- BASIC FIELDS -->
                    @if (!isLogin()) {
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-[#1C1C1E]/60 uppercase tracking-wider ml-1">Nama Lengkap</label>
                            <input type="text" [(ngModel)]="name" class="w-full input-luxury px-6 py-3.5 font-bold text-[#1C1C1E]" placeholder="Nama Anda">
                        </div>
                    }

                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-[#1C1C1E]/60 uppercase tracking-wider ml-1">Email</label>
                        <input type="email" [(ngModel)]="email" class="w-full input-luxury px-6 py-3.5 font-bold text-[#1C1C1E]" placeholder="nama@email.com">
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-[#1C1C1E]/60 uppercase tracking-wider ml-1">Password</label>
                        <input type="password" [(ngModel)]="password" class="w-full input-luxury px-6 py-3.5 font-bold text-[#1C1C1E]" placeholder="••••••••">
                        @if(isLogin() && !password && !email) {
                           <p class="text-[10px] text-[#C04E35] font-bold text-right pt-1 opacity-70">*Kosongkan untuk login Admin</p>
                        }
                    </div>

                    <!-- RECIPIENT SPECIFIC FIELDS -->
                    @if (!isLogin() && userType() === 'recipient') {
                        <div class="bg-white/40 p-4 rounded-2xl space-y-3 border border-white/60 animate-fade-in-up">
                            <h3 class="text-xs font-extrabold text-[#C04E35] uppercase tracking-wider border-b border-[#C04E35]/20 pb-2">Detail Penerima / Relawan</h3>
                            
                            <div class="space-y-1.5">
                                <label class="text-[10px] font-bold text-[#1C1C1E]/60 uppercase ml-1">Nama Organisasi / Yayasan (Opsional)</label>
                                <input type="text" [(ngModel)]="recipientForm.organization" class="w-full bg-white/70 border border-white rounded-xl px-4 py-2 text-xs font-bold" placeholder="Contoh: Panti Asuhan Sejahtera">
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-[10px] font-bold text-[#1C1C1E]/60 uppercase ml-1">Nomor Induk Kependudukan (NIK)</label>
                                <input type="number" [(ngModel)]="recipientForm.nik" class="w-full bg-white/70 border border-white rounded-xl px-4 py-2 text-xs font-bold" placeholder="16 digit NIK">
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-[10px] font-bold text-[#1C1C1E]/60 uppercase ml-1">Jenis Kendaraan (Untuk Relawan)</label>
                                <select [(ngModel)]="recipientForm.vehicleType" class="w-full bg-white/70 border border-white rounded-xl px-4 py-2 text-xs font-bold">
                                    <option value="">- Pilih Kendaraan -</option>
                                    <option value="motor">Motor</option>
                                    <option value="mobil">Mobil</option>
                                    <option value="truk">Truk Pickup</option>
                                    <option value="none">Tidak Ada (Penerima Tetap)</option>
                                </select>
                            </div>
                             <div class="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                                <p class="text-[9px] text-yellow-800 leading-tight">
                                    *Data ini bisa Anda lengkapi nanti di profil. Silahkan lanjut mendaftar.
                                </p>
                            </div>
                        </div>
                    }
                </div>

                <!-- Main Button -->
                <button 
                    (click)="submit()" 
                    class="w-full btn-primary btn-3d text-white font-bold py-4 rounded-2xl mt-6 flex justify-center items-center gap-2 text-base shadow-xl"
                    [disabled]="isLoading()"
                >
                    @if (isLoading()) {
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    }
                    {{ isLogin() ? 'Masuk' : 'Daftar Sekarang' }}
                </button>
            </div>
            
            <!-- Toggle Mode -->
            <div class="text-center mt-6">
                <p class="text-[#1C1C1E]/80 text-sm font-medium">
                    {{ isLogin() ? 'Belum punya akun?' : 'Sudah punya akun?' }}
                    <button (click)="toggleMode()" class="text-white font-bold ml-1 hover:underline drop-shadow-sm">
                        {{ isLogin() ? 'Daftar' : 'Masuk' }}
                    </button>
                </p>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-pulse-slow { animation: pulse 8s infinite ease-in-out; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
  `]
})
export class AuthComponent {
  stateService = inject(StateService);
  
  isLogin = signal(true);
  isLoading = signal(false);
  userType = signal<'donor' | 'recipient'>('donor');

  email = '';
  password = '';
  name = '';

  // Recipient Specific
  recipientForm = {
      organization: '',
      nik: '',
      vehicleType: '',
      address: ''
  };

  toggleMode() {
    this.isLogin.update(v => !v);
  }

  submit() {
    this.isLoading.set(true);
    
    setTimeout(() => {
      if (this.isLogin()) {
        const success = this.stateService.login(this.email, this.password);
        if (!success) {
            alert('Email atau password salah! (Coba kosongkan untuk Admin)');
            this.isLoading.set(false);
        }
      } else {
        // PERMISSIIVE REGISTRATION FOR DEMO:
        // If fields are empty, just fill them with defaults to allow entry
        if (!this.email) this.email = `user${Math.floor(Math.random()*1000)}@silaq.id`;
        if (!this.name) this.name = this.userType() === 'recipient' ? 'Relawan Baru' : 'Orang Baik';
        if (!this.password) this.password = '123456';

        // Recipient details are completely optional now
        const details = this.userType() === 'recipient' ? this.recipientForm : undefined;

        this.stateService.register(this.name, this.email, this.password, this.userType(), details);
      }
    }, 1000);
  }
}

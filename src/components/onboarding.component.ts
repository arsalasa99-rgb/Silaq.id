
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full flex flex-col relative overflow-hidden bg-[#E6DDC5]">
      
      <!-- 1. SASAK TENUN PATTERN -->
      <div class="absolute inset-0 z-0 opacity-[0.05]" 
           style="background-image: 
              linear-gradient(45deg, #BFA15F 25%, transparent 25%, transparent 75%, #BFA15F 75%, #BFA15F), 
              linear-gradient(45deg, #BFA15F 25%, transparent 25%, transparent 75%, #BFA15F 75%, #BFA15F);
              background-position: 0 0, 20px 20px;
              background-size: 40px 40px;">
      </div>

      <!-- 2. LIVING ELEMENTS -->
      <div class="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-[#BFA15F]/10 rounded-full blur-[80px] animate-pulse-slow pointer-events-none"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-[#D98C36]/10 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" style="animation-delay: 2s"></div>

      <!-- TOP CONTROLS -->
      <div class="absolute top-12 left-6 z-30">
        <button (click)="finish()" class="px-5 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-[#BFA15F] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm">
            Lewati
        </button>
      </div>

      <!-- LOGO - SLIGHTLY BIGGER -->
      <img 
        src="https://i.ibb.co.com/XZYPKfVc/Gemini-Generated-Image-m7jh8em7jh8em7jh-1.png" 
        class="absolute top-8 right-6 w-28 h-28 object-contain z-30 drop-shadow-md animate-float"
        alt="Silaq Logo"
      />

      <!-- Main Content Area (Flex Grow to push content properly) -->
      <div class="flex-1 flex flex-col justify-center items-center px-6 relative z-10 w-full mt-8">
        
        <div class="w-full max-w-sm relative">
            
            <!-- Illustration Area -->
            <div class="w-full aspect-square flex items-center justify-center relative mb-6">
                
                @if (currentStep() === 0) {
                  <div class="relative animate-fade-in-scale flex items-center justify-center h-full">
                     <div class="glass-panel p-3 rounded-[32px] shadow-lg rotate-2 bg-white/60 relative z-10 border border-white/60">
                        <img src="https://i.ibb.co.com/7NKZqND3/generated-image.jpg" class="rounded-[24px] object-cover w-64 h-64 grayscale-[10%]" />
                     </div>
                     <div class="absolute bottom-8 -left-2 bg-[#BFA15F] px-5 py-2 rounded-xl shadow-xl animate-bounce-slow border border-white/20 z-20 rotate-[-4deg]">
                        <span class="text-lg font-bold text-white">👋 Silaq!</span>
                     </div>
                  </div>
                } @else if (currentStep() === 1) {
                  <div class="relative animate-fade-in-scale flex items-center justify-center h-full">
                     <div class="glass-panel p-3 rounded-[32px] shadow-lg -rotate-2 bg-white/60 relative z-10 border border-white/60">
                        <img src="https://i.ibb.co.com/cKMh0QDg/generated-image-2.jpg" class="rounded-[24px] object-cover w-64 h-64 grayscale-[10%]" />
                     </div>
                     <div class="absolute top-6 left-0 bg-[#D98C36] p-3 rounded-full shadow-lg animate-bounce-slow delay-100 text-white z-20 border-2 border-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
                     </div>
                  </div>
                } @else if (currentStep() === 2) {
                  <div class="relative animate-fade-in-scale flex items-center justify-center h-full">
                     <div class="glass-panel p-3 rounded-[32px] shadow-lg rotate-1 bg-white/60 relative z-10 border border-white/60">
                        <img src="https://i.ibb.co.com/JjQcGwTz/generated-image-1.jpg" class="rounded-[24px] object-cover w-64 h-64 grayscale-[10%]" />
                     </div>
                     <div class="absolute bottom-16 right-0 bg-[#5D7A45] p-3 rounded-full shadow-lg animate-bounce-slow delay-200 text-white z-20 border-2 border-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     </div>
                  </div>
                } @else if (currentStep() === 3) {
                  <!-- Slide 4: Cleanliness/Waste -->
                  <div class="relative animate-fade-in-scale flex items-center justify-center h-full">
                     <div class="glass-panel p-3 rounded-[32px] shadow-lg -rotate-1 bg-white/60 relative z-10 border border-white/60">
                        <img src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/2f4d197c-e083-4745-8fbd-f2da7291ad04.png" class="rounded-[24px] object-cover w-64 h-64 grayscale-[10%]" />
                     </div>
                     <div class="absolute top-10 left-[-10px] bg-[#5D7A45] px-4 py-2 rounded-xl shadow-lg animate-bounce-slow text-white z-20 border-2 border-white/50 rotate-[-3deg]">
                        <span class="text-xs font-bold">HR. Ath-Thabrani</span>
                     </div>
                  </div>
                } @else if (currentStep() === 4) {
                  <!-- Slide 5: Charity/Food -->
                  <div class="relative animate-fade-in-scale flex items-center justify-center h-full">
                     <div class="glass-panel p-3 rounded-[32px] shadow-lg rotate-2 bg-white/60 relative z-10 border border-white/60">
                        <img src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/40a59395-fe6c-421d-a286-ef3433e0f8a2.png" class="rounded-[24px] object-cover w-64 h-64 grayscale-[10%]" />
                     </div>
                     <div class="absolute bottom-10 right-[-10px] bg-[#E07A5F] px-4 py-2 rounded-xl shadow-lg animate-bounce-slow delay-100 text-white z-20 border-2 border-white/50 rotate-[3deg]">
                        <span class="text-xs font-bold">HR. At-Tirmidzi</span>
                     </div>
                  </div>
                } @else if (currentStep() === 5) {
                   <!-- Slide 6: Education -->
                   <div class="relative animate-fade-in-scale flex items-center justify-center h-full">
                     <div class="glass-panel p-3 rounded-[32px] shadow-lg -rotate-2 bg-white/60 relative z-10 border border-white/60">
                        <img src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/e45ee1c7-331e-496b-8566-da0a17991952.png" class="rounded-[24px] object-cover w-64 h-64 grayscale-[10%]" />
                     </div>
                     <div class="absolute top-0 right-0 bg-[#BFA15F] px-4 py-2 rounded-xl shadow-lg animate-bounce-slow delay-200 text-white z-20 border-2 border-white/50">
                        <span class="text-xs font-bold">HR. Muslim</span>
                     </div>
                  </div>
                }
            </div>

            <!-- Text Content -->
            <div class="text-center animate-slide-up">
              <h1 class="text-2xl font-extrabold text-[#1C1C1E] mb-3 tracking-tight leading-tight">
                {{ steps[currentStep()].title }}
              </h1>
              <p class="text-[#1C1C1E]/80 leading-relaxed text-sm px-2 font-medium min-h-[5rem]">
                {{ steps[currentStep()].desc }}
              </p>
            </div>

        </div>
      </div>

      <!-- Bottom Controls -->
      <div class="pb-safe px-8 mb-12 flex flex-col items-center space-y-6 z-10 w-full max-w-md mx-auto">
        <!-- Dots -->
        <div class="flex space-x-2">
            @for (step of steps; track $index) {
                <div 
                    class="h-1.5 rounded-full transition-all duration-500 cursor-pointer" 
                    (click)="currentStep.set($index)"
                    [class.w-8]="$index === currentStep()"
                    [class.bg-[#BFA15F]]="$index === currentStep()"
                    [class.w-1.5]="$index !== currentStep()"
                    [class.bg-[#1C1C1E]/20]="$index !== currentStep()"
                ></div>
            }
        </div>

        <!-- Main Action Button -->
        <button 
          (click)="next()"
          class="w-full btn-primary text-white font-bold py-3.5 rounded-xl text-lg tracking-wide flex items-center justify-center gap-2 group btn-3d shadow-xl border border-white/20 hover:scale-[1.02] transition-transform"
        >
          {{ currentStep() === steps.length - 1 ? 'Mulai Sekarang' : 'Lanjutkan' }}
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-scale { animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .animate-pulse-slow { animation: pulse 6s infinite ease-in-out; }
    .animate-bounce-slow { animation: bounce 3s infinite; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  `]
})
export class OnboardingComponent {
  stateService = inject(StateService);
  currentStep = signal(0);

  steps = [
    {
      title: 'Selamat Datang',
      desc: 'Platform donasi makanan & pengelolaan limbah organik berbasis budaya Sasak Lombok.'
    },
    {
      title: 'Donasi Makanan',
      desc: 'Salurkan makanan berlebih dengan mudah dan cepat kepada yang membutuhkan.'
    },
    {
      title: 'Ekosistem Hijau',
      desc: 'Ubah sisa makanan menjadi kompos atau pakan ternak untuk bumi yang lebih baik.'
    },
    {
      title: 'Kebersihan & Iman',
      desc: '"Allah membangun Islam atas dasar kebersihan." Ubah sampah jadi berkah donasi limbah. (HR. Ath-Thabrani)'
    },
    {
      title: 'Sedekah Hapus Dosa',
      desc: '"Sedekah memadamkan dosa sebagaimana air memadamkan api." Sucikan diri dengan donasi makanan. (HR. At-Tirmidzi)'
    },
    {
      title: 'Ilmu Menuju Surga',
      desc: '"Pencari ilmu dimudahkan jalan ke surga." Pelajari pengelolaan alam di fitur Edukasi. (HR. Muslim)'
    }
  ];

  next() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(v => v + 1);
    } else {
      this.finish();
    }
  }

  finish() {
    this.stateService.completeOnboarding();
  }
}

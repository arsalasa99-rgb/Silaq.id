import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#E6DDC5]">
      
      <!-- TAHAP 3 (1.5s start): Organic Pattern / Breathing Background -->
      <!-- A subtle, abstract organic shape at the bottom to break rigidity -->
      <div class="absolute bottom-[-20%] left-[-20%] w-[140%] h-[60%] z-0 pointer-events-none opacity-0 animate-breathe" 
           style="background: radial-gradient(ellipse at center, rgba(191, 161, 95, 0.08) 0%, transparent 70%); animation-delay: 1.5s; animation-fill-mode: forwards;">
      </div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] z-0 pointer-events-none opacity-0 animate-breathe" 
           style="background: radial-gradient(ellipse at center, rgba(217, 140, 54, 0.08) 0%, transparent 70%); animation-delay: 1.7s; animation-fill-mode: forwards;">
      </div>

      <!-- TAHAP 2 (0.5s start): Main Content Area -->
      <div class="relative z-10 flex flex-col items-center w-full max-w-md px-8">
        
        <!-- LOGO SEQUENCE -->
        <!-- Enlarged significantly to w-[28rem] h-[28rem] (approx 448px) -->
        <div class="relative mb-12 opacity-0 animate-scale-in" style="animation-delay: 0.5s; animation-fill-mode: forwards;">
            <!-- Subtle Glow behind logo -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-white/60 rounded-full blur-3xl"></div>
            
            <!-- The Logo (Massive Size) -->
            <img 
                src="https://i.ibb.co.com/XZYPKfVc/Gemini-Generated-Image-m7jh8em7jh8em7jh-1.png" 
                alt="Silaq Logo" 
                class="relative w-[28rem] h-[28rem] object-contain drop-shadow-2xl"
            />
        </div>

        <!-- TAHAP 4 (2.5s start): Interactive Elements -->
        <div class="flex flex-col items-center w-full opacity-0 animate-slide-up-fade" style="animation-delay: 2.5s; animation-fill-mode: forwards;">
            
            <!-- Typography -->
            <h1 class="text-4xl font-extrabold text-[#1C1C1E] tracking-tighter mb-2 drop-shadow-sm">
                Silaq<span class="text-[#BFA15F]">.id</span>
            </h1>
            
            <!-- Tagline -->
            <p class="text-[#1C1C1E]/80 font-medium text-sm tracking-wide mb-10 text-center">
                Berbagi Makanan, Merawat Lingkungan
            </p>

            <!-- Interactive Button (Call to Action) - Elegant Gold -->
            <button 
                (click)="enterApp()" 
                class="group relative w-full max-w-[240px] bg-[#BFA15F] text-white font-bold py-4 rounded-full shadow-[0_10px_30px_rgba(191,161,95,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
                <span class="relative z-10 flex items-center justify-center gap-2">
                    Silaq Masuk
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
                <!-- Hover effect highlight -->
                <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

        </div>
      </div>

    </div>
  `,
  styles: [`
    /* 1. Scale Up & Fade In (For Logo) - Smooth Ease Out */
    @keyframes scaleIn {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
    }
    .animate-scale-in {
        animation: scaleIn 1s cubic-bezier(0.25, 1, 0.5, 1); /* Ease Out Quartish */
    }

    /* 2. Slide Up & Fade (For Text/Buttons) */
    @keyframes slideUpFade {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up-fade {
        animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* 3. Breathing Animation (For Background Pattern) */
    @keyframes breathe {
        0% { opacity: 0; transform: scale(1); }
        20% { opacity: 1; }
        50% { opacity: 0.8; transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
    }
    .animate-breathe {
        animation: breathe 8s ease-in-out infinite;
    }
  `]
})
export class SplashComponent {
  stateService = inject(StateService);

  enterApp() {
    this.stateService.finishSplash();
  }
}
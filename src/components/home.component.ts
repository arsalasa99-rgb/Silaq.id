
import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';
import { InstantDonationComponent } from './home/instant-donation.component';
import { MapPickerComponent } from './home/map-picker.component';
import { TrackingSimulationComponent } from './home/tracking-simulation.component';
import { VolunteerTaskComponent } from './home/volunteer-task.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
      CommonModule, 
      FormsModule, 
      InstantDonationComponent, 
      MapPickerComponent, 
      TrackingSimulationComponent,
      VolunteerTaskComponent
  ],
  template: `
    <div class="pb-36 bg-[#E6DDC5] min-h-screen overflow-x-hidden relative">
        
        <!-- COMPONENTS ORCHESTRATION -->
        
        <!-- 0. TOAST NOTIFICATION -->
        @if (toastMessage()) {
            <div class="fixed top-24 left-1/2 -translate-x-1/2 z-[70] animate-slide-down-fade w-[90%] max-w-sm">
                <div class="bg-[#1C1C1E]/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
                    <div class="w-8 h-8 rounded-full bg-[#5D7A45] flex items-center justify-center text-lg animate-pulse">
                        ✅
                    </div>
                    <div class="flex-1">
                        <p class="text-xs font-bold">{{ toastMessage() }}</p>
                    </div>
                </div>
            </div>
        }

        <!-- 1. Map Picker Overlay -->
        @if (showMapPicker()) {
            <app-map-picker 
                (onClose)="showMapPicker.set(false)" 
                (onSelect)="onLocationSelected($event)">
            </app-map-picker>
        }

        <!-- 2. Tracking Simulation Overlay -->
        @if (activeRequest()) {
            <app-tracking-simulation
                [requestData]="activeRequest()"
                (onClose)="closeTracking()">
            </app-tracking-simulation>
        }

        <!-- 3. CHECK AVAILABILITY SHEET (New Feature) -->
        @if (checkingItem()) {
            <div class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in" 
                 (click)="closeCheck()">
                
                <div class="bg-white w-full rounded-t-[32px] shadow-2xl relative animate-slide-up-sheet flex flex-col max-h-[85vh]" 
                     (click)="$event.stopPropagation()">
                    
                    <!-- Handle -->
                    <div class="pt-3 pb-2 px-6 flex flex-col items-center flex-shrink-0">
                        <div class="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
                    </div>

                    <!-- Header -->
                    <div class="px-6 pb-2 text-center">
                        <h3 class="text-xl font-extrabold text-[#1C1C1E] mb-1">Ketersediaan Donasi</h3>
                        <p class="text-xs text-gray-500 font-medium">{{ checkingItem().title }}</p>
                    </div>

                    <!-- Content Body -->
                    <div class="p-6 pt-2">
                        @let status = getAvailabilityStatus(checkingItem());
                        
                        <!-- 1. The Numbers Grid -->
                        <div class="bg-[#F9F9F9] rounded-2xl p-5 border border-gray-100 mb-5">
                            <div class="flex justify-between items-end mb-4 border-b border-gray-200 pb-4">
                                <div>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Disediakan</p>
                                    <p class="text-xl font-extrabold text-[#1C1C1E]">{{ checkingItem().stats.total }} {{ checkingItem().stats.unit }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sudah Diambil</p>
                                    <p class="text-xl font-extrabold text-[#C04E35]">{{ checkingItem().stats.taken }} {{ checkingItem().stats.unit }}</p>
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm font-bold text-[#1C1C1E]">Sisa Saat Ini</p>
                                <p class="text-2xl font-extrabold" [ngClass]="status.colorClass">
                                    {{ checkingItem().stats.total - checkingItem().stats.taken }} {{ checkingItem().stats.unit }}
                                </p>
                            </div>

                            <!-- Visual Bar -->
                            <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                                     [ngClass]="status.bgClass"
                                     [style.width.%]="(checkingItem().stats.total - checkingItem().stats.taken) / checkingItem().stats.total * 100">
                                </div>
                            </div>

                            <div class="flex justify-between items-center text-[10px] font-medium text-gray-500 mt-3">
                                <span>Update: {{ checkingItem().stats.lastUpdate }}</span>
                                <span [ngClass]="status.colorClass" class="font-bold">{{ status.text }}</span>
                            </div>
                        </div>

                        <!-- 2. Action Buttons -->
                        <div class="grid grid-cols-3 gap-3">
                            <button (click)="closeCheck()" class="col-span-1 py-4 rounded-2xl font-bold text-[#1C1C1E] bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95">
                                Tutup
                            </button>
                            
                            @if (status.isAvailable) {
                                <button (click)="proceedFromCheck()" 
                                        class="col-span-2 py-4 rounded-2xl font-bold text-white shadow-xl transition-all btn-3d active:scale-95 flex items-center justify-center gap-2"
                                        [ngClass]="status.btnClass">
                                    <span>{{ status.urgencyIcon }}</span> 
                                    {{ status.urgencyText }}
                                </button>
                            } @else {
                                <button disabled class="col-span-2 py-4 rounded-2xl font-bold text-gray-400 bg-gray-200 cursor-not-allowed flex items-center justify-center gap-2">
                                    <span>❌</span> Stok Habis
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }

        <!-- 4. "Ambil" Confirmation Sheet (Existing - Simplified) -->
        @if (selectedDonation()) {
            <div class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in" 
                 (click)="cancelSelection()">
                
                <div class="bg-white w-full rounded-t-[32px] shadow-2xl relative animate-slide-up-sheet flex flex-col max-h-[90vh]" 
                     (click)="$event.stopPropagation()">
                    
                    <div class="pt-3 pb-2 px-6 flex flex-col items-center flex-shrink-0 cursor-grab active:cursor-grabbing">
                        <div class="w-12 h-1.5 bg-gray-300 rounded-full mb-6"></div>
                        <div class="text-center w-full">
                            <h3 class="text-xl font-extrabold text-[#1C1C1E] mb-1">Ambil Donasi Ini?</h3>
                            <p class="text-sm text-gray-500 leading-relaxed">
                                Pastikan Anda bisa menjemput di lokasi ini.
                            </p>
                        </div>
                    </div>

                    <div class="overflow-y-auto px-6 py-4">
                        <div class="bg-[#F9F9F9] rounded-[24px] p-4 flex gap-4 items-center border border-gray-100 mb-6">
                            <div class="w-20 h-20 rounded-2xl bg-white overflow-hidden shadow-sm flex-shrink-0 border border-gray-100 relative">
                                <img [src]="selectedDonation()?.image" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-[#1C1C1E] text-base leading-tight mb-1">{{ selectedDonation()?.title }}</h4>
                                <div class="flex items-center gap-1.5 mt-1">
                                    <img [src]="selectedDonation()?.avatar" class="w-4 h-4 rounded-full border border-gray-200">
                                    <p class="text-xs text-gray-500 font-medium">{{ selectedDonation()?.donorName }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 pt-4 border-t border-gray-100 bg-white pb-8 rounded-b-[32px] flex-shrink-0">
                        <div class="grid grid-cols-3 gap-3">
                            <button (click)="cancelSelection()" class="col-span-1 py-4 rounded-2xl font-bold text-[#1C1C1E] bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95">
                                Batal
                            </button>
                            <button (click)="confirmAccept()" class="col-span-2 py-4 rounded-2xl font-bold text-white shadow-xl shadow-gray-200 btn-3d active:scale-95 flex items-center justify-center gap-2"
                                    [class.bg-[#1C1C1E]]="selectedDonation()?.type !== 'Limbah'"
                                    [class.bg-[#5D7A45]]="selectedDonation()?.type === 'Limbah'">
                                <span>🚀</span> Ambil Sekarang
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        }

        <!-- 1. HEADER (Gold Blend) -->
        <div class="pt-14 px-6 pb-4 flex justify-between items-center sticky top-0 z-30 bg-[#E6DDC5]/95 backdrop-blur-md transition-all border-b border-transparent shadow-sm">
            <!-- Left: Greeting -->
            <div class="flex flex-col animate-slide-down">
                <p class="text-[#BFA15F] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Selamat Datang</p>
                <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-extrabold text-[#1C1C1E] tracking-tight leading-none">Silaq, <span class="text-[#BFA15F]">{{ user()?.name?.split(' ')[0] }}</span></h1>
                    @if(user()?.type === 'recipient') {
                        <span class="bg-[#5D7A45] text-white text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Relawan</span>
                    }
                </div>
            </div>

            <!-- Right: Notif & Profile -->
            <div class="flex items-center gap-3 animate-slide-down" style="animation-delay: 0.1s;">
                <button class="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#1C1C1E] group-hover:text-[#BFA15F] transition-colors"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    <div class="absolute top-2.5 right-3 w-2 h-2 bg-[#BFA15F] rounded-full border border-white"></div>
                </button>
                <div class="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#BFA15F] to-[#D4AF37] shadow-md cursor-pointer hover:scale-105 transition-transform">
                    <img [src]="user()?.avatar" class="w-full h-full rounded-full object-cover border-2 border-white" alt="Profile">
                </div>
            </div>
        </div>

        <!-- 2. JELAJAH SILAQ (CAROUSEL BANNER) -->
        <div class="mt-2 mb-8 space-y-4">
            <div class="relative w-full group">
                <div 
                    #bannerContainer
                    class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 w-full py-2"
                    (scroll)="onScroll($event)"
                >
                    @for (banner of banners; track $index) {
                        <div class="min-w-full snap-center relative aspect-[21/9] rounded-[24px] overflow-hidden shadow-lg border border-white/30">
                            <img [src]="banner.image" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/90 via-[#1C1C1E]/20 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 p-5 w-full">
                                <span class="px-2.5 py-1 bg-[#BFA15F] text-white text-[9px] font-bold rounded-full uppercase tracking-wider mb-2 inline-block shadow-md border border-white/10">{{ banner.tag }}</span>
                                <h3 class="text-white font-bold text-lg leading-tight drop-shadow-md">{{ banner.title }}</h3>
                                <p class="text-white/80 text-[10px] mt-1 font-medium line-clamp-1">{{ banner.desc }}</p>
                            </div>
                        </div>
                    }
                </div>
                <div class="flex justify-center gap-1.5 mt-2">
                    @for (banner of banners; track $index) {
                        <div 
                            class="h-1.5 rounded-full transition-all duration-300"
                            [class.w-5]="$index === activeBannerIndex()"
                            [class.bg-[#BFA15F]]="$index === activeBannerIndex()"
                            [class.w-1.5]="$index !== activeBannerIndex()"
                            [class.bg-white/40]="$index !== activeBannerIndex()"
                        ></div>
                    }
                </div>
            </div>
        </div>

        <!-- 3. STATS (Compact & Floating) -->
        <div class="px-6 mb-8">
            <div class="bg-[#FFFFFF]/60 backdrop-blur-xl rounded-[24px] p-4 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden">
                <div class="flex-1 flex flex-col items-center border-r border-gray-200/50 z-10">
                    <span class="text-[#BFA15F] font-extrabold text-xl">{{ user()?.stats?.points }}</span>
                    <span class="text-[#636366] text-[9px] font-bold uppercase tracking-widest mt-1">Poin Silaq</span>
                </div>
                <div class="flex-1 flex flex-col items-center border-r border-gray-200/50 z-10">
                    <span class="text-[#1C1C1E] font-extrabold text-xl">{{ user()?.stats?.donated }}x</span>
                    <span class="text-[#636366] text-[9px] font-bold uppercase tracking-widest mt-1">
                        {{ user()?.type === 'recipient' ? 'Diterima' : 'Donasi' }}
                    </span>
                </div>
                 <div class="flex-1 flex flex-col items-center z-10">
                    <span class="text-[#5D7A45] font-extrabold text-xl">{{ user()?.stats?.wasteProcessed }}kg</span>
                    <span class="text-[#636366] text-[9px] font-bold uppercase tracking-widest mt-1">Limbah</span>
                </div>
            </div>
        </div>

        <!-- 4. AKSI UTAMA (Buttons) -->
        <div class="px-6 mb-10">
            <h2 class="text-sm font-bold text-[#1C1C1E] tracking-wide uppercase mb-4 pl-1">
                {{ user()?.type === 'recipient' ? 'Layanan Penerima' : 'Aksi Kebaikan' }}
            </h2>
            <div class="flex gap-4">
                <button (click)="goToDonate('food')" class="flex-1 relative h-44 rounded-[32px] overflow-hidden group btn-3d shadow-xl shadow-[#BFA15F]/20 border border-white/50">
                    <div class="absolute inset-0 bg-gradient-to-br from-[#BFA15F] to-[#9C824A]"></div>
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div class="relative z-10 p-5 h-full flex flex-col justify-between items-start text-left">
                        <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl border border-white/30 shadow-inner">
                            {{ user()?.type === 'recipient' ? '📢' : '🍛' }}
                        </div>
                        <div>
                            <p class="text-white/80 text-[9px] font-bold uppercase tracking-widest mb-1">
                                {{ user()?.type === 'recipient' ? 'Butuh Bantuan' : 'Berbagi Makanan' }}
                            </p>
                            <h3 class="text-white font-extrabold text-2xl leading-none">
                                {{ user()?.type === 'recipient' ? 'Ajukan\nPermintaan' : 'Donasi\nBesar' }}
                            </h3>
                        </div>
                        <div class="self-end bg-white/20 backdrop-blur rounded-full p-2 group-hover:bg-white group-hover:text-[#BFA15F] transition-colors">
                            <svg class="w-4 h-4 text-white group-hover:text-[#BFA15F] transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                    </div>
                </button>

                <button (click)="goToDonate('waste')" class="flex-1 relative h-44 rounded-[32px] overflow-hidden group btn-3d shadow-xl shadow-[#5D7A45]/20 border border-white/50">
                    <div class="absolute inset-0 bg-gradient-to-br from-[#5D7A45] to-[#4A6335]"></div>
                    <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div class="relative z-10 p-5 h-full flex flex-col justify-between items-start text-left">
                        <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl border border-white/30 shadow-inner">
                            ♻️
                        </div>
                        <div>
                             <p class="text-white/80 text-[9px] font-bold uppercase tracking-widest mb-1">
                                {{ user()?.type === 'recipient' ? 'Kelola Limbah' : 'Olah Limbah' }}
                            </p>
                            <h3 class="text-white font-extrabold text-2xl leading-none">
                                 {{ user()?.type === 'recipient' ? 'Cari\nLimbah' : 'Pakan &\nKompos' }}
                            </h3>
                        </div>
                         <div class="self-end bg-white/20 backdrop-blur rounded-full p-2 group-hover:bg-white group-hover:text-[#5D7A45] transition-colors">
                            <svg class="w-4 h-4 text-white group-hover:text-[#5D7A45] transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                    </div>
                </button>
            </div>
        </div>

        <!-- 5. MAIN FEATURE WIDGET -->
        <div class="px-6 mb-8">
            @if (user()?.type === 'recipient') {
                <app-volunteer-task></app-volunteer-task>
            } @else {
                <h2 class="text-sm font-bold text-[#1C1C1E] tracking-wide uppercase mb-4 pl-1 flex items-center gap-2">
                    <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-[#E07A5F]"></span>
                    </span>
                    Donasi Kilat (Instant)
                </h2>

                <app-instant-donation
                    #instantDonation
                    [externalLocation]="pickedLocation()"
                    (onStartSimulation)="startTracking($event)"
                    (onOpenMap)="showMapPicker.set(true)"
                ></app-instant-donation>
                
                <!-- REDESIGNED: AMBIL DONASI LIST (Modern Layered Cards) -->
                <div class="mt-8 pb-4">
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h2 class="text-sm font-bold text-[#1C1C1E] tracking-wide uppercase flex items-center gap-2">
                           <span class="text-lg">📍</span> Ambil Donasi Terdekat
                        </h2>
                        <button class="text-[10px] font-bold text-[#BFA15F] hover:text-[#9C824A] transition-colors">Lihat Semua</button>
                    </div>

                    <div class="space-y-4">
                        @for (item of nearbyDonations; track item.id) {
                           @let theme = getCategoryTheme(item.type);
                           <div class="relative bg-white rounded-[28px] p-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.05)] border border-white transition-all duration-300 hover:shadow-lg active:scale-[0.98] group overflow-hidden">
                               <!-- Subtle Left Accent/Gradient -->
                               <div class="absolute left-0 top-0 bottom-0 w-1.5" [ngClass]="theme.border"></div>
                               <div class="absolute inset-0 opacity-[0.03]" [ngClass]="theme.bg"></div>

                               <div class="flex gap-4 relative z-10">
                                    <!-- Modern Thumbnail -->
                                    <div class="w-24 h-24 rounded-[20px] bg-gray-100 relative overflow-hidden shadow-inner flex-shrink-0">
                                       <img [src]="item.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                       <!-- Glass Distance Badge -->
                                       <div class="absolute bottom-1.5 left-1.5 right-1.5 bg-black/30 backdrop-blur-md text-white text-[9px] font-bold py-1 px-2 rounded-lg text-center border border-white/10">
                                          {{ item.distance }}
                                       </div>
                                    </div>

                                    <!-- Content Column -->
                                    <div class="flex-1 flex flex-col justify-center min-w-0">
                                       <!-- Meta Row -->
                                       <div class="flex items-center gap-2 mb-1">
                                          <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider"
                                                [ngClass]="[theme.lightBg, theme.text]">
                                             {{ item.type }}
                                          </span>
                                          <span class="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                             <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                             Baru
                                          </span>
                                       </div>

                                       <!-- Title -->
                                       <h3 class="text-base font-extrabold text-[#1C1C1E] leading-tight truncate mb-1">{{ item.title }}</h3>

                                       <!-- Donor -->
                                       <div class="flex items-center gap-1.5 mb-3">
                                          <img [src]="item.avatar" class="w-4 h-4 rounded-full border border-white shadow-sm">
                                          <span class="text-[10px] font-bold text-[#8E8E93] truncate">{{ item.donorName }}</span>
                                       </div>

                                       <!-- Action Buttons (Pills) -->
                                       <div class="flex items-center gap-2 mt-auto">
                                          <button (click)="checkAvailability(item)" 
                                                  class="flex-1 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                              Cek
                                          </button>
                                          <button (click)="selectDonationItem(item)" 
                                                  class="flex-[1.5] py-1.5 rounded-full text-white text-[10px] font-bold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1"
                                                  [ngClass]="theme.btn">
                                              Ambil
                                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"/></svg>
                                          </button>
                                       </div>
                                    </div>
                               </div>
                           </div>
                        }
                    </div>
                </div>
            }
        </div>

    </div>
  `,
  styles: [`
    .animate-slide-down { animation: slideDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up-sheet { animation: slideUpSheet 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-slide-down-fade { animation: slideDownFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
    
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDownFade { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
  `]
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  stateService = inject(StateService);
  user = this.stateService.currentUser;
  
  @ViewChild('bannerContainer') bannerContainer!: ElementRef;
  @ViewChild('instantDonation') instantDonation!: InstantDonationComponent;
  
  activeBannerIndex = signal(0);
  scrollInterval: any;

  // State for child components
  showMapPicker = signal(false);
  activeRequest = signal<any | null>(null);
  pickedLocation = signal('');
  
  // Sheet & Notification State
  selectedDonation = signal<any | null>(null);
  toastMessage = signal<string | null>(null);
  toastTimeout: any;

  // CHECK FEATURE STATE
  checkingItem = signal<any | null>(null);

  // --- NEARBY DONATIONS DATA ---
  nearbyDonations = [
      { 
          id: 101, 
          title: "3kg Mangga Panen", 
          type: "Buah",
          distance: "0.2 km", 
          donorName: "Ibu Rahmi", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahmi",
          image: "https://cf.shopee.co.id/file/sg-11134201-22120-ixuo9bc513kv54",
          location: "Gg. Manggis No. 3",
          // ADDED STATS FOR CHECK
          stats: { total: 5, taken: 2, unit: 'kg', lastUpdate: '10 menit lalu' }
      },
      { 
          id: 102, 
          title: "Sisa Catering Hajatan", 
          type: "Makanan",
          distance: "0.5 km", 
          donorName: "Pak Haji Dullah", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dullah",
          image: "https://ik.imagekit.io/nibble/public/uploads/tempat_makan_baru_di_jakarta_9_a243df5b3c_85cRczxxO.jpg",
          location: "Jl. Raya Mataram",
          stats: { total: 50, taken: 45, unit: 'box', lastUpdate: '2 menit lalu' }
      },
      { 
          id: 103, 
          title: "Roti Bakery (Layak)", 
          type: "Roti",
          distance: "0.8 km", 
          donorName: "Toko Roti Ceria", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Store",
          image: "https://ik.imagekit.io/nibble/public/uploads/bakery_di_jakarta_paling_enak_00_2bea09be33_l7Q71Jcva.jpg",
          location: "Komp. Ruko Indah",
          stats: { total: 20, taken: 19, unit: 'pcs', lastUpdate: 'Baru saja' }
      },
      { 
          id: 104, 
          title: "Kulit Pisang Organik", 
          type: "Limbah",
          distance: "1.1 km", 
          donorName: "Warung Jus Asep", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Asep",
          image: "https://akcdn.detik.net.id/visual/2020/02/07/6399d4f9-6a93-4818-ab7b-0aa0033600b1_169.jpeg?w=750&q=90",
          location: "Perempatan Pasar",
          stats: { total: 10, taken: 0, unit: 'kg', lastUpdate: '1 jam lalu' }
      }
  ];

  // --- UI HELPER ---
  getCategoryTheme(type: string) {
      switch(type) {
          case 'Buah':
              return { 
                  bg: 'bg-lime-500', 
                  border: 'bg-lime-500', 
                  text: 'text-lime-700', 
                  lightBg: 'bg-lime-100',
                  btn: 'bg-lime-600 hover:bg-lime-700'
              };
          case 'Makanan':
              return { 
                  bg: 'bg-orange-500', 
                  border: 'bg-orange-500', 
                  text: 'text-orange-700', 
                  lightBg: 'bg-orange-100',
                  btn: 'bg-orange-600 hover:bg-orange-700'
              };
          case 'Roti':
              return { 
                  bg: 'bg-amber-600', 
                  border: 'bg-amber-600', 
                  text: 'text-amber-800', 
                  lightBg: 'bg-amber-100',
                  btn: 'bg-amber-700 hover:bg-amber-800'
              };
          case 'Limbah':
              return { 
                  bg: 'bg-[#5D7A45]', 
                  border: 'bg-[#5D7A45]', 
                  text: 'text-[#5D7A45]', 
                  lightBg: 'bg-[#5D7A45]/20',
                  btn: 'bg-[#5D7A45] hover:bg-[#4A6335]'
              };
          default:
              return { 
                  bg: 'bg-gray-500', 
                  border: 'bg-gray-500', 
                  text: 'text-gray-700', 
                  lightBg: 'bg-gray-100',
                  btn: 'bg-gray-800 hover:bg-black'
              };
      }
  }

  getAvailabilityStatus(item: any) {
      const remaining = item.stats.total - item.stats.taken;
      const percent = (remaining / item.stats.total) * 100;

      if (remaining <= 0) {
          return {
              text: 'Sudah Habis',
              colorClass: 'text-gray-400',
              bgClass: 'bg-gray-300',
              btnClass: 'bg-gray-300 text-gray-500 cursor-not-allowed',
              urgencyText: 'Habis',
              urgencyIcon: '❌',
              isAvailable: false
          };
      } else if (percent < 15) {
          return {
              text: 'Hampir Habis (Segera Ambil)',
              colorClass: 'text-[#C04E35]',
              bgClass: 'bg-[#C04E35]',
              btnClass: 'bg-[#C04E35] hover:bg-red-700 text-white animate-pulse', // High urgency
              urgencyText: 'Ambil Sekarang Juga',
              urgencyIcon: '🔥',
              isAvailable: true
          };
      } else if (percent < 50) {
          return {
              text: 'Stok Menipis',
              colorClass: 'text-orange-500',
              bgClass: 'bg-orange-500',
              btnClass: 'bg-orange-600 hover:bg-orange-700 text-white',
              urgencyText: 'Ambil Segera',
              urgencyIcon: '⚡',
              isAvailable: true
          };
      } else {
          return {
              text: 'Masih Cukup Banyak',
              colorClass: 'text-[#5D7A45]',
              bgClass: 'bg-[#5D7A45]',
              btnClass: 'bg-[#1C1C1E] hover:bg-black text-white', // Normal
              urgencyText: 'Ambil Donasi',
              urgencyIcon: '🚀',
              isAvailable: true
          };
      }
  }

  // --- HANDLERS ---
  
  startTracking(data: any) {
      this.activeRequest.set(data);
  }

  // 1. Show Detailed Availability Check (Popup)
  checkAvailability(item: any) {
      // Simulate slight network delay for realism
      setTimeout(() => {
          this.checkingItem.set(item);
      }, 200);
  }

  closeCheck() {
      this.checkingItem.set(null);
  }

  proceedFromCheck() {
      const item = this.checkingItem();
      if(item) {
          this.closeCheck();
          // Proceed to transaction flow directly
          this.stateService.activeDonationTransaction.set({
              ...item,
              status: 'accepted'
          });
          this.stateService.navigateToTab('chat');
      }
  }

  // 2. Open Sheet (Explicit Action)
  selectDonationItem(item: any) {
      this.selectedDonation.set(item);
  }

  // 3. Cancel
  cancelSelection() {
      this.selectedDonation.set(null);
  }

  // 4. Confirm & Start Transaction Flow (Redirect to Chat)
  confirmAccept() {
      const item = this.selectedDonation();
      if (!item) return;

      // START TRANSACTION CONTEXT
      // Instead of simulation, we go to chat
      this.stateService.activeDonationTransaction.set({
          ...item,
          status: 'accepted'
      });

      this.selectedDonation.set(null); 
      this.stateService.navigateToTab('chat');
  }

  closeTracking() {
      if (this.instantDonation) {
          this.instantDonation.reset();
      }
      this.activeRequest.set(null);
  }

  onLocationSelected(location: string) {
      this.pickedLocation.set(location);
      this.showMapPicker.set(false);
  }

  // --- CAROUSEL LOGIC ---

  banners = [
    {
        title: "Mari Saling Silaq",
        desc: "Salurkan makanan berlebih untuk saudara yang membutuhkan.",
        tag: "Fitur Utama",
        image: "https://i.ibb.co.com/7NKZqND3/generated-image.jpg"
    },
    {
        title: "Solusi Limbah Organik",
        desc: "Salurkan sisa dapur ke peternak maggot & petani kompos.",
        tag: "Lingkungan",
        image: "https://i.ibb.co.com/JjQcGwTz/generated-image-1.jpg"
    },
    {
        title: "Teknologi AI Scanner",
        desc: "Cek kelayakan makanan otomatis dengan kecerdasan buatan.",
        tag: "Teknologi",
        image: "https://i.ibb.co.com/cKMh0QDg/generated-image-2.jpg"
    },
    {
        title: "Edukasi Silaq TV",
        desc: "Pelajari cara mengolah sampah dan adab berbagi.",
        tag: "Edukasi",
        image: "https://picsum.photos/seed/learn/800/400"
    }
  ];

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    if (this.scrollInterval) clearInterval(this.scrollInterval);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  startAutoScroll() {
    this.scrollInterval = setInterval(() => {
        if (!this.bannerContainer) return;
        
        const container = this.bannerContainer.nativeElement;
        const width = container.offsetWidth;
        const maxScroll = container.scrollWidth - width;
        
        let nextScroll = container.scrollLeft + width;
        
        if (nextScroll > maxScroll + 10) { 
            nextScroll = 0;
        }

        container.scrollTo({
            left: nextScroll,
            behavior: 'smooth'
        });

    }, 5000); 
  }

  onScroll(event: any) {
    const container = event.target;
    const scrollPosition = container.scrollLeft;
    const width = container.offsetWidth;
    const index = Math.round(scrollPosition / width);
    this.activeBannerIndex.set(index);
  }

  goToDonate(type: string) {
    this.stateService.navigateToTab('donate');
  }
}

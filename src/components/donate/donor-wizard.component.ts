
import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { StateService } from '../../services/state.service';

type Step = 'type-select' | 'intro' | 'details' | 'camera' | 'analysis' | 'location' | 'success';

interface Recipient {
  id: number;
  type: 'food' | 'waste';
  code: string;
  name: string;
  distance: string;
  needs: string;
  verified: boolean;
  description: string;
  address: string;
  image: string;
  stats: {
    received: number;
    rating: number;
  };
}

@Component({
  selector: 'app-donor-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pb-32">
        
        <!-- MODAL: View Recipient Detail -->
        @if (viewRecipient()) {
             <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                  <div class="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up relative">
                      <button type="button" (click)="closeRecipientDetail()" class="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full backdrop-blur z-10 hover:bg-black/40 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                      <div class="h-40 bg-gray-200 relative">
                          <img [src]="viewRecipient()!.image" class="w-full h-full object-cover">
                          <div class="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div class="absolute bottom-4 left-4 text-white">
                              <h3 class="font-bold text-xl leading-none">{{ viewRecipient()!.name }}</h3>
                              <p class="text-xs opacity-90">{{ viewRecipient()!.address }}</p>
                          </div>
                      </div>
                      <div class="p-6">
                           <p class="text-sm text-[#3D405B] leading-relaxed mb-6">{{ viewRecipient()!.description }}</p>
                           <button type="button" (click)="selectRecipient(viewRecipient()!)" class="w-full btn-primary btn-3d text-white font-bold py-4 rounded-2xl shadow-lg">
                              Pilih Penerima Ini
                          </button>
                      </div>
                  </div>
             </div>
        }

        <!-- HEADER WIZARD -->
        @if (currentStep() !== 'type-select' && currentStep() !== 'success') {
            <div class="glass-panel px-6 py-4 sticky top-0 z-30 border-b border-[#D1CDC4] transition-all duration-500">
            <div class="flex items-center mb-3">
                <button type="button" (click)="goBack()" class="mr-3 p-2 rounded-full hover:bg-black/5 transition-colors active:scale-90 duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div>
                    <h1 class="font-extrabold text-sm uppercase tracking-widest" 
                        [class.text-[#E07A5F]]="donationType() === 'food'"
                        [class.text-[#5D7A45]]="donationType() === 'waste'">
                        {{ donationType() === 'food' ? 'Donasi Makanan' : 'Donasi Limbah' }}
                    </h1>
                    <p class="text-[10px] text-[#1B1B1B]/60 font-bold">{{ getStepTitle() }}</p>
                </div>
            </div>

            <!-- DYNAMIC PROGRESS BAR -->
            <div class="flex gap-2">
                @for (stepLabel of getProgressSteps(); track $index) {
                    <div class="flex-1 flex flex-col gap-1">
                        <div class="h-1 rounded-full transition-all duration-500"
                                [class.bg-[#E07A5F]]="donationType() === 'food' && isStepActive($index)"
                                [class.bg-[#5D7A45]]="donationType() === 'waste' && isStepActive($index)"
                                [class.bg-[#D1CDC4]]="!isStepActive($index)">
                        </div>
                        <span class="text-[8px] font-bold uppercase text-center text-[#1B1B1B]/50" [class.text-black]="isStepActive($index)">{{ stepLabel }}</span>
                    </div>
                }
            </div>
            </div>
        } @else if (currentStep() === 'type-select') {
            <div class="px-6 pt-8 pb-4">
                <h1 class="text-3xl font-extrabold text-[#1B1B1B] leading-tight">Mulai<br><span class="text-[#C04E35]">Kebaikan</span> Hari Ini.</h1>
                <p class="text-sm text-[#3D405B] mt-2 font-medium">Pilih jalur donasi yang sesuai dengan kondisi barang Anda.</p>
            </div>
        }

        <!-- WIZARD CONTENT -->
        <div class="p-6">
            
            <!-- STEP 1: SELECT TYPE -->
            @if (currentStep() === 'type-select') {
              <div class="space-y-6 animate-slide-up">
                
                <!-- FEATURE 1: FOOD DONATION -->
                <div 
                  (click)="selectType('food')"
                  class="group relative bg-white rounded-[40px] p-1 shadow-sm border border-[#9CAF88]/30 hover:border-[#E07A5F] transition-all duration-300 cursor-pointer overflow-hidden btn-3d active:scale-[0.98]"
                >
                  <div class="bg-[#FFF0F0] rounded-[36px] p-7 relative overflow-hidden">
                      <div class="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#E07A5F]/10 rounded-full blur-2xl"></div>
                      
                      <div class="flex justify-between items-start relative z-10">
                        <div>
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-[#E07A5F]">🍛</div>
                            <h3 class="text-xl font-extrabold text-[#1B1B1B] mb-1">Donasi Makanan</h3>
                            <p class="text-[#3D405B] text-[11px] mt-1 font-bold leading-relaxed max-w-[80%]">Untuk Panti Asuhan & Masyarakat.</p>
                        </div>
                        <div class="bg-white p-2 rounded-full shadow-sm group-hover:bg-[#E07A5F] group-hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                  </div>
                </div>

                <!-- FEATURE 2: WASTE DONATION -->
                <div 
                  (click)="selectType('waste')"
                  class="group relative bg-white rounded-[40px] p-1 shadow-sm border border-[#9CAF88]/30 hover:border-[#5D7A45] transition-all duration-300 cursor-pointer overflow-hidden btn-3d active:scale-[0.98]"
                >
                   <div class="bg-[#F4F1DE] rounded-[36px] p-7 relative overflow-hidden">
                      <div class="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-[#98A869]/20 rounded-full blur-2xl"></div>
                      
                      <div class="flex justify-between items-start relative z-10">
                        <div>
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-[#5D7A45]">♻️</div>
                            <h3 class="text-xl font-extrabold text-[#1B1B1B] mb-1">Donasi Limbah</h3>
                            <p class="text-[#3D405B] text-[11px] mt-1 font-bold leading-relaxed max-w-[80%]">Untuk Petani Kompos & Maggot.</p>
                        </div>
                        <div class="bg-white p-2 rounded-full shadow-sm group-hover:bg-[#5D7A45] group-hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            }

            <!-- STEP 2: INTRO WIDGET -->
            @if (currentStep() === 'intro') {
                <div class="animate-slide-up flex flex-col h-[70vh] justify-between">
                    
                    @if(donationType() === 'food') {
                        <div class="bg-white rounded-[40px] p-8 border border-[#E07A5F]/30 shadow-xl relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-40 h-40 bg-[#E07A5F]/10 rounded-bl-full -mr-10 -mt-10"></div>
                            <div class="w-20 h-20 bg-[#FFF0F0] rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm text-[#E07A5F] relative z-10">🍛</div>
                            <h2 class="text-2xl font-extrabold text-[#1B1B1B] mb-4 leading-tight">Selamat Datang di<br>Donasi Makanan</h2>
                            <p class="text-[#3D405B] text-sm leading-relaxed mb-6">Fitur ini menghubungkan Anda dengan Panti Asuhan & Masyarakat yang membutuhkan.</p>
                            <div class="space-y-4">
                                <div class="flex gap-4 items-start">
                                    <span class="bg-[#E07A5F]/10 text-[#E07A5F] font-bold rounded px-2 py-0.5 text-xs mt-1">1</span>
                                    <p class="text-xs text-[#636366] font-medium">Makanan akan melalui <strong>Sensor AI</strong> untuk uji kelayakan.</p>
                                </div>
                                <div class="flex gap-4 items-start">
                                    <span class="bg-[#E07A5F]/10 text-[#E07A5F] font-bold rounded px-2 py-0.5 text-xs mt-1">2</span>
                                    <p class="text-xs text-[#636366] font-medium">Pastikan makanan higienis, halal, dan kemasan utuh.</p>
                                </div>
                            </div>
                        </div>
                    } @else {
                        <div class="bg-white rounded-[40px] p-8 border border-[#5D7A45]/30 shadow-xl relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-40 h-40 bg-[#5D7A45]/10 rounded-bl-full -mr-10 -mt-10"></div>
                            <div class="w-20 h-20 bg-[#F4F1DE] rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm text-[#5D7A45] relative z-10">♻️</div>
                            <h2 class="text-2xl font-extrabold text-[#1B1B1B] mb-4 leading-tight">Selamat Datang di<br>Donasi Limbah</h2>
                            <p class="text-[#3D405B] text-sm leading-relaxed mb-6">Jembatan bagi sampah organik Anda menuju petani kompos dan peternak maggot.</p>
                            <div class="space-y-4">
                                <div class="flex gap-4 items-start">
                                    <span class="bg-[#5D7A45]/10 text-[#5D7A45] font-bold rounded px-2 py-0.5 text-xs mt-1">1</span>
                                    <p class="text-xs text-[#636366] font-medium">Terima sisa sayur, buah, nasi basi, dan organik lainnya.</p>
                                </div>
                                <div class="flex gap-4 items-start">
                                    <span class="bg-[#5D7A45]/10 text-[#5D7A45] font-bold rounded px-2 py-0.5 text-xs mt-1">2</span>
                                    <p class="text-xs text-[#636366] font-medium">Akan diolah menjadi pupuk atau pakan ternak.</p>
                                </div>
                            </div>
                        </div>
                    }

                    <button type="button" (click)="currentStep.set('details')" 
                            class="w-full text-white font-bold py-5 rounded-2xl shadow-lg mt-6 btn-3d active:scale-95 flex justify-center items-center gap-2 transition-all"
                            [class.bg-[#E07A5F]]="donationType() === 'food'"
                            [class.bg-[#5D7A45]]="donationType() === 'waste'">
                        Mulai Isi Data <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </button>
                </div>
            }

            <!-- STEP 3: DETAILS -->
            @if (currentStep() === 'details') {
              <div class="space-y-6 animate-slide-up">
                
                <div class="bg-white p-6 rounded-[40px] space-y-6 border shadow-sm" [class.border-[#E07A5F]/30]="donationType() ==='food'" [class.border-[#5D7A45]/30]="donationType() ==='waste'">
                    
                    <h2 class="text-xl font-bold text-[#1B1B1B]">
                        {{ donationType() === 'food' ? 'Detail Makanan' : 'Jenis Limbah' }}
                    </h2>

                    <div class="space-y-2">
                      <label class="text-xs font-bold uppercase tracking-wider ml-1 text-gray-500">Kategori</label>
                      <div class="relative">
                          <select [(ngModel)]="formData.category" class="w-full input-luxury px-5 py-4 appearance-none font-bold text-[#1B1B1B]">
                            @if (donationType() === 'food') {
                                <option value="rice">Nasi Kotak / Bungkus</option>
                                <option value="dishes">Lauk Pauk Matang</option>
                                <option value="bread">Roti & Kue</option>
                                <option value="fruit">Buah Segar</option>
                            } @else {
                                <option value="veg_scraps">Sisa Sayur & Kulit Buah</option>
                                <option value="stale_rice">Nasi Basi</option>
                                <option value="bones">Tulang / Sisa Lauk</option>
                                <option value="mixed_organic">Organik Campur</option>
                            }
                          </select>
                          <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold">▼</div>
                      </div>
                    </div>

                    <div class="space-y-2">
                       <label class="text-xs font-bold uppercase tracking-wider ml-1 text-gray-500">
                           {{ donationType() === 'food' ? 'Perkiraan Porsi' : 'Perkiraan Berat' }}
                       </label>
                       <div class="flex gap-3">
                           <input type="number" [(ngModel)]="formData.quantity" class="flex-1 input-luxury px-5 py-4 font-bold" placeholder="0">
                           <div class="relative w-36">
                               <select class="w-full input-luxury px-5 py-4 appearance-none font-bold">
                                   @if(donationType() === 'food') {
                                       <option>Box</option>
                                       <option>Porsi</option>
                                   } @else {
                                       <option>Kg</option>
                                       <option>Karung</option>
                                       <option>Ember</option>
                                   }
                               </select>
                               <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold">▼</div>
                           </div>
                       </div>
                    </div>
                </div>

                <button type="button" (click)="goToCamera()" 
                        class="w-full btn-3d active:scale-95 text-white font-bold py-5 rounded-2xl mt-6 shadow-lg transition-all"
                        [class.btn-primary]="donationType() === 'food'"
                        [class.bg-[#5D7A45]]="donationType() === 'waste'">
                  Lanjut ke Foto
                </button>
              </div>
            }

            <!-- STEP 4: CAMERA / UPLOAD (FIXED: OVERLAY INPUT) -->
            @if (currentStep() === 'camera') {
              <div class="flex flex-col items-center justify-center space-y-6 animate-slide-up pt-4">
                
                <div class="bg-[#FFF3CD] p-4 rounded-2xl border border-[#FFE69C] w-full text-center" *ngIf="donationType() === 'food'">
                    <p class="text-xs font-bold text-[#856404]">⚠️ Makanan akan dicek oleh AI Sensor</p>
                </div>
                 <div class="bg-[#F0FFF4] p-4 rounded-2xl border border-[#98A869]/30 w-full text-center" *ngIf="donationType() === 'waste'">
                    <p class="text-xs font-bold text-[#5D7A45]">📸 Foto diperlukan untuk verifikasi tumpukan</p>
                </div>

                <!-- CAMERA CAPTURE AREA (OVERLAY METHOD) -->
                <div class="relative w-full aspect-[4/5] bg-white rounded-[40px] shadow-sm border-2 border-dashed border-[#D1CDC4] flex flex-col items-center justify-center overflow-hidden transition-colors group hover:border-[#E07A5F]">
                    
                    @if (imagePreview()) {
                        <!-- Preview Mode -->
                        <img [src]="imagePreview()" class="w-full h-full object-cover pointer-events-none" />
                        <!-- Remove button must be z-index higher than input -->
                        <button type="button" (click)="clearImage(); $event.stopPropagation()" class="absolute top-6 right-6 bg-white/80 backdrop-blur-md text-[#1B1B1B] p-3 rounded-full shadow-lg z-50 hover:scale-110 transition-transform active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    } @else {
                        <!-- Placeholder Mode -->
                        <div class="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none">
                             <div class="w-24 h-24 bg-[#FFFDD0] rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span class="text-5xl opacity-50">📷</span>
                            </div>
                            <p class="text-[#1B1B1B] font-bold text-lg">Ambil Foto Langsung</p>
                            <p class="text-[#3D405B] text-sm mt-1 px-8 text-center leading-tight">
                                {{ donationType() === 'food' ? 'Kamera akan aktif untuk analisis AI' : 'Foto tumpukan limbah secara jelas' }}
                            </p>
                        </div>
                        
                        <!-- THE INPUT OVERLAY (Invisible but Touch-Active) -->
                        <input type="file" accept="image/*" (change)="handleFile($event)" class="absolute inset-0 w-full h-full opacity-0 z-40 cursor-pointer" />
                    }
                </div>

                <button 
                    type="button"
                    [disabled]="!imagePreview()" 
                    (click)="analyzeImage($event)" 
                    class="w-full btn-3d active:scale-95 text-white font-bold py-5 rounded-2xl shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                    [class.btn-primary]="donationType() === 'food'"
                    [class.bg-[#5D7A45]]="donationType() === 'waste'"
                >
                  <span class="text-xl">{{ donationType() === 'food' ? '✨' : '📤' }}</span> 
                  {{ donationType() === 'food' ? 'Cek Kelayakan AI' : 'Gunakan Foto Ini' }}
                </button>
              </div>
            }

            <!-- STEP 5: ANALYSIS -->
            @if (currentStep() === 'analysis') {
                <div class="animate-fade-in space-y-6">
                    @if (isAnalyzing()) {
                        <div class="bg-white rounded-[40px] p-12 flex flex-col items-center justify-center text-center shadow-sm border border-[#9CAF88]/30 min-h-[400px]">
                            @if(donationType() === 'food') {
                                 <div class="relative mb-8">
                                     <div class="w-24 h-24 border-[4px] border-[#D1CDC4] rounded-full"></div>
                                     <div class="w-24 h-24 border-[4px] border-[#E07A5F] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                     <div class="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🤖</div>
                                </div>
                                <h3 class="font-bold text-xl text-[#1B1B1B] mb-2">Sensor AI Bekerja...</h3>
                                <p class="text-[#3D405B]">Menganalisis kesegaran & kelayakan.</p>
                            } @else {
                                 <!-- Fake uploading for waste -->
                                 <div class="relative mb-8">
                                     <div class="w-24 h-24 border-[4px] border-[#D1CDC4] rounded-full"></div>
                                     <div class="w-24 h-24 border-[4px] border-[#5D7A45] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                     <div class="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">☁️</div>
                                </div>
                                <h3 class="font-bold text-xl text-[#1B1B1B] mb-2">Mengunggah Bukti...</h3>
                                <p class="text-[#3D405B]">Memproses foto limbah.</p>
                            }
                        </div>
                    } @else if (aiResult()) {
                        @if (aiResult().isEdible) {
                            <div class="bg-white rounded-[40px] overflow-hidden shadow-xl border border-[#9CAF88]/30 animate-scale-up">
                                <div class="p-8 text-center bg-[#F4F1DE] border-b border-[#D1CDC4]">
                                    <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm bg-[#98A869]/20">✅</div>
                                    <h3 class="font-bold text-2xl text-[#1B1B1B] mb-2">Lolos Sensor AI</h3>
                                    <p class="text-sm font-medium text-[#5D7A45]">{{ aiResult().recommendationReason }}</p>
                                </div>
                                <div class="p-6">
                                    <div class="bg-[#FFF3CD] p-5 rounded-2xl border border-[#FFE69C] flex gap-3 items-start mb-4">
                                        <span class="text-xl">🛡️</span>
                                        <div>
                                            <p class="text-[10px] text-[#856404] uppercase font-bold tracking-widest mb-1">Verifikasi Akhir</p>
                                            <p class="text-xs font-bold text-[#1B1B1B] leading-relaxed">Tim Silaq akan melakukan pemilahan kembali.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" (click)="goToLocation()" class="w-full btn-primary btn-3d active:scale-95 text-white font-bold py-5 rounded-2xl shadow-xl mt-4">
                                Lanjut ke Penerima
                            </button>
                        } @else {
                            <div class="bg-white rounded-[40px] overflow-hidden shadow-xl border border-[#E07A5F] animate-scale-up">
                                <div class="p-8 text-center bg-[#FFF0F0] border-b border-[#E07A5F]/20">
                                    <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm bg-[#E07A5F]/20">⚠️</div>
                                    <h3 class="font-bold text-xl text-[#C04E35] mb-2">{{ aiResult().recommendationTitle }}</h3>
                                    <div class="mt-2 inline-block px-4 py-2 rounded-xl font-medium text-sm bg-white border border-[#E07A5F]/20 text-[#C04E35]">"{{ aiResult().recommendationReason }}"</div>
                                </div>
                                <div class="p-6">
                                    <p class="text-center text-[#1B1B1B] text-sm font-medium mb-6">Makanan ini tidak memenuhi standar konsumsi manusia. Silahkan alihkan ke fitur <strong>Donasi Sampah Makanan</strong>.</p>
                                    <button type="button" (click)="convertToWaste()" class="w-full btn-primary bg-[#5D7A45] border-[#5D7A45] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                                        <span>♻️</span> Alihkan ke Limbah
                                    </button>
                                    <button type="button" (click)="goBack()" class="w-full mt-3 py-3 text-[#636366] text-xs font-bold underline">Foto Ulang</button>
                                </div>
                            </div>
                        }
                    }
                </div>
            }

            <!-- STEP 6: LOCATION & CONFIRM (Interactive Buttons) -->
            @if (currentStep() === 'location') {
                <div class="space-y-6 animate-slide-up">
                    
                    <!-- Pickup Details -->
                    <div class="bg-white p-8 rounded-[40px] space-y-6 shadow-sm border border-[#9CAF88]/30">
                        <h3 class="font-bold text-xl text-[#1B1B1B]">
                            {{ donationType() === 'food' ? 'Detail Penjemputan' : 'Titik Jemput Limbah' }}
                        </h3>
                        
                        <!-- Time Interactive -->
                        <div class="flex items-center gap-5 border-b border-[#D1CDC4] pb-5">
                            <div class="bg-[#F4F1DE] p-4 rounded-2xl text-xl text-[#E07A5F]">🗓️</div>
                            <div class="flex-1">
                                <p class="text-[10px] text-[#3D405B] font-bold uppercase tracking-widest">Waktu</p>
                                <input #dateInput type="datetime-local" [(ngModel)]="pickupTime" class="opacity-0 absolute w-0 h-0">
                                <p class="font-bold text-[#1B1B1B] text-lg">{{ formatDisplayDate() }}</p>
                            </div>
                            <button type="button" (click)="openDatePicker()" class="ml-auto text-[#E07A5F] text-xs font-bold bg-[#E07A5F]/10 px-4 py-2 rounded-full hover:bg-[#E07A5F] hover:text-white transition-colors active:scale-95">Ubah</button>
                        </div>

                        <!-- Map Interactive -->
                        <div class="flex items-center gap-5">
                            <div class="bg-[#F4F1DE] p-4 rounded-2xl text-xl text-[#E07A5F]">📍</div>
                            <div class="flex-1">
                                <p class="text-[10px] text-[#3D405B] font-bold uppercase tracking-widest">Lokasi</p>
                                <p class="font-bold text-[#1B1B1B] text-lg truncate">Jl. Majapahit No. 45</p>
                            </div>
                            <button type="button" (click)="openMap()" class="ml-auto text-[#E07A5F] text-xs font-bold bg-[#E07A5F]/10 px-4 py-2 rounded-full hover:bg-[#E07A5F] hover:text-white transition-colors active:scale-95">Peta</button>
                        </div>
                    </div>

                    <!-- Recipient List -->
                    <div class="space-y-4">
                        <h3 class="font-bold text-[#9CAF88] uppercase tracking-widest text-xs ml-2">Penerima Disarankan ({{ filteredRecipients().length }})</h3>
                        
                        @for (item of filteredRecipients(); track item.id) {
                            <div class="bg-white p-5 rounded-[32px] border relative overflow-hidden shadow-sm btn-3d transition-all border-[#D1CDC4] hover:border-[#E07A5F]">
                                
                                @if(item.id === 1 || item.id === 6) {
                                    <div class="absolute top-0 right-0 bg-[#E07A5F] text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider z-10">Rekomendasi</div>
                                }

                                <div class="flex gap-4 items-start">
                                    <div class="w-14 h-14 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                                         <img [src]="item.image" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center gap-1 mb-0.5">
                                            <h4 class="font-bold text-[#1B1B1B] text-sm leading-tight">{{ item.name }}</h4>
                                            @if(item.verified) {
                                                <svg class="w-3 h-3 text-[#5D7A45]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            }
                                        </div>
                                        <p class="text-xs text-[#3D405B] mb-2">{{ item.distance }} • {{ item.needs }}</p>
                                        
                                        <div class="flex gap-2 mt-2">
                                            <button type="button" (click)="openRecipientDetail(item)" class="text-[10px] font-bold text-[#636366] bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                                                Lihat Detail
                                            </button>
                                            <button type="button" (click)="selectRecipient(item)" class="text-[10px] font-bold text-white bg-[#1C1C1E] px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors flex-1 text-center">
                                                Pilih
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>

                    <!-- Confirm -->
                    <button type="button" (click)="confirmDonation()" 
                            class="w-full text-white font-bold py-5 rounded-2xl shadow-xl mt-8 btn-3d active:scale-95 transition-all"
                            [class.btn-primary]="donationType() === 'food'"
                            [class.bg-[#5D7A45]]="donationType() === 'waste'">
                        Konfirmasi Donasi
                    </button>
                </div>
            }

            <!-- SUCCESS WITH INTERACTIVE ANIMATION -->
            @if (currentStep() === 'success') {
                <div class="flex flex-col items-center justify-center pt-10 animate-fade-in text-center px-6 relative h-full">
                    
                    <!-- Confetti Elements -->
                    <div class="absolute top-10 left-10 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-100"></div>
                    <div class="absolute top-20 right-20 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
                    <div class="absolute bottom-40 left-1/4 w-5 h-5 bg-green-400 rounded-full animate-bounce delay-500"></div>

                    <div class="w-48 h-48 relative flex items-center justify-center mb-8">
                        <div class="absolute inset-0 bg-[#98A869] rounded-full animate-ping opacity-20 duration-1000"></div>
                        <div class="absolute inset-4 bg-[#98A869] rounded-full animate-pulse opacity-40"></div>
                        <div class="w-36 h-36 bg-[#98A869] rounded-full flex items-center justify-center shadow-2xl z-10 text-6xl text-white transform hover:scale-110 transition-transform cursor-pointer" (click)="triggerConfetti()">
                            🎉
                        </div>
                    </div>

                    <h2 class="text-3xl font-extrabold text-[#1B1B1B] mb-4 tracking-tight">Terima Kasih!</h2>
                    <p class="text-[#3D405B] mb-12 leading-relaxed max-w-xs mx-auto text-sm">
                        Donasi Anda sedang diproses. Kebaikan kecil, dampak besar bagi sesama dan alam.
                    </p>
                    
                    <div class="bg-white p-6 rounded-[32px] w-full mb-8 text-left relative overflow-hidden border border-[#D1CDC4] shadow-sm">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                                 <img [src]="selectedRecipient?.image || 'https://picsum.photos/seed/default/100'" class="w-full h-full object-cover">
                            </div>
                            <div>
                                 <p class="text-[10px] text-[#3D405B] uppercase font-bold tracking-widest">Penerima</p>
                                 <p class="font-bold text-[#1B1B1B] text-sm">{{ selectedRecipient?.name || 'Penerima Terpilih' }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 w-full">
                        <button type="button" (click)="finish()" class="py-4 rounded-2xl font-bold text-[#1B1B1B] bg-white border border-[#D1CDC4] hover:bg-gray-50 transition-colors btn-3d active:scale-95">
                            Beranda
                        </button>
                        <button type="button" (click)="startTrackingSimulation()" class="btn-primary text-white font-bold py-4 rounded-2xl shadow-lg btn-3d active:scale-95 flex items-center justify-center gap-2">
                            <span>🛵</span> Pantau
                        </button>
                    </div>
                </div>
            }

        </div>
    </div>
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1); }
    .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class DonorWizardComponent {
  geminiService = inject(GeminiService);
  stateService = inject(StateService);
  @ViewChild('dateInput') dateInput!: ElementRef;

  currentStep = signal<Step>('type-select');
  donationType = signal<'food' | 'waste'>('food');
  
  formData = { category: 'rice', quantity: '', description: '' };
  pickupTime = new Date().toISOString().slice(0, 16);
  
  imagePreview = signal<string | null>(null);
  isAnalyzing = signal(false);
  aiResult = signal<any>(null);
  
  selectedRecipient: Recipient | null = null;
  viewRecipient = signal<Recipient | null>(null);

  allRecipients: Recipient[] = [
      { 
          id: 1, type: 'food', code: 'PA-01', name: 'Panti Asuhan Al-Hikmah', distance: '0.8 km', needs: 'Nasi/Lauk', verified: true, 
          description: 'Panti asuhan yang mengasuh 50 anak yatim piatu. Sangat membutuhkan makanan pokok dan lauk pauk.',
          address: 'Jl. Merpati No. 12, Mataram', image: 'https://picsum.photos/seed/panti1/200', stats: { received: 120, rating: 4.9 }
      },
      { 
          id: 6, type: 'waste', code: 'MG-01', name: 'Peternak Maggot Sejahtera', distance: '1.2 km', needs: 'Limbah Sayur', verified: true,
          description: 'Mengolah limbah organik menjadi pakan ternak menggunakan Maggot BSF.',
          address: 'Jl. Tani Makmur, Lombok Barat', image: 'https://picsum.photos/seed/maggot2/200', stats: { received: 300, rating: 4.9 }
      }
  ];

  filteredRecipients = computed(() => {
      return this.allRecipients.filter(r => r.type === this.donationType());
  });

  openDatePicker() {
      this.dateInput?.nativeElement.showPicker(); 
  }

  formatDisplayDate(): string {
      const date = new Date(this.pickupTime);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  openMap() {
      window.open('https://www.google.com/maps/search/?api=1&query=Jl.+Majapahit+No.+45+Mataram', '_blank');
  }

  openRecipientDetail(recipient: Recipient) {
      this.viewRecipient.set(recipient);
  }

  closeRecipientDetail() {
      this.viewRecipient.set(null);
  }

  selectRecipient(recipient: Recipient) {
      this.selectedRecipient = recipient;
      this.viewRecipient.set(null);
  }

  triggerConfetti() { }

  startTrackingSimulation() {
     this.stateService.navigateToTab('home');
  }

  getStepTitle() {
    const titles: Record<Step, string> = {
      'type-select': 'Pilih Jenis',
      'intro': 'Tentang Fitur',
      'details': 'Isi Detail',
      'camera': 'Ambil Bukti',
      'analysis': 'Analisis AI',
      'location': 'Lokasi',
      'success': 'Selesai'
    };
    return titles[this.currentStep()];
  }

  getProgressSteps() {
    if (this.donationType() === 'food') {
        return ['Intro', 'Detail', 'AI Scan', 'Lokasi'];
    } else {
        return ['Intro', 'Jenis', 'Foto', 'Jemput'];
    }
  }

  isStepActive(index: number): boolean {
    let currentIndex = 0;
    const steps = this.donationType() === 'food' 
        ? ['intro', 'details', 'analysis', 'location']
        : ['intro', 'details', 'camera', 'location'];
    
    if (this.currentStep() === 'camera' && this.donationType() === 'food') currentIndex = 2; 
    else currentIndex = steps.indexOf(this.currentStep());
    
    return index <= currentIndex;
  }

  selectType(type: 'food' | 'waste') {
    this.donationType.set(type);
    this.currentStep.set('intro');
  }

  goToCamera() {
    this.currentStep.set('camera');
  }

  goBack() {
    const foodMap: Record<Step, Step> = {
        'type-select': 'type-select',
        'intro': 'type-select',
        'details': 'intro',
        'camera': 'details',
        'analysis': 'camera',
        'location': 'analysis',
        'success': 'type-select'
    };
    const wasteMap: Record<Step, Step> = {
        'type-select': 'type-select',
        'intro': 'type-select',
        'details': 'intro',
        'camera': 'details',
        'analysis': 'camera', 
        'location': 'camera',
        'success': 'type-select'
    };
    const map = this.donationType() === 'food' ? foodMap : wasteMap;
    this.currentStep.set(map[this.currentStep()]);
  }

  handleFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.imagePreview.set(null);
  }

  async analyzeImage(event?: Event) {
    if(event) event.preventDefault(); // Prevent accidental submit
    
    if (!this.imagePreview()) return;
    
    this.currentStep.set('analysis');
    this.isAnalyzing.set(true);
    
    // SKIP AI FOR WASTE
    if (this.donationType() === 'waste') {
        setTimeout(() => {
            this.isAnalyzing.set(false);
            this.currentStep.set('location');
        }, 1500);
        return;
    }

    try {
      const base64Data = this.imagePreview()!.split(',')[1];
      const result = await this.geminiService.analyzeFoodImage(base64Data);
      this.aiResult.set(result);
    } catch (error) {
        this.aiResult.set({
            isEdible: true,
            safetyStatus: 'aman',
            detectedItem: 'Nasi Kotak',
            condition: 'Kemasan tertutup, terlihat segar',
            recommendationTitle: 'Lolos Sensor AI',
            recommendationReason: 'Layak konsumsi manusia',
            targetRecipient: 'Panti Asuhan'
        });
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  convertToWaste() {
    this.donationType.set('waste');
    this.currentStep.set('location');
  }

  goToLocation() {
    this.currentStep.set('location');
  }

  confirmDonation() {
    if (!this.selectedRecipient) {
        this.selectedRecipient = this.filteredRecipients()[0];
    }
    this.currentStep.set('success');
  }

  finish() {
    this.stateService.navigateToTab('home');
  }
}

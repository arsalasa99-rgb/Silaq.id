
import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { StateService } from '../services/state.service';

interface ChatMessage {
  id: number;
  text: string;
  isMe: boolean;
  time: string;
  senderName?: string; // For group chats
}

interface ChatSession {
  id: string;
  name: string;
  type: 'group' | 'expert' | 'dm' | 'admin';
  avatar: string;
  role?: string; 
  members?: number;
  status: 'online' | 'offline' | 'typing...';
  messages: ChatMessage[];
  themeColor?: string; // For UI styling
  isTransaction?: boolean; // Flag for active donation
}

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface VideoGuide {
    id: number;
    title: string;
    desc: string;
    duration: string;
    thumbnail: string;
}

type TransactionStatus = 'accepted' | 'otw' | 'arrived' | 'completed';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#E6DDC5] pb-24 relative overflow-hidden">
       
       <!-- HEADER & TABS (Hidden if Active Chat is Open) -->
       @if(!activeChat()) {
           <div class="px-6 pt-12 pb-2 bg-[#E6DDC5]/95 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-[#D1CDC4]">
             <div class="flex justify-between items-center mb-4">
                <h1 class="text-3xl font-extrabold text-[#1B1B1B]">Pusat Interaksi</h1>
                <div class="flex gap-2">
                     <button class="w-10 h-10 rounded-full bg-white border border-[#D1CDC4] flex items-center justify-center text-[#1B1B1B] shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                     </button>
                </div>
             </div>

             <!-- Segmented Control -->
             <div class="flex p-1 bg-[#D1CDC4]/30 rounded-2xl mb-2">
                <button 
                    (click)="activeTab.set('chat')"
                    class="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
                    [class.bg-[#1C1C1E]]="activeTab() === 'chat'"
                    [class.text-white]="activeTab() === 'chat'"
                    [class.text-[#3D405B]]="activeTab() !== 'chat'"
                    [class.shadow-md]="activeTab() === 'chat'"
                >
                    Diskusi & Komunitas
                </button>
                <button 
                    (click)="activeTab.set('help')"
                    class="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
                    [class.bg-[#1C1C1E]]="activeTab() === 'help'"
                    [class.text-white]="activeTab() === 'help'"
                    [class.text-[#3D405B]]="activeTab() !== 'help'"
                    [class.shadow-md]="activeTab() === 'help'"
                >
                    Bantuan & FAQ
                </button>
             </div>
           </div>
       }

       <!-- MAIN CONTENT SCROLL AREA -->
       <div class="flex-1 overflow-y-auto no-scrollbar pb-32">
            
            <!-- TAB 1: CHAT & COMMUNITY -->
            @if (activeTab() === 'chat' && !activeChat()) {
                <div class="animate-fade-in space-y-6 pt-4">
                    
                    <!-- 7 Community Groups (Horizontal Scroll) -->
                    <div class="px-0">
                        <div class="px-6 mb-3 flex justify-between items-center">
                            <h3 class="font-bold text-[#1B1B1B] text-sm uppercase tracking-wide">Komunitas (7)</h3>
                        </div>
                        <div class="flex overflow-x-auto px-6 gap-4 no-scrollbar pb-4 snap-x">
                            @for (group of communities; track group.id) {
                                <div (click)="openChat(group)" class="flex-shrink-0 w-40 snap-center relative cursor-pointer group hover:scale-105 transition-all duration-300">
                                    <div class="h-48 rounded-[24px] p-4 flex flex-col justify-between relative overflow-hidden shadow-md border border-white/20">
                                        <!-- Background Gradient -->
                                        <div class="absolute inset-0 opacity-20" [ngClass]="group.themeColor"></div>
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        
                                        <!-- Content -->
                                        <div class="relative z-10">
                                             <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30">
                                                {{ group.avatar }}
                                             </div>
                                        </div>
                                        <div class="relative z-10 text-white">
                                            <h4 class="font-bold text-sm leading-tight mb-1">{{ group.name }}</h4>
                                            <p class="text-[9px] opacity-90 bg-black/30 inline-block px-2 py-0.5 rounded-lg backdrop-blur">{{ group.members }} Member</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    <!-- 7 Experts List (Vertical) -->
                    <div class="px-6 space-y-4 pb-8">
                        <h3 class="font-bold text-[#1B1B1B] text-sm uppercase tracking-wide">Konsultasi Ahli (7)</h3>
                        
                        @for (chat of experts; track chat.id) {
                            <div (click)="openChat(chat)" class="glass-panel p-4 rounded-[24px] flex gap-4 items-center cursor-pointer hover:bg-white/60 transition-all border border-white/40 active:scale-[0.98] group">
                                <div class="relative">
                                    <img [src]="chat.avatar" class="w-14 h-14 rounded-2xl object-cover border border-white/50 shadow-sm group-hover:scale-110 transition-transform">
                                    <div class="absolute -bottom-2 -right-2 bg-[#E07A5F] text-white text-[8px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">EXPERT</div>
                                    @if(chat.status === 'online') {
                                        <div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                    }
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-bold text-[#1B1B1B] text-sm truncate">{{ chat.name }}</h4>
                                        <span class="text-[10px] font-bold text-[#3D405B]">{{ chat.messages.length > 0 ? chat.messages[chat.messages.length-1].time : 'Now' }}</span>
                                    </div>
                                    <p class="text-[10px] text-[#E07A5F] font-bold mb-0.5 uppercase tracking-wide">{{ chat.role }}</p>
                                    <p class="text-xs text-[#3D405B] truncate font-medium opacity-80">
                                        {{ chat.messages.length > 0 ? chat.messages[chat.messages.length-1].text : 'Siap membantu Anda.' }}
                                    </p>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            <!-- TAB 2: HELP & FAQ -->
            @if (activeTab() === 'help' && !activeChat()) {
                <div class="animate-fade-in space-y-8 pt-4 px-6 pb-20">
                    
                    <!-- ADMIN CHAT BUTTON -->
                    <div class="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                        <div class="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#C04E35]/20 rounded-full blur-2xl"></div>
                        <h2 class="text-xl font-bold mb-2 relative z-10">Butuh Bantuan?</h2>
                        <p class="text-sm opacity-80 mb-6 relative z-10 max-w-[80%]">Chat langsung dengan admin Silaq untuk kendala aplikasi.</p>
                        <button (click)="openChat(adminChat)" class="w-full bg-white text-[#1C1C1E] font-bold py-3.5 rounded-2xl shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 relative z-10">
                            <span>💬</span> Chat Admin Silaq
                        </button>
                    </div>

                    <!-- Video Guides -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 mb-2">
                             <div class="w-8 h-8 rounded-lg bg-[#C04E35] flex items-center justify-center text-white">▶️</div>
                             <h3 class="font-bold text-[#1B1B1B]">Video Panduan (7)</h3>
                        </div>
                        <div class="space-y-3">
                             @for (guide of videoGuides; track guide.id) {
                                 <div (click)="openVideo(guide)" class="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-[#D1CDC4] cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]">
                                    <div class="w-24 h-16 bg-gray-800 rounded-xl relative overflow-hidden flex-shrink-0">
                                        <img [src]="guide.thumbnail" class="w-full h-full object-cover opacity-80">
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                <svg class="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                        </div>
                                        <span class="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded">{{ guide.duration }}</span>
                                    </div>
                                    <div class="flex-col justify-center">
                                        <h4 class="font-bold text-xs text-[#1B1B1B] leading-tight mb-1">{{ guide.title }}</h4>
                                        <p class="text-[10px] text-[#636366] line-clamp-2">{{ guide.desc }}</p>
                                    </div>
                                </div>
                             }
                        </div>
                    </div>
                </div>
            }
       </div>

       <!-- VIDEO PLAYER OVERLAY (SIMULATION) -->
       @if (activeVideo()) {
         <div class="fixed inset-0 z-[70] bg-[#1C1C1E] flex flex-col animate-slide-up">
            <!-- Header -->
            <div class="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                <button (click)="closeVideo()" class="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
            </div>
            <!-- Video Content (Same as previous) -->
             <div class="w-full aspect-[9/16] bg-black relative flex items-center justify-center flex-1">
                <img [src]="activeVideo()?.thumbnail" class="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm">
                <div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="w-16 h-16 rounded-full bg-[#C04E35] flex items-center justify-center text-white shadow-lg animate-pulse cursor-pointer">
                        <svg class="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
            </div>
         </div>
       }

       <!-- FULL SCREEN CHAT OVERLAY -->
       @if (activeChat()) {
         <div class="fixed inset-0 z-[60] bg-[#F5F5F5] flex flex-col animate-slide-up">
            
            <!-- 1. CUSTOM HEADER FOR TRANSACTION OR STANDARD CHAT -->
            @if (activeChat()?.isTransaction && stateService.activeDonationTransaction()) {
                <!-- SPECIAL DONATION HEADER -->
                <div class="px-4 pt-safe pb-3 bg-white border-b border-[#D1CDC4] shadow-sm z-10 sticky top-0">
                    <div class="flex items-center gap-3">
                        <button (click)="closeChat()" class="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                        </button>
                        
                        <!-- Donation Summary -->
                        <div class="flex-1 flex gap-3 items-center">
                            <img [src]="stateService.activeDonationTransaction().image" class="w-10 h-10 rounded-lg object-cover border border-gray-200">
                            <div>
                                <h3 class="font-bold text-[#1B1B1B] text-sm leading-tight line-clamp-1">{{ stateService.activeDonationTransaction().title }}</h3>
                                <div class="flex items-center gap-1.5 text-[10px] text-[#636366] font-bold">
                                    <span>{{ stateService.activeDonationTransaction().donorName }}</span>
                                    <span>•</span>
                                    <span>{{ stateService.activeDonationTransaction().distance }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Status Badge (Live) -->
                        <div class="px-3 py-1 rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/20 text-[#E07A5F] text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            Live
                        </div>
                    </div>

                    <!-- Status Banner -->
                    <div class="mt-3 bg-[#1C1C1E] text-white rounded-xl p-3 flex items-center gap-3 shadow-md animate-fade-in">
                        <div class="w-8 h-8 rounded-full bg-[#BFA15F] flex items-center justify-center text-lg shadow-sm">
                            @if(transactionStatus() === 'accepted') { 🛵 }
                            @else if(transactionStatus() === 'otw') { 💨 }
                            @else if(transactionStatus() === 'arrived') { 📍 }
                            @else { ✅ }
                        </div>
                        <div class="flex-1">
                            <p class="text-xs font-bold leading-tight">
                                @if(transactionStatus() === 'accepted') { Kamu akan segera menuju lokasi. }
                                @else if(transactionStatus() === 'otw') { Kamu sedang dalam perjalanan. }
                                @else if(transactionStatus() === 'arrived') { Kamu sudah tiba di lokasi. }
                                @else { Donasi berhasil diambil. }
                            </p>
                        </div>
                    </div>
                </div>
            } @else {
                <!-- STANDARD CHAT HEADER -->
                <div class="px-4 pt-safe pb-3 bg-white border-b border-[#D1CDC4] shadow-sm flex items-center justify-between z-10 sticky top-0">
                    <div class="flex items-center gap-3">
                        <button (click)="closeChat()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                        </button>
                        <div class="relative">
                            @if(activeChat()!.type === 'group') {
                                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl border border-gray-300">
                                    {{ activeChat()!.avatar }}
                                </div>
                            } @else {
                                <img [src]="activeChat()!.avatar" class="w-10 h-10 rounded-full object-cover border border-gray-200">
                            }
                            @if(activeChat()!.status === 'online') {
                                <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                            }
                        </div>
                        <div>
                            <h3 class="font-bold text-[#1B1B1B] text-sm">{{ activeChat()!.name }}</h3>
                            <p class="text-[10px] text-[#636366] font-bold">
                                @if(activeChat()!.status === 'typing...') {
                                    <span class="text-[#C04E35] animate-pulse">sedang mengetik...</span>
                                } @else {
                                    {{ activeChat()!.type === 'group' ? activeChat()!.messages.length + ' Pesan' : activeChat()!.status }}
                                }
                            </p>
                        </div>
                    </div>
                </div>
            }

            <!-- 2. CHAT MESSAGES BODY -->
            <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5] pb-36 relative">
                <div class="absolute inset-0 opacity-[0.06] pointer-events-none" 
                     style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-size: 400px;">
                </div>

                <div class="relative z-10 text-center text-[10px] bg-white/50 backdrop-blur rounded-full px-3 py-1 inline-block mx-auto mb-4 text-gray-600 font-bold uppercase tracking-widest shadow-sm">Hari Ini</div>
                
                @for (msg of activeChat()!.messages; track msg.id) {
                    <div class="relative z-10 flex flex-col gap-1 w-full" [class.items-end]="msg.isMe" [class.items-start]="!msg.isMe">
                        @if(!msg.isMe && activeChat()!.type === 'group') {
                            <span class="text-[10px] text-[#C04E35] font-bold ml-2 mb-0.5">{{ msg.senderName }}</span>
                        }
                        <div class="max-w-[80%] rounded-2xl px-3 py-2 shadow-sm relative text-sm leading-relaxed animate-fade-in group transition-all"
                             [class.bg-[#005c4b]]="msg.isMe"
                             [class.text-white]="msg.isMe"
                             [class.bg-white]="!msg.isMe"
                             [class.text-[#1B1B1B]]="!msg.isMe"
                             [class.rounded-tr-none]="msg.isMe"
                             [class.rounded-tl-none]="!msg.isMe">
                            
                            <span>{{ msg.text }}</span>
                            
                            <!-- Metadata (Time + Check) -->
                            <div class="flex items-center justify-end gap-1 mt-1 opacity-70 select-none">
                                <span class="text-[9px] font-medium">{{ msg.time }}</span>
                                @if (msg.isMe) {
                                    <svg class="w-3 h-3 text-[#53bdeb]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>

            <!-- 3. ACTION FOOTER (Transaction vs Standard) -->
            @if (activeChat()?.isTransaction && stateService.activeDonationTransaction() && transactionStatus() !== 'completed') {
                <!-- QUICK ACTIONS FOR TRANSACTION -->
                <div class="fixed bottom-0 left-0 w-full px-4 py-4 bg-white border-t border-[#D1CDC4] pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[24px]">
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        @if (transactionStatus() === 'accepted') {
                            <button (click)="updateTransactionStatus('otw')" class="col-span-2 bg-[#1C1C1E] text-white py-4 rounded-xl font-bold shadow-lg btn-3d active:scale-95 flex items-center justify-center gap-2">
                                <span>🛵</span> Saya dalam perjalanan
                            </button>
                        } @else if (transactionStatus() === 'otw') {
                            <button (click)="updateTransactionStatus('arrived')" class="col-span-2 bg-[#BFA15F] text-white py-4 rounded-xl font-bold shadow-lg btn-3d active:scale-95 flex items-center justify-center gap-2">
                                <span>📍</span> Saya sudah tiba
                            </button>
                        } @else if (transactionStatus() === 'arrived') {
                            <button (click)="updateTransactionStatus('completed')" class="col-span-2 bg-[#5D7A45] text-white py-4 rounded-xl font-bold shadow-lg btn-3d active:scale-95 flex items-center justify-center gap-2">
                                <span>✅</span> Selesaikan Pengambilan
                            </button>
                        }
                    </div>
                    
                    <!-- Small Input (Collapsed) -->
                    <div class="flex items-center gap-2 opacity-50 focus-within:opacity-100 transition-opacity">
                         <input #chatInput type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Ketik pesan..." class="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-xs font-bold outline-none">
                         <button (click)="sendMessage()" class="p-2 bg-gray-200 rounded-lg text-gray-600 font-bold"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
                    </div>
                </div>
            } @else {
                <!-- STANDARD INPUT BAR -->
                <div class="fixed bottom-0 left-0 w-full px-2 py-2 bg-[#F0F2F5] border-t border-[#D1CDC4] pb-safe z-50 flex items-end gap-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                    <button class="mb-1.5 p-2 text-[#007AFF] hover:bg-black/5 rounded-full transition-colors active:scale-90">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                    </button>
                    <div class="flex-1 bg-white rounded-[24px] border border-transparent focus-within:border-gray-300 shadow-sm flex items-center min-h-[44px] px-4 py-2 mb-1 transition-all">
                        <input #chatInput type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Ketik pesan..." class="w-full bg-transparent border-none outline-none text-base text-[#1B1B1B] placeholder-gray-400 font-normal leading-5">
                    </div>
                    <button (click)="sendMessage()" class="mb-1.5 p-3 rounded-full text-white shadow-md transition-all active:scale-90 flex items-center justify-center" [class.bg-[#005c4b]]="newMessage.trim().length > 0" [class.bg-gray-400]="newMessage.trim().length === 0" [disabled]="!newMessage.trim()">
                        <svg class="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            }
         </div>
       }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
    .pt-safe { padding-top: env(safe-area-inset-top, 20px); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private geminiService = inject(GeminiService);
  public stateService = inject(StateService); // Public to access in template
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  activeTab = signal<'chat' | 'help'>('chat');
  activeChat = signal<ChatSession | null>(null);
  activeVideo = signal<VideoGuide | null>(null);
  newMessage = '';

  // Transaction State for the Active Donation Flow
  transactionStatus = signal<TransactionStatus>('accepted');

  // --- DATA SEEDING ---
  videoGuides: VideoGuide[] = [
      { id: 1, title: 'Cara Donasi Makanan', desc: 'Langkah mudah menyalurkan makanan berlebih agar tidak mubazir.', duration: '2:15', thumbnail: 'https://picsum.photos/seed/guide1/600/400' },
      { id: 2, title: 'Memilah Sampah Organik', desc: 'Tutorial memisahkan sampah dapur untuk diolah menjadi kompos.', duration: '3:45', thumbnail: 'https://picsum.photos/seed/guide2/600/400' },
      { id: 3, title: 'Mengenal Maggot BSF', desc: 'Apa itu Maggot BSF dan bagaimana ia membantu mengurai sampah.', duration: '5:10', thumbnail: 'https://picsum.photos/seed/guide3/600/400' },
      { id: 4, title: 'Keamanan Pangan Donasi', desc: 'Standar kebersihan dan kelayakan makanan yang diterima.', duration: '1:55', thumbnail: 'https://picsum.photos/seed/guide4/600/400' },
      { id: 5, title: 'Cara Tukar Poin Silaq', desc: 'Tukarkan poin kebaikanmu dengan berbagai hadiah menarik.', duration: '2:30', thumbnail: 'https://picsum.photos/seed/guide5/600/400' },
      { id: 6, title: 'Edukasi Eco-Enzyme', desc: 'Membuat cairan serbaguna dari kulit buah.', duration: '6:20', thumbnail: 'https://picsum.photos/seed/guide6/600/400' },
      { id: 7, title: 'Tips Packing Donasi', desc: 'Cara membungkus makanan agar aman sampai tujuan.', duration: '3:05', thumbnail: 'https://picsum.photos/seed/guide7/600/400' }
  ];

  faqs: FaqItem[] = [
      { question: 'Apakah donasi makanan dipungut biaya?', answer: 'Tidak. Donasi makanan sepenuhnya gratis. Biaya operasional kurir disubsidi oleh platform Silaq.id.', isOpen: false },
      { question: 'Makanan apa saja yang boleh didonasikan?', answer: 'Makanan layak konsumsi, higienis, halal, dan belum kadaluwarsa.', isOpen: false },
      { question: 'Siapa yang berhak menerima donasi?', answer: 'Panti asuhan, panti jompo, dan masyarakat prasejahtera yang terverifikasi.', isOpen: false },
      { question: 'Bagaimana cara mendapatkan poin?', answer: 'Poin didapatkan setiap kali Anda berhasil melakukan donasi makanan atau menyetorkan sampah organik.', isOpen: false },
      { question: 'Apakah sampah organik harus dibersihkan?', answer: 'Sebaiknya iya. Pisahkan dari plastik, karet, atau bahan non-organik lainnya agar memudahkan proses pengolahan.', isOpen: false },
      { question: 'Apakah aman berdonasi lewat aplikasi ini?', answer: 'Sangat aman. Semua penerima dan kurir telah melalui proses verifikasi ketat oleh tim Silaq.', isOpen: false },
      { question: 'Bagaimana jika kurir tidak datang?', answer: 'Anda dapat melaporkan kendala melalui fitur Chat Admin atau tombol Bantuan di profil.', isOpen: false }
  ];

  experts: ChatSession[] = [
      { id: 'e1', name: 'Dr. Ir. Suhardi', type: 'expert', role: 'Ahli Pertanian', status: 'online', avatar: 'https://3.bp.blogspot.com/-7SnHFzPdvoU/VAlcbRiRqbI/AAAAAAAAAxU/zftzZhIaqRg/s1600/suhardi.jpg', messages: [] },
      { id: 'e2', name: 'Siti Aminah, S.Gz', type: 'expert', role: 'Ahli Gizi', status: 'offline', avatar: 'https://smkn1kebumen.sch.id/wp-content/uploads/2024/07/SITI-AMINAH-S-I-Pust.jpg', messages: [] },
      { id: 'e3', name: 'Budi Santoso', type: 'expert', role: 'Pakar Maggot', status: 'online', avatar: 'https://scholar.unair.ac.id/files-asset/22319368/Prof._Dr._Budi_Santoso_dr._Sp.OG_K_.jpg/', messages: [] },
      { id: 'e4', name: 'Rina Wati', type: 'expert', role: 'Bank Sampah', status: 'online', avatar: 'https://media.licdn.com/dms/image/v2/C5103AQH4Etl8hOG5eg/profile-displayphoto-shrink_200_200-alternative/profile-displayphoto-shrink_200_200-alternative/0/1556452179720?e=2147483647&v=beta&t=Ql0s--8A6xOTLq--U9OZ2OYxvrieJzxsN7_VbERguvI', messages: [] },
      { id: 'e5', name: 'Dr. H. Ahmad', type: 'expert', role: 'Tokoh Agama', status: 'offline', avatar: 'https://pas.org.my/wp-content/uploads/2020/01/TGHH1-600x700.jpg', messages: [] },
      { id: 'e6', name: 'Ir. Wayan Gede', type: 'expert', role: 'Teknik Kompos', status: 'online', avatar: 'https://sakti.unmas.ac.id/dosen/gmtVgdZjiMeDpLzBnA6MsrIxJFzYgfsctSrMgsa8.jpg', messages: [] },
      { id: 'e7', name: 'Lina Marlina', type: 'expert', role: 'Eco Enzyme', status: 'online', avatar: 'https://teraspapua.com/wp-content/uploads/2023/05/IMG_8064.jpg', messages: [] }
  ];

  communities: ChatSession[] = [
    { id: 'c1', name: 'Petani Kompos Lombok', type: 'group', members: 245, avatar: '🌱', themeColor: 'bg-green-500', status: 'online', messages: [] },
    { id: 'c2', name: 'Juragan Maggot BSF', type: 'group', members: 128, avatar: '🐛', themeColor: 'bg-orange-500', status: 'online', messages: [] },
    { id: 'c3', name: 'Relawan Nasi Bungkus', type: 'group', members: 512, avatar: '🍛', themeColor: 'bg-red-500', status: 'online', messages: [] },
    { id: 'c4', name: 'Bank Sampah Mataram', type: 'group', members: 320, avatar: '♻️', themeColor: 'bg-blue-500', status: 'online', messages: [] },
    { id: 'c5', name: 'Urban Farming NTB', type: 'group', members: 150, avatar: '🏡', themeColor: 'bg-emerald-500', status: 'online', messages: [] },
    { id: 'c6', name: 'Sedekah Jumat Berkah', type: 'group', members: 890, avatar: '🕌', themeColor: 'bg-yellow-500', status: 'online', messages: [] },
    { id: 'c7', name: 'Info Loker Pertanian', type: 'group', members: 410, avatar: '📢', themeColor: 'bg-purple-500', status: 'online', messages: [] }
  ];

  adminChat: ChatSession = {
      id: 'admin', name: 'Admin Silaq.id', type: 'admin', role: 'Support', status: 'online',
      avatar: 'https://i.ibb.co.com/3yxkQcLd/Gemini-Generated-Image-lwzr1ylwzr1ylwzr-1-removebg-preview.png',
      messages: [
          { id: 1, text: 'Halo! Ada yang bisa kami bantu seputar aplikasi Silaq?', isMe: false, time: 'Now' }
      ]
  };

  ngOnInit() {
      // Pre-fill initial chat messages for experts
      this.experts[0].messages = [{ id: 1, text: "Halo, ada yang bisa saya bantu soal pertanian?", isMe: false, time: "09:00" }];

      // CHECK FOR ACTIVE TRANSACTION FROM HOME COMPONENT
      this.checkForActiveTransaction();
  }

  checkForActiveTransaction() {
      const transaction = this.stateService.activeDonationTransaction();
      if (transaction) {
          // Initialize a temporary Chat Session for this transaction
          this.initTransactionChat(transaction);
      }
  }

  initTransactionChat(transaction: any) {
      const session: ChatSession = {
          id: `trans-${transaction.id}`,
          name: transaction.donorName,
          type: 'dm',
          avatar: transaction.avatar,
          status: 'online',
          isTransaction: true,
          messages: [
              // AUTOMATIC FIRST MESSAGE
              {
                  id: Date.now(),
                  text: `Halo ${transaction.donorName}, saya sudah mengambil donasi ${transaction.title}. Saya akan segera menuju lokasi. Terima kasih.`,
                  isMe: true,
                  time: 'Now'
              }
          ]
      };
      
      this.activeChat.set(session);
      this.transactionStatus.set('accepted');
      this.scrollToBottom();
  }

  // UPDATE STATUS VIA QUICK BUTTONS
  updateTransactionStatus(status: TransactionStatus) {
      this.transactionStatus.set(status);
      
      let msgText = '';
      if (status === 'otw') msgText = 'Saya sedang dalam perjalanan menuju lokasi.';
      else if (status === 'arrived') msgText = 'Saya sudah tiba di lokasi penjemputan.';
      else if (status === 'completed') msgText = 'Terima kasih, donasi sudah saya terima dengan baik.';

      // Add user message automatically
      if (this.activeChat()) {
          this.activeChat()!.messages.push({
              id: Date.now(),
              text: msgText,
              isMe: true,
              time: 'Now'
          });
          this.scrollToBottom();

          // If completed, close active transaction after delay
          if (status === 'completed') {
              setTimeout(() => {
                  this.activeChat.set(null);
                  this.stateService.activeDonationTransaction.set(null); // Clear global state
                  alert('Transaksi Selesai. Poin bertambah!');
              }, 2000);
          }
      }
  }

  // --- ACTIONS ---

  openChat(chat: ChatSession) {
    this.activeChat.set(chat);
    if (chat.type === 'group' && chat.messages.length === 0) {
        this.generateDummyCommunityMessages(chat);
    }
    this.scrollToBottom();
    setTimeout(() => this.chatInput?.nativeElement.focus(), 100);
  }

  closeChat() {
    this.activeChat.set(null);
  }

  openVideo(guide: VideoGuide) {
      this.activeVideo.set(guide);
  }

  closeVideo() {
      this.activeVideo.set(null);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.activeChat()) return;

    const currentChat = this.activeChat()!;
    const userMsgText = this.newMessage;

    const newMsg: ChatMessage = {
        id: Date.now(),
        text: userMsgText,
        isMe: true,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    currentChat.messages.push(newMsg);
    this.newMessage = '';
    this.scrollToBottom();

    // AI Response logic (Only for non-transaction chats or if we want AI during transaction too)
    // For transaction mode, we might skip AI or make it simple acknowledgments.
    if (!currentChat.isTransaction) {
        currentChat.status = 'typing...';
        
        let role: 'expert' | 'admin' | 'community';
        let contextName = '';

        if (currentChat.type === 'expert') {
            role = 'expert';
            contextName = currentChat.role || 'Pakar';
        } else if (currentChat.type === 'admin') {
            role = 'admin';
            contextName = 'admin';
        } else { 
            role = 'community';
            contextName = currentChat.name; 
        }

        const aiResponse = await this.geminiService.chatWithBot(userMsgText, role, contextName);
        currentChat.status = 'online';
        
        const senderName = currentChat.type === 'group' 
            ? ["Budi", "Asep", "Siti", "Wayan", "Lalu", "Baiq"][Math.floor(Math.random() * 6)] 
            : undefined;

        currentChat.messages.push({
            id: Date.now() + 1,
            text: aiResponse,
            isMe: false,
            senderName: senderName,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
        this.scrollToBottom();
    }
  }

  generateDummyCommunityMessages(chat: ChatSession) {
      const names = ["Ahmad", "Siti", "Budi", "Lina", "Wayan", "Lalu", "Baiq", "Putu", "Made", "Dian"];
      const contents = ["Info maggot ready?", "Ada yang punya sisa sayur?", "Siap jemput donasi", "Terima kasih", "Lokasi?", "Cek wa", "Mantap", "Barokallah"];
      
      const msgs: ChatMessage[] = [];
      for (let i = 0; i < 20; i++) {
          msgs.push({
              id: i,
              text: contents[Math.floor(Math.random() * contents.length)],
              isMe: false,
              senderName: names[Math.floor(Math.random() * names.length)],
              time: '09:00'
          });
      }
      chat.messages = msgs;
  }

  toggleFaq(index: number) {
      this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}

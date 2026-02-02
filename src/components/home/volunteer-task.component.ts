
import { Component, signal, output, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TaskStatus = 'available' | 'accepted' | 'otw_pickup' | 'pickup_arrived' | 'goods_loaded' | 'otw_delivery' | 'arrived_dest' | 'proof' | 'done';

@Component({
  selector: 'app-volunteer-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 relative overflow-hidden min-h-[420px] transition-all duration-500">
        <!-- Decorative Header -->
        <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#FFFDF5] to-transparent pointer-events-none"></div>
        <div class="absolute top-0 right-0 w-32 h-32 bg-[#5D7A45]/5 rounded-bl-[100px] pointer-events-none"></div>

        <div class="relative z-10">
            
            <!-- HEADER -->
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-extrabold text-[#1B1B1B]">Misi Kebaikan</h3>
                    <p class="text-[11px] text-[#636366] font-medium mt-1">
                        {{ getHeaderSubtitle() }}
                    </p>
                </div>
                <div class="w-10 h-10 bg-[#5D7A45]/10 rounded-full flex items-center justify-center text-xl text-[#5D7A45] shadow-sm animate-pulse-slow">
                    🤝
                </div>
            </div>

            <!-- STATE 1: AVAILABLE TASKS LIST -->
            @if (status() === 'available') {
                <div class="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar pr-1 pb-2">
                    @for (task of availableTasks; track task.id) {
                        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-[#5D7A45] hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]" (click)="acceptTask(task)">
                            <div class="flex justify-between items-start mb-2">
                                <span class="bg-[#BFA15F]/10 text-[#BFA15F] px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                    {{ task.type === 'food' ? 'Makanan' : 'Limbah' }}
                                </span>
                                <span class="text-[10px] font-bold text-gray-400">{{ task.distance }}</span>
                            </div>
                            <h4 class="font-bold text-[#1C1C1E] text-sm mb-1">{{ task.title }}</h4>
                            <p class="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {{ task.location }}
                            </p>
                            
                            <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                                <div class="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                                    <img [src]="task.donorAvatar" class="w-full h-full object-cover">
                                </div>
                                <span class="text-[10px] font-medium text-gray-600">{{ task.donorName }}</span>
                                <button class="ml-auto bg-[#1C1C1E] text-white text-[10px] font-bold px-4 py-2 rounded-xl group-hover:bg-[#5D7A45] transition-colors shadow-sm">
                                    Ambil Misi
                                </button>
                            </div>
                        </div>
                    }
                </div>
            }

            <!-- STATE 2+: ACTIVE MISSION STEPS -->
            @if (status() !== 'available' && status() !== 'done') {
                <div class="animate-slide-up">
                    
                    <!-- PROGRESS STEPPER -->
                    <div class="flex items-center justify-between mb-4 px-2 relative">
                        <div class="absolute top-1/2 left-2 right-2 h-0.5 bg-gray-200 -z-10"></div>
                        <!-- Step 1: Pickup -->
                        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors duration-300 z-10"
                             [class.bg-[#5D7A45]]="stepProgress() >= 1" [class.text-white]="stepProgress() >= 1"
                             [class.bg-white]="stepProgress() < 1" [class.border-[#5D7A45]]="stepProgress() >= 1">1</div>
                        <!-- Step 2: Load -->
                        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors duration-300 z-10"
                             [class.bg-[#5D7A45]]="stepProgress() >= 2" [class.text-white]="stepProgress() >= 2"
                             [class.bg-white]="stepProgress() < 2" [class.border-gray-300]="stepProgress() < 2" [class.border-[#5D7A45]]="stepProgress() >= 2">2</div>
                        <!-- Step 3: Delivery -->
                        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors duration-300 z-10"
                             [class.bg-[#5D7A45]]="stepProgress() >= 3" [class.text-white]="stepProgress() >= 3"
                             [class.bg-white]="stepProgress() < 3" [class.border-gray-300]="stepProgress() < 3" [class.border-[#5D7A45]]="stepProgress() >= 3">3</div>
                    </div>

                    <!-- MAP VISUALIZATION -->
                    <div class="w-full h-28 bg-gray-100 rounded-2xl mb-4 relative overflow-hidden border border-gray-200 shadow-inner group">
                        <div class="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')] bg-cover bg-center filter grayscale group-hover:grayscale-0 transition-all"></div>
                        
                        <!-- Route Line -->
                        <div class="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-300 border-t border-dashed border-gray-400"></div>
                        
                        <!-- Motorbike Icon -->
                        <div class="absolute top-1/2 -mt-5 w-10 h-10 bg-[#5D7A45] rounded-full border-2 border-white shadow-lg z-20 flex items-center justify-center text-lg transition-all duration-700 ease-in-out"
                             [style.left.%]="mapProgress()">
                            🛵
                        </div>
                        <div class="absolute top-1/2 -mt-4 right-4 w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow z-10 flex items-center justify-center text-white text-xs font-bold">📍</div>
                    </div>

                    <!-- DONOR INFO & CHAT TOGGLE -->
                    <div class="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <img [src]="activeTask?.donorAvatar" class="w-10 h-10 rounded-full object-cover border border-white shadow-sm">
                        <div class="flex-1">
                            <h4 class="font-bold text-sm text-[#1C1C1E]">{{ activeTask?.donorName }}</h4>
                            <p class="text-[10px] text-gray-500">{{ activeTask?.title }}</p>
                        </div>
                        <button (click)="toggleChat()" class="p-2 bg-white rounded-xl border border-gray-200 text-[#5D7A45] hover:bg-[#5D7A45] hover:text-white transition-colors relative shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            @if(!isChatOpen() && hasUnread()) {
                                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                            }
                        </button>
                    </div>

                    <!-- CHAT OVERLAY -->
                    @if (isChatOpen()) {
                        <div class="mb-4 bg-white border border-[#D1CDC4] rounded-2xl overflow-hidden shadow-md animate-scale-in">
                            <div class="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                                <span class="text-[10px] font-bold text-gray-500 uppercase">Chat dengan Pendonasi</span>
                                <button (click)="toggleChat()" class="text-gray-400 hover:text-red-500">✕</button>
                            </div>
                            <div class="h-32 overflow-y-auto p-3 space-y-2 bg-[#F5F5F5]">
                                @for (msg of chatMessages(); track $index) {
                                    <div class="flex" [class.justify-end]="msg.isMe">
                                        <div class="max-w-[85%] px-3 py-1.5 rounded-xl text-[10px]" 
                                             [class.bg-[#5D7A45]]="msg.isMe" [class.text-white]="msg.isMe"
                                             [class.bg-white]="!msg.isMe" [class.text-gray-800]="!msg.isMe" [class.shadow-sm]="!msg.isMe">
                                            {{ msg.text }}
                                        </div>
                                    </div>
                                }
                            </div>
                            <div class="p-2 bg-white flex gap-2 border-t border-gray-100">
                                <input type="text" [(ngModel)]="chatInput" (keyup.enter)="sendMessage()" placeholder="Ketik pesan..." class="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#5D7A45] transition-all">
                                <button (click)="sendMessage()" class="bg-[#1C1C1E] text-white p-2 rounded-lg hover:bg-[#5D7A45] transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                </button>
                            </div>
                        </div>
                    }

                    <!-- PROOF UPLOAD (Final Step - FIXED OVERLAY) -->
                    @if (status() === 'proof') {
                        <div class="animate-slide-up text-center mb-4">
                            <div class="w-full aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-[#5D7A45]/30 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-[#5D7A45]/5 transition-colors">
                                @if (proofImage()) {
                                    <img [src]="proofImage()" class="w-full h-full object-cover pointer-events-none">
                                    <button (click)="proofImage.set(null); $event.stopPropagation()" class="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur z-50">✕</button>
                                } @else {
                                    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                                        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-xl text-[#5D7A45]">📸</div>
                                        <p class="text-xs font-bold text-gray-500">Foto Bukti Serah Terima</p>
                                        <p class="text-[9px] text-gray-400 mt-1">Pastikan barang terlihat jelas</p>
                                    </div>
                                    <!-- OVERLAY INPUT -->
                                    <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 z-40 cursor-pointer" (change)="handleFile($event)">
                                }
                            </div>
                        </div>
                    }

                    <!-- ACTION BUTTONS -->
                    <div class="space-y-2">
                        @if (status() === 'accepted') {
                            <button (click)="setStatus('otw_pickup')" class="w-full btn-primary bg-[#1C1C1E] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                <span>🛵</span> Menuju Lokasi Pickup
                            </button>
                        } @else if (status() === 'otw_pickup') {
                            <button (click)="setStatus('pickup_arrived')" class="w-full btn-primary bg-[#BFA15F] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                <span>📍</span> Saya Sudah Sampai
                            </button>
                        } @else if (status() === 'pickup_arrived') {
                            <button (click)="setStatus('goods_loaded')" class="w-full btn-primary bg-[#5D7A45] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                <span>📦</span> Konfirmasi Barang Diambil
                            </button>
                        } @else if (status() === 'goods_loaded') {
                            <button (click)="setStatus('otw_delivery')" class="w-full btn-primary bg-[#1C1C1E] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                <span>🚀</span> Mulai Pengantaran
                            </button>
                        } @else if (status() === 'otw_delivery') {
                            <button (click)="setStatus('arrived_dest')" class="w-full btn-primary bg-[#BFA15F] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                <span>🏁</span> Sampai di Tujuan
                            </button>
                        } @else if (status() === 'arrived_dest') {
                            <button (click)="setStatus('proof')" class="w-full btn-primary bg-[#5D7A45] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                <span>📸</span> Upload Bukti
                            </button>
                        } @else if (status() === 'proof') {
                            <button [disabled]="!proofImage()" (click)="finishTask()" class="w-full btn-primary bg-[#1C1C1E] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none">
                                <span>✅</span> Selesaikan Misi
                            </button>
                        }

                        @if (status() !== 'proof') {
                            <button (click)="cancelTask()" class="w-full py-2 text-[10px] text-gray-400 font-bold hover:text-red-500 transition-colors">
                                Batalkan Misi
                            </button>
                        }
                    </div>
                </div>
            }

            <!-- STATE: DONE -->
            @if (status() === 'done') {
                <div class="animate-scale-in text-center py-6">
                    <div class="w-20 h-20 bg-[#E0F2F1] rounded-full flex items-center justify-center text-4xl mb-3 mx-auto animate-bounce">
                        🎉
                    </div>
                    <h3 class="font-extrabold text-xl text-[#1C1C1E] mb-1">Misi Selesai!</h3>
                    <p class="text-xs text-gray-600 mb-6">Terima kasih telah menjadi jembatan kebaikan hari ini.</p>
                    
                    <div class="bg-[#FFFDF5] border border-[#BFA15F]/20 p-3 rounded-xl mb-6">
                        <p class="text-[#BFA15F] font-bold text-base">+150 Poin</p>
                        <p class="text-[9px] text-gray-400 uppercase tracking-widest">Reward Relawan</p>
                    </div>

                    <button (click)="reset()" class="w-full bg-[#1C1C1E] text-white py-3.5 rounded-xl font-bold shadow-lg text-sm">
                        Cari Misi Baru
                    </button>
                </div>
            }

        </div>
    </div>
  `,
  styles: [`
    .animate-pulse-slow { animation: pulse 3s infinite; }
    .animate-slide-up { animation: slideUp 0.4s ease-out; }
    .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class VolunteerTaskComponent implements OnDestroy {
  
  status = signal<TaskStatus>('available');
  activeTask: any = null;
  mapProgress = signal(10); // 10% (start) to 90% (end)
  proofImage = signal<string | null>(null);
  
  // Chat State
  isChatOpen = signal(false);
  hasUnread = signal(false);
  chatInput = '';
  chatMessages = signal<{text: string, isMe: boolean}[]>([]);
  chatTimer: any;

  availableTasks = [
      { id: 1, type: 'food', title: '5 Nasi Kotak Sisa Rapat', distance: '0.8 km', location: 'Kantor Gubernur NTB', donorName: 'Budi Santoso', donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
      { id: 2, type: 'waste', title: '1 Ember Kulit Buah', distance: '1.2 km', location: 'Warung Jus Segar', donorName: 'Siti Aminah', donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
      { id: 3, type: 'food', title: '10 Roti Bakery (Layak)', distance: '2.5 km', location: 'BreadTalk Mataram', donorName: 'Manager Toko', donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager' }
  ];

  getHeaderSubtitle() {
      if (this.status() === 'available') return 'Pilih donasi yang ingin Anda jemput.';
      if (this.status() === 'done') return 'Misi selesai.';
      return 'Misi Aktif';
  }

  // Step logic for progress bar
  stepProgress() {
      const s = this.status();
      if (['available', 'accepted', 'otw_pickup'].includes(s)) return 0;
      if (['pickup_arrived', 'goods_loaded'].includes(s)) return 1;
      if (['otw_delivery', 'arrived_dest'].includes(s)) return 2;
      return 3;
  }

  acceptTask(task: any) {
      if(confirm('Ambil misi kebaikan ini? Anda harus segera menuju lokasi.')) {
          this.activeTask = task;
          this.status.set('accepted');
          this.mapProgress.set(10);
          
          // Reset Chat
          this.chatMessages.set([
              { text: `Halo kak, terima kasih sudah mengambil misi ini. Saya di ${task.location}.`, isMe: false }
          ]);
          this.hasUnread.set(true);
      }
  }

  setStatus(newStatus: TaskStatus) {
      this.status.set(newStatus);
      
      // Simulation Logic
      if (newStatus === 'otw_pickup') {
          this.simulateMovement(10, 45); // Move to pickup
      } else if (newStatus === 'pickup_arrived') {
          this.mapProgress.set(45);
      } else if (newStatus === 'otw_delivery') {
          this.simulateMovement(50, 90); // Move to dest
      } else if (newStatus === 'arrived_dest') {
          this.mapProgress.set(90);
      }
  }

  simulateMovement(start: number, end: number) {
      this.mapProgress.set(start);
      const interval = setInterval(() => {
          this.mapProgress.update(p => {
              if (p >= end) {
                  clearInterval(interval);
                  return end;
              }
              return p + 1;
          });
      }, 50);
  }

  // CHAT LOGIC
  toggleChat() {
      this.isChatOpen.update(v => !v);
      if (this.isChatOpen()) this.hasUnread.set(false);
  }

  sendMessage() {
      if (!this.chatInput.trim()) return;
      
      this.chatMessages.update(msgs => [...msgs, { text: this.chatInput, isMe: true }]);
      this.chatInput = '';

      // Simulate donor reply
      if (this.chatTimer) clearTimeout(this.chatTimer);
      this.chatTimer = setTimeout(() => {
          this.chatMessages.update(msgs => [...msgs, { text: 'Oke kak, hati-hati di jalan ya.', isMe: false }]);
          if (!this.isChatOpen()) this.hasUnread.set(true);
      }, 2000);
  }

  cancelTask() {
      if(confirm('Batalkan misi ini?')) {
          this.reset();
      }
  }

  handleFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.proofImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  finishTask() {
      this.status.set('done');
  }

  reset() {
      this.status.set('available');
      this.activeTask = null;
      this.mapProgress.set(10);
      this.proofImage.set(null);
      this.chatMessages.set([]);
  }

  ngOnDestroy() {
      if (this.chatTimer) clearTimeout(this.chatTimer);
  }
}

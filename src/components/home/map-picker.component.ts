
import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in flex flex-col h-[70vh]">
            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <h3 class="font-bold text-[#1C1C1E]">Pilih Lokasi Jemput</h3>
                <button (click)="onClose.emit()" class="p-2 hover:bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="flex-1 relative bg-gray-100 cursor-crosshair group" (click)="pickLocation($event)">
                 <!-- Simulated Map View -->
                 <div class="absolute inset-0 opacity-40" 
                      style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png'); background-size: cover; background-position: center; filter: grayscale(100%);">
                 </div>
                 <div class="absolute inset-0 bg-[url('https://i.ibb.co.com/84j3z0F/map-pattern.png')] opacity-30"></div>
                 
                 <!-- Center Pin -->
                 <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center">
                      <div class="w-10 h-10 bg-[#E07A5F] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white animate-bounce">
                          📍
                      </div>
                      <div class="bg-white px-3 py-1 rounded-full shadow-md text-[10px] font-bold mt-1">Geser Peta</div>
                 </div>
            </div>
            <div class="p-5 bg-white border-t border-gray-100">
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Lokasi Terpilih</p>
                <p class="font-bold text-[#1C1C1E] text-sm mb-4">{{ tempLocation() || 'Geser peta untuk memilih...' }}</p>
                <button (click)="confirm()" class="w-full btn-primary bg-[#1C1C1E] text-white py-3 rounded-xl font-bold">
                    Pilih Lokasi Ini
                </button>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class MapPickerComponent {
  onClose = output<void>();
  onSelect = output<string>();

  tempLocation = signal('');

  pickLocation(event: MouseEvent) {
      // Simulate picking a location based on click (randomly for demo)
      const locations = [
          "Jl. Gajah Mada No. 12, Mataram",
          "Jl. Pejanggik No. 5, Mataram",
          "Jl. Udayana No. 88, Mataram",
          "Jl. Sriwijaya No. 100, Mataram",
          "Jl. Majapahit No. 45, Mataram"
      ];
      this.tempLocation.set(locations[Math.floor(Math.random() * locations.length)]);
  }

  confirm() {
      if (this.tempLocation()) {
          this.onSelect.emit(this.tempLocation());
      }
      this.onClose.emit();
  }
}

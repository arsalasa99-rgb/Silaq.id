
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipient-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col min-h-screen bg-[#E6DDC5] pb-32">
        <!-- Header -->
        <div class="px-6 pt-12 pb-4 bg-[#E6DDC5] sticky top-0 z-30">
            <h1 class="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">Peta Donasi</h1>
            <p class="text-sm text-[#3D405B] font-medium">Temukan donasi di sekitar Anda.</p>
        </div>
        
        <!-- Map Container -->
        <div class="flex-1 px-6 relative">
            <div class="w-full h-[65vh] bg-white rounded-[32px] overflow-hidden shadow-xl border border-gray-100 relative group">
                <!-- Simulated Map -->
                <div class="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')] bg-cover bg-center opacity-30"></div>
                
                <!-- Pins -->
                @for (pin of donorPins; track pin.id) {
                    <div class="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md border-2 border-[#E07A5F] flex items-center justify-center text-lg animate-bounce cursor-pointer hover:scale-110 transition-transform z-20"
                            [style.top.%]="pin.y" 
                            [style.left.%]="pin.x"
                            (click)="selectDonorPin(pin)">
                        {{ pin.type === 'food' ? '🍛' : '♻️' }}
                    </div>
                }
                
                <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-[#1C1C1E] z-10 border border-white/50">
                    {{ donorPins.length }} Donasi Tersedia
                </div>
            </div>
            
            <!-- Selected Pin Detail (Card) -->
            @if (selectedPin()) {
                <div class="absolute bottom-4 left-6 right-6 bg-white rounded-[24px] p-5 shadow-2xl animate-slide-up border border-[#E07A5F]">
                    <div class="flex justify-between items-start mb-2">
                        <span class="bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">{{ selectedPin()?.type === 'food' ? 'Makanan' : 'Limbah' }}</span>
                        <button (click)="selectedPin.set(null)" class="text-gray-400 font-bold">✕</button>
                    </div>
                    <h3 class="font-bold text-[#1C1C1E] text-base">{{ selectedPin()?.title }}</h3>
                    <p class="text-xs text-gray-500 mb-3">{{ selectedPin()?.location }}</p>
                    <button class="w-full btn-primary bg-[#1C1C1E] text-white py-3 rounded-xl font-bold text-xs shadow-lg">
                        Ambil Donasi Ini
                    </button>
                </div>
            }
        </div>
    </div>
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class RecipientMapComponent {
  // RECIPIENT MODE DATA: Donor Pins
  donorPins = [
      { id: 1, type: 'food', x: 20, y: 30, title: '5 Nasi Bungkus', location: 'Jl. Merdeka' },
      { id: 2, type: 'waste', x: 50, y: 50, title: 'Sisa Sayur Pasar', location: 'Pasar Pagesangan' },
      { id: 3, type: 'food', x: 70, y: 25, title: 'Roti Sisa Toko', location: 'Mataram Mall' },
      { id: 4, type: 'waste', x: 40, y: 80, title: 'Kulit Buah Jus', location: 'Gomong' }
  ];
  
  selectedPin = signal<any>(null);

  selectDonorPin(pin: any) {
      this.selectedPin.set(pin);
  }
}

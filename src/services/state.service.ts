
import { Injectable, signal } from '@angular/core';

export type AppFlow = 'splash' | 'onboarding' | 'auth' | 'main';
export type MainTab = 'home' | 'donate' | 'education' | 'chat' | 'profile';

export interface User {
  name: string;
  email: string;
  type: 'donor' | 'recipient' | 'expert' | 'admin';
  avatar?: string;
  password?: string;
  // Recipient Specific Details
  recipientDetails?: {
      nik?: string;
      organization?: string;
      vehicleType?: string;
      plateNumber?: string;
      address?: string;
      isVerified?: boolean;
  };
  stats: {
    donated: number;
    wasteProcessed: number;
    points: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Application Flow State
  readonly currentFlow = signal<AppFlow>('splash');
  readonly activeTab = signal<MainTab>('home');
  
  // User State
  readonly currentUser = signal<User | null>(null);

  // Active Transaction State (For "Ambil Donasi" flow)
  readonly activeDonationTransaction = signal<any | null>(null);

  constructor() {
    // Initialization handled in finishSplash now to show splash screen first
  }

  finishSplash() {
    // 1. Check if user is already logged in
    const storedUser = localStorage.getItem('silaq_active_user');
    if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
        this.currentFlow.set('main');
        return;
    }

    // 2. Check if user has visited before (Onboarding check)
    const visited = localStorage.getItem('silaq_visited');
    if (visited) {
      this.currentFlow.set('auth');
    } else {
      this.currentFlow.set('onboarding');
    }
  }

  completeOnboarding() {
    localStorage.setItem('silaq_visited', 'true');
    this.currentFlow.set('auth');
  }

  register(name: string, email: string, password: string, type: 'donor' | 'recipient', details?: any) {
    const newUser: User = {
        name, 
        email, 
        password, // Demo only
        type, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        recipientDetails: details,
        stats: { donated: 0, wasteProcessed: 0, points: 0 }
    };

    // Save to list of users
    const users = this.getUsers();
    users.push(newUser);
    localStorage.setItem('silaq_users', JSON.stringify(users));

    // Auto login
    this.setActiveUser(newUser);
  }

  login(email: string, password: string): boolean {
    // BACKDOOR: If empty credentials, login as Admin
    if (!email && !password) {
        const adminUser: User = {
            name: 'Silaq Admin',
            email: 'admin@silaq.id',
            type: 'admin',
            avatar: 'https://i.ibb.co.com/XZYPKfVc/Gemini-Generated-Image-m7jh8em7jh8em7jh-1.png',
            stats: { donated: 999, wasteProcessed: 9999, points: 999999 }
        };
        this.setActiveUser(adminUser);
        return true;
    }

    // Regular Login
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        this.setActiveUser(user);
        return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('silaq_active_user');
    
    // Reset visited flag so flow goes Splash -> Onboarding -> Auth
    localStorage.removeItem('silaq_visited'); 
    
    this.currentFlow.set('splash');
    this.activeTab.set('home');
    this.activeDonationTransaction.set(null);
  }

  navigateToTab(tab: MainTab) {
    this.activeTab.set(tab);
  }

  // Helper Methods
  private getUsers(): User[] {
    const usersJson = localStorage.getItem('silaq_users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private setActiveUser(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('silaq_active_user', JSON.stringify(user));
    this.currentFlow.set('main');
    this.activeTab.set('home');
  }
}

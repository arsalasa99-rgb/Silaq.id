import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';
import { SplashComponent } from './components/splash.component';
import { OnboardingComponent } from './components/onboarding.component';
import { AuthComponent } from './components/auth.component';
import { HomeComponent } from './components/home.component';
import { DonateComponent } from './components/donate.component';
import { EducationComponent } from './components/education.component';
import { ChatComponent } from './components/chat.component';
import { ProfileComponent } from './components/profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    SplashComponent,
    OnboardingComponent, 
    AuthComponent,
    HomeComponent,
    DonateComponent,
    EducationComponent,
    ChatComponent,
    ProfileComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  stateService = inject(StateService);
  
  flow = this.stateService.currentFlow;
  activeTab = this.stateService.activeTab;

  selectTab(tab: any) {
    this.stateService.navigateToTab(tab);
  }
}
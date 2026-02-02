
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';
import { RecipientWizardComponent } from './donate/recipient-wizard.component';
import { DonorWizardComponent } from './donate/donor-wizard.component';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, RecipientWizardComponent, DonorWizardComponent],
  template: `
    <!-- MAIN CONTAINER -->
    <div class="h-full bg-[#E6DDC5] relative">
      @if (user()?.type === 'recipient') {
          <app-recipient-wizard></app-recipient-wizard>
      } @else {
          <app-donor-wizard></app-donor-wizard>
      }
    </div>
  `
})
export class DonateComponent {
  stateService = inject(StateService);
  user = this.stateService.currentUser;
}

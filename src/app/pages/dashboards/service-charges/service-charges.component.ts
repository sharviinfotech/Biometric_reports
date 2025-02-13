import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-charges',
  templateUrl: './service-charges.component.html',
  styleUrls: ['./service-charges.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule,],
      standalone: true
})
export class ServiceChargesComponent {
  chargesForm: FormGroup;
  savedCharges: string[] = [];
  isTableVisible: boolean = false;  // Initially hide the table

  constructor(private fb: FormBuilder) {
    // Initialize the form with 'chargesName' field
    this.chargesForm = this.fb.group({
      chargesName: ['']
    });
  }

  saveData() {
    const chargeValue = this.chargesForm.get('chargesName')?.value;
    
    if (chargeValue.trim() !== '') { // Ensure non-empty value
      this.savedCharges.push(chargeValue);
      this.chargesForm.reset(); // Reset form after saving
      this.isTableVisible = true; // Show table only when Save is clicked
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-biometricreports',
  templateUrl: './biometricreports.component.html',
  styleUrl: './biometricreports.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,BsDatepickerModule],
  standalone: true,
})
export class BiometricreportsComponent {

  ngOnInit(){
    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');
    document.body.setAttribute("data-topbar", "dark");
  }
  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  years: number[] = [];
  selectedMonth: number = new Date().getMonth() + 1; // Fix: Add 1 to match months array
  selectedYear: number = new Date().getFullYear();
  daysInMonth: { day: number, weekday: string }[] = [];

  employees = [
    { sno: 1, codeNo: '54002', name: 'Deepak Dubey', department: 'Electrical', contractor: 'Bhagwati Contractor', attendance: { 1: 8, 2: 0, 3: 4, 4: 0, 5: 6, 6: 0, 7: 8, 8: 9 } },
    { sno: 2, codeNo: '54003', name: 'Abhishek Sharma', department: 'Mechanical', contractor: 'Bhagwati Contractor', attendance: { 1: 0, 2: 0, 3: 8, 4: 0, 5: 0, 6: 8, 7: 16, 8: 8 } },
    { sno: 3, codeNo: '54004', name: 'Rohit Tripathi', department: 'Civil', contractor: 'Bhagwati Contractor', attendance: { 1: 8, 2: 0, 3: 0, 4: 0, 5: 8, 6: 14.5, 7: 6.5, 8: 0 } },
    { sno: 4, codeNo: '54006', name: 'Danbahadur Singh', department: 'Production', contractor: 'Bhagwati Contractor', attendance: { 1: 16, 2: 0, 3: 8, 4: 0, 5: 8, 6: 7, 7: 16, 8: 0 } },
    { sno: 5, codeNo: '54007', name: 'Munna Dubey', department: 'Safety', contractor: 'Bhagwati Contractor', attendance: { 1: 8, 2: 0, 3: 0, 4: 0, 5: 0, 6: 8, 7: 8, 8: 0 } }
  ];

  constructor() {
    this.populateYears();
    this.generateTableHeaders();
  }

  // Generate a range of years (current year - 10 to current year + 10)
  populateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      this.years.push(i);
    }
  }

  // Generate days dynamically based on selected month and year
  generateTableHeaders() {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate(); // Get days in selected month
    this.daysInMonth = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, i); // Fix: Subtract 1 for zero-based month
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      this.daysInMonth.push({ day: i, weekday });
    }
  }
}

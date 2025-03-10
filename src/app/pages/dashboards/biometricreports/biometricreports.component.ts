import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-biometricreports',
  templateUrl: './biometricreports.component.html',
  styleUrl: './biometricreports.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDatepickerModule],
  standalone: true,
})
export class BiometricreportsComponent {
  http: any;
  searchTerm = { codeNo: '', name: '', department: '', contractor: '' };
  filteredEmployeesData: { sno: number; codeNo: string; name: string; department: string; contractor: string; attendance: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; }; }[];
  

  ngOnInit() {
    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');
    document.body.setAttribute('data-topbar', 'dark');
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
    { name: 'December', value: 12 },
  ];

  years: number[] = [];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  daysInMonth: { day: number; weekday: string }[] = [];
  selectedFormat: string = '';

  employees = [
    {
      sno: 1,
      codeNo: '54002',
      name: 'Deepak Dubey',
      department: 'Electrical',
      contractor: 'Bhagwati Contractor',
      attendance: { 1: 8, 2: 0, 3: 4, 4: 0, 5: 6, 6: 0, 7: 8, 8: 9 },
    },
    {
      sno: 2,
      codeNo: '54003',
      name: 'Abhishek Sharma',
      department: 'Mechanical',
      contractor: 'Bhagwati Contractor',
      attendance: { 1: 0, 2: 0, 3: 8, 4: 0, 5: 0, 6: 8, 7: 16, 8: 8 },
    },
    {
      sno: 3,
      codeNo: '54004',
      name: 'Rohit Tripathi',
      department: 'Civil',
      contractor: 'Bhagwati Contractor',
      attendance: { 1: 8, 2: 0, 3: 0, 4: 0, 5: 8, 6: 14.5, 7: 6.5, 8: 0 },
    },
    {
      sno: 4,
      codeNo: '54006',
      name: 'Danbahadur Singh',
      department: 'Production',
      contractor: 'Bhagwati Contractor',
      attendance: { 1: 16, 2: 0, 3: 8, 4: 0, 5: 8, 6: 7, 7: 16, 8: 0 },
    },
    {
      sno: 5,
      codeNo: '54007',
      name: 'Munna Dubey',
      department: 'Safety',
      contractor: 'Bhagwati Contractor',
      attendance: { 1: 8, 2: 0, 3: 0, 4: 0, 5: 0, 6: 8, 7: 8, 8: 0 },
    },
  ];
  constructor() {
    this.populateYears();
    this.generateTableHeaders();
    this.filteredEmployeesData = [...this.employees];

  }

  populateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      this.years.push(i);
    }
  }

  generateTableHeaders() {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.daysInMonth = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, i);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      this.daysInMonth.push({ day: i, weekday });
    }
  }
  downloadFile() {
    if (!this.selectedFormat) {
      alert('Please select a format to download.');
      return;
    }

    if (this.selectedFormat === 'pdf') {
      this.downloadPDF();
    } else if (this.selectedFormat === 'excel') {
      this.downloadExcel();
    }
  }

  downloadPDF() {
    alert('Downloading PDF...');
  }

  downloadExcel() {
    alert('Downloading Excel...');
  }

  filteredEmployees() {
    console.log("this.searchTerm", this.searchTerm);

    // Check if any search field has a value
    const hasSearchTerm = Object.values(this.searchTerm).some(value => value.trim() !== '');

    // Always update filteredEmployeesData, even when no filters are applied
    this.filteredEmployeesData = hasSearchTerm
      ? this.employees.filter((employee) => {
          const codeNoMatch = !this.searchTerm.codeNo || employee.codeNo.includes(this.searchTerm.codeNo);
          const nameMatch = !this.searchTerm.name || employee.name.toLowerCase().includes(this.searchTerm.name.toLowerCase());
          const departmentMatch = !this.searchTerm.department || employee.department.toLowerCase().includes(this.searchTerm.department.toLowerCase());
          const contractorMatch = !this.searchTerm.contractor || employee.contractor.toLowerCase().includes(this.searchTerm.contractor.toLowerCase());

          return codeNoMatch && nameMatch && departmentMatch && contractorMatch;
        })
      : [...this.employees]; // Reset to full list if no search terms

    console.log("Updated Table Data:", this.filteredEmployeesData);
  }
}
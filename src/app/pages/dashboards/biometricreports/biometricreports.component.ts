import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Component, OnInit,AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NgApexchartsModule,ChartComponent } from 'ng-apexcharts';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

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
  // filteredEmployeesData: { sno: number; codeNo: string; name: string; department: string; contractor: string; attendance: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; }; }[];
  columnTotals: number[] = [];
  rowTotals: number[] = [];
  grandTotal: number = 0;

  
  filteredEmployeesData: {
    sno: number;
    codeNo: string;
    name: string;
    department: string;
    contractor: string;
    attendance: { 
      1: number; 2: number; 3: number; 4: number; 
      5: number; 6: number; 7: number; 8: number; 
    };
    total: number;  // ✅ Add `total`
  }[];
  totalEmployeeAndAttendance: any;
  

  ngOnInit() {
    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');
    document.body.setAttribute('data-topbar', 'dark');
    this.updateDaysInMonth(); 
    // this.employeeList()
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
  constructor( private service: GeneralserviceService,
      private spinner: NgxSpinnerService,private cdr: ChangeDetectorRef) {
    this.populateYears();
    this.generateTableHeaders();
    this.initializeYears();
    this.updateDaysInMonth();
    // this.generateDaysInMonth;
    // Ensure each employee has a total
  this.filteredEmployeesData = this.employees.map(employee => ({
    ...employee,
    total: Object.values(employee.attendance).reduce((sum, hours) => sum + hours, 0),
  }));

  this.calculateTotals(); // ✅ Ensure totals are computed after initialization

  }

  populateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      this.years.push(i);
    }
  }
  // generateDaysInMonth(year: number, month: number): { day: number }[] {
  //   const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get actual days in month
  //   const maxDays = 31; // Always use 31 days for totals calculation
  
  //   const daysArray: { day: number }[] = [];
  //   for (let i = 1; i <= maxDays; i++) {
  //     daysArray.push({ day: i });
  //   }
  //   return daysArray;
  // }
  
  generateTableHeaders() {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    console.log("this.selectedYear",this.selectedYear);
    console.log("this.selectedMonth",this.selectedMonth);
    
    
    this.daysInMonth = [];
    

    for (let i = 1; i <= days; i++) {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, i);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      this.daysInMonth.push({ day: i, weekday });
    }
    // this.totalEmpandAtt()
  }
  // downloadFile() {
  //   if (!this.selectedFormat) {
  //     alert('Please select a format to download.');
  //     return;
  //   }

  //   if (this.selectedFormat === 'pdf') {
  //     this.downloadPDF();
  //   } else if (this.selectedFormat === 'excel') {
  //     this.downloadExcel();
  //   }
  // }

  // downloadPDF() {
  //   alert('Downloading PDF...');
  // }

  // downloadExcel() {
  //   alert('Downloading Excel...');
  // }
  initializeYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // Generates years from (currentYear - 5) to (currentYear + 4)
  }

  updateDaysInMonth() {
    const daysCount = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => ({
      day: i + 1,
      weekday: new Date(this.selectedYear, this.selectedMonth - 1, i + 1).toLocaleString('en-us', { weekday: 'short' }),
    }));
  }

  onMonthChange() {
    this.updateDaysInMonth();
  }

  onYearChange() {
    this.updateDaysInMonth();
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
    const doc = new jsPDF('landscape'); // Set landscape mode
    doc.text('Employee Data', 14, 10); // Title at the top
  
    const table = document.querySelector('table') as HTMLTableElement;
  
    if (!table) {
      alert("No table data available!");
      return;
    }

    // Extract table headers
    const headers: string[] = [];
    table.querySelectorAll("thead tr th").forEach(th => {
      headers.push(th.textContent?.trim() || "");  // ✅ Use textContent with optional chaining
    });
  
    // Extract table rows
    const data: string[][] = [];
    table.querySelectorAll("tbody tr").forEach(row => {
      const rowData: string[] = [];
      row.querySelectorAll("td").forEach(td => {
        rowData.push(td.textContent?.trim() || "");  // ✅ Use textContent with optional chaining
      });
      data.push(rowData);
    });
  
    // Generate PDF with autoTable
    autoTable(doc, {
      head: [headers], // Use extracted headers
      body: data,      // Use extracted rows
      startY: 20,
      styles: { fontSize: 8 },
      theme: 'grid',
    });
  
    // Save the PDF
    doc.save('EmployeeData.pdf');
  }

  downloadExcel() {
    // Select table element
    const table = document.querySelector('table');
    
    if (!table) {
      alert("No table data available!");
      return;
    }
  
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    // Convert to Blob and save
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'EmployeeData.xlsx');
  }

  filteredEmployees() {
    console.log("this.searchTerm", this.searchTerm);
  
    // Check if any search field has a value
    const hasSearchTerm = Object.values(this.searchTerm).some(value => value.trim() !== '');
  
    // Always update filteredEmployeesData, even when no filters are applied
    this.filteredEmployeesData = hasSearchTerm
      ? this.employees
          .filter((employee) => {
            const codeNoMatch = !this.searchTerm.codeNo || employee.codeNo.includes(this.searchTerm.codeNo);
            const nameMatch = !this.searchTerm.name || employee.name.toLowerCase().includes(this.searchTerm.name.toLowerCase());
            const departmentMatch = !this.searchTerm.department || employee.department.toLowerCase().includes(this.searchTerm.department.toLowerCase());
            const contractorMatch = !this.searchTerm.contractor || employee.contractor.toLowerCase().includes(this.searchTerm.contractor.toLowerCase());
  
            return codeNoMatch && nameMatch && departmentMatch && contractorMatch;
          })
          .map(employee => ({
            ...employee,
            total: Object.values(employee.attendance).reduce((sum, hours) => sum + hours, 0), // ✅ Ensure `total` is recalculated
          }))
      : this.employees.map(employee => ({
          ...employee,
          total: Object.values(employee.attendance).reduce((sum, hours) => sum + hours, 0), // ✅ Reset total when no search filter is applied
        }));
  
    this.calculateTotals(); // ✅ Recalculate totals after filtering
  
    console.log("Updated Table Data:", this.filteredEmployeesData);
  }
  
  
  calculateTotals() {
    // Compute column-wise totals
    this.columnTotals = this.daysInMonth.map(day => 
      this.filteredEmployeesData.reduce((sum, emp) => sum + (emp.attendance[day.day] || 0), 0)
    );
  
    // Compute grand total (sum of all row totals)
    this.grandTotal = this.filteredEmployeesData.reduce((sum, emp) => sum + emp.total, 0);
  
    console.log("Column Totals:", this.columnTotals);
    console.log("Grand Total:", this.grandTotal);
  }
  // calculateTotals() {
  //   // Get the actual number of days in the selected month
  //   let daysCount = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
  
  //   // Ensure consistent 31-day representation for all months in the totals calculation
  //   const maxDays = 31; 
  
  //   // Compute column-wise totals for all 31 days (or the actual days if less)
  //   this.columnTotals = Array.from({ length: maxDays }, (_, i) => {
  //     // If the current day is within the actual days of the month, calculate the total
  //     if (i < daysCount) {
  //       return this.filteredEmployeesData.reduce((sum, emp) => sum + (emp.attendance[i + 1] || 0), 0);
  //     } else {
  //       // For days beyond the actual month, add 0 to the total
  //       return 0; 
  //     }
  //   });
  
  //   // Compute grand total (sum of all row totals)
  //   this.grandTotal = this.filteredEmployeesData.reduce((sum, emp) => sum + emp.total, 0);
  
  //   console.log("Column Totals:", this.columnTotals);
  //   console.log("Grand Total:", this.grandTotal);
  // }

 

  employeeList() {
    
      this.spinner.show();
      this.service.getEmployeeList().subscribe(
        (res: any) => {
          this.spinner.hide();
         const response = res;
          console.log("response", response);
        
        },
        error => {
          this.spinner.hide();
          console.error("Error fetching invoices", error);
        }
);
   
   
  }
  totalEmpandAtt() {
    this.totalEmployeeAndAttendance = []
    this.spinner.show();
   let obj= {
      "month": this.selectedMonth,
      "year": this.selectedYear,
      "EmployeeId": null
    }
     
    this.service.combinationOfMonthAndYear(obj).subscribe(
      (res: any) => {
        this.spinner.hide();
       const response = res;
        console.log("totalEmpandAtt", response);
        if(response.statusCode == 200){
          this.totalEmployeeAndAttendance = response.responseData
        }else{
          this.totalEmployeeAndAttendance = []
        }
      console.log("this.totalEmployeeAndAttendance",this.totalEmployeeAndAttendance)
      },
      error => {
        this.spinner.hide();
        console.error("Error fetching invoices", error);
      }
);
 
 
}
  




}
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
interface Employee {
  sno: number;
  codeNo: string;
  name: string;
  department: string;
  contractor: string;
  attendance: Record<number, number>;  // Ensure attendance keys are numbers with number values
  total?: number;
}
@Component({
  selector: 'app-biometricreports',
  templateUrl: './biometricreports.component.html',
  styleUrl: './biometricreports.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDatepickerModule],
  standalone: true,
})
export class BiometricreportsComponent implements OnInit  {
  http: any;
  searchTerm = { codeNo: '', name: '', department: '', contractor: '',DepartmentName:'' };
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
    DepartmentName:string
    attendance: { 
      1: number; 2: number; 3: number; 4: number; 
      5: number; 6: number; 7: number; 8: number; 
    };
    total: number;  // ✅ Add `total`
  }[];
  data: any[] = []; // Full dataset
  paginatedData: any[] = []; // Visible data
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  totalEmployeeAndAttendance: any[] = []; // ✅ Initialize as an empty array
  allInvoiceList: any;
  pages: number[] = [];
  totalItems: 0;
  itemsPerPage: number = 10;
  
  
  

  

  ngOnInit() {
    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');
    document.body.setAttribute('data-topbar', 'dark');
    this.updateDaysInMonth(); 
    this. totalEmpandAtt();
    // this.employeeList()
    this.calculateTotalPages();
   
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
  employees :any
  // employees = [
  //   {
  //     sno: 1,
  //     codeNo: '54002',
  //     name: 'Deepak Dubey',
  //     department: 'Electrical',
  //     contractor: 'Bhagwati Contractor',
  //     attendance: { 1: 8, 2: 0, 3: 4, 4: 0, 5: 6, 6: 0, 7: 8, 8: 9 },
  //   },
  //   {
  //     sno: 2,
  //     codeNo: '54003',
  //     name: 'Abhishek Sharma',
  //     department: 'Mechanical',
  //     contractor: 'Bhagwati Contractor',
  //     attendance: { 1: 0, 2: 0, 3: 8, 4: 0, 5: 0, 6: 8, 7: 16, 8: 8 },
  //   },
  //   {
  //     sno: 3,
  //     codeNo: '54004',
  //     name: 'Rohit Tripathi',
  //     department: 'Civil',
  //     contractor: 'Bhagwati Contractor',
  //     attendance: { 1: 8, 2: 0, 3: 0, 4: 0, 5: 8, 6: 14.5, 7: 6.5, 8: 0 },
  //   },
  //   {
  //     sno: 4,
  //     codeNo: '54006',
  //     name: 'Danbahadur Singh',
  //     department: 'Production',
  //     contractor: 'Bhagwati Contractor',
  //     attendance: { 1: 16, 2: 0, 3: 8, 4: 0, 5: 8, 6: 7, 7: 16, 8: 0 },
  //   },
  //   {
  //     sno: 5,
  //     codeNo: '54007',
  //     name: 'Munna Dubey',
  //     department: 'Safety',
  //     contractor: 'Bhagwati Contractor',
  //     attendance: { 1: 8, 2: 0, 3: 0, 4: 0, 5: 0, 6: 8, 7: 8, 8: 0 },
  //   },
  // ];
  constructor( public service: GeneralserviceService,
      private spinner: NgxSpinnerService,private cdr: ChangeDetectorRef) {
        this.service = service;
    this.populateYears();
    this.generateTableHeaders();
    this.initializeYears();
    this.updateDaysInMonth();
    // this.generateDaysInMonth;
    // Ensure each employee has a total
  }
 
calculateTotalPages() {
  this.totalPages = Math.ceil(this.allInvoiceList.length / this.pageSize);
  this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
}
  onPageSizeChange() {
    this.currentPage = 1; // Reset to first page
    this.pageChanged(1);
    this.calculateTotalPages();
  }
  loadInvoices() {
    this.totalPages = Math.ceil(this.allInvoiceList.length / this.itemsPerPage);
    this.calculateTotalPages();
    this.updatePagination();
  }

  pageChanged(newpage: number) {
    if (newpage >= 1 && newpage <= this.totalPages) {
      this.currentPage = newpage;
      this.updatePagination();
      
    }
  }
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.data.slice(startIndex, startIndex + this.pageSize);
  }

  generatePages() {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
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
    this.totalEmpandAtt()
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
  // downloadPDF() {
  //   const doc = new jsPDF('landscape'); // Set landscape mode
  //   doc.text('Employee Data', 14, 10); // Title at the top
  
  //   const table = document.querySelector('table') as HTMLTableElement;
  //   if (!table) {
  //     alert("No table data available!");
  //     return;
  //   }
  
  //   // Extract table headers (static)
  //   const headers: string[] = [];
  //   table.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
  //     headers.push(th.textContent?.trim() || "");  
  //   });
  
  //   // Extract table rows (static)
  //   const data: string[][] = [];
  //   table.querySelectorAll("tbody tr").forEach(row => {
  //     const rowData: string[] = [];
  //     row.querySelectorAll("td").forEach(td => {
  //       rowData.push(td.textContent?.trim() || "");  
  //     });
  //     data.push(rowData);
  //   });
  
  //   // Extract dynamic columns (dates) from the scrollable table
  //   const scrollableTable = document.querySelector('.scrollable-table') as HTMLTableElement;
  //   if (scrollableTable) {
  //     scrollableTable.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
  //       headers.push(th.textContent?.trim() || "");  
  //     });
  
  //     scrollableTable.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
  //       row.querySelectorAll("td").forEach(td => {
  //         data[rowIndex].push(td.textContent?.trim() || "");  
  //       });
  //     });
  //   }
  
  //   // Add the "Total" row to the data (convert numbers to strings)
  //   const totalRow = ["Total", "", "", "", "", ...this.columnTotals.map(num => num.toString()), this.grandTotal.toString()];
  //   data.push(totalRow);
  
  //   // Generate PDF with autoTable
  //   autoTable(doc, {
  //     head: [headers],
  //     body: data,
  //     startY: 20,  // Adjust starting position
  //     margin: { left: 2, right: 2 },  // Ensures proper spacing
  //     theme: 'grid',
  //     rowPageBreak: 'avoid',
  //     styles: {
  //         overflow: 'linebreak',
  //         fontSize: 7,  // Adjust font size to fit content better
  //         cellPadding: 1,  // Increased padding for better visibility
  //         lineWidth: 0.2,  // Ensures table borders are visible
  //         lineColor: [0, 0, 0]  // Set border color to black
  //     },
  //     tableLineWidth: 0.5,  // Ensure table borders are drawn
  //     tableLineColor: [0, 0, 0],
     
  //     columnStyles: {
  //         0: { cellWidth: 9 },  // S.No
  //         1: { cellWidth: 9 },  // Code No
  //         2: { cellWidth: 19 },  // Name of Employee (Wider for readability)
  //         3: { cellWidth: 16 },  // Department
  //         4: { cellWidth: 15 },  // Contractor
  //         5: { cellWidth: 6 }, 6: { cellWidth: 8}, 7: { cellWidth: 7 },
  //         8: { cellWidth: 7 }, 9: { cellWidth: 7 }, 10: { cellWidth: 7},
  //         11: { cellWidth: 7 }, 12: { cellWidth: 7}, 13: { cellWidth: 7 },
  //         14: { cellWidth: 7 }, 15: { cellWidth: 7 }, 16: { cellWidth: 7 },
  //         17: { cellWidth: 7 }, 18: { cellWidth: 7 }, 19: { cellWidth: 7 },
  //         20: { cellWidth: 8 }, 21: { cellWidth: 7 }, 22: { cellWidth: 7 },
  //         23: { cellWidth: 7 }, 24: { cellWidth: 7 }, 25: { cellWidth: 7 },
  //         26: { cellWidth: 7 }, 27: { cellWidth: 7 }, 28: { cellWidth: 7},
  //         29: { cellWidth: 7 }, 30: { cellWidth: 7}, 31: { cellWidth: 7},
  //         32: { cellWidth: 6 }  // Total column
  //     }
  // });
 
  
  //   // Save the PDF
  //   doc.save('EmployeeData.pdf');
  // }
  downloadPDF() {
    const doc = new jsPDF('landscape'); // Set landscape mode
    doc.setFontSize(12);
    
    // Display the selected month and year
    const monthName = this.months.find(m => m.value === this.selectedMonth)?.name || 'N/A';
    const year = this.selectedYear || 'N/A';
    
    doc.text(`Employee Data - ${monthName} ${year}`, 14, 10); // Updated title with month & year
    
    const table = document.querySelector('table') as HTMLTableElement;
    if (!table) {
      alert("No table data available!");
      return;
    }

    // Extract table headers
    const headers: string[] = [];
    table.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
        headers.push(th.textContent?.trim() || "");  
    });

    // Extract table rows
    const data: string[][] = [];
    table.querySelectorAll("tbody tr").forEach(row => {
        const rowData: string[] = [];
        row.querySelectorAll("td").forEach(td => {
            rowData.push(td.textContent?.trim() || "");  
        });
        data.push(rowData);
    });

    // Extract dynamic columns (if any)
    const scrollableTable = document.querySelector('.scrollable-table') as HTMLTableElement;
    if (scrollableTable) {
        scrollableTable.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
            headers.push(th.textContent?.trim() || "");  
        });

        scrollableTable.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
            row.querySelectorAll("td").forEach(td => {
                data[rowIndex].push(td.textContent?.trim() || "");  
            });
        });
    }

    // Add Total row
    const totalRow = ["Total", "", "", "", "", ...this.columnTotals.map(num => num.toString()), this.grandTotal.toString()];
    data.push(totalRow);

    // Generate PDF Table
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 20,  // Adjusted for heading
        margin: { left: 2, right: 2 },
        theme: 'grid',
        rowPageBreak: 'avoid',
        styles: {
            overflow: 'linebreak',
            fontSize: 7,
            cellPadding: 1,
            lineWidth: 0.2,
            lineColor: [0, 0, 0]
        },
        tableLineWidth: 0.5,
        tableLineColor: [0, 0, 0],
        columnStyles: {
            0: { cellWidth: 9 },  
            1: { cellWidth: 9 },  
            2: { cellWidth: 19 },  
            3: { cellWidth: 16 },  
            4: { cellWidth: 15 },  
            5: { cellWidth: 6 }, 6: { cellWidth: 8}, 7: { cellWidth: 7 },
            8: { cellWidth: 7 }, 9: { cellWidth: 7 }, 10: { cellWidth: 7},
            11: { cellWidth: 7 }, 12: { cellWidth: 7}, 13: { cellWidth: 7 },
            14: { cellWidth: 7 }, 15: { cellWidth: 7 }, 16: { cellWidth: 7 },
            17: { cellWidth: 7 }, 18: { cellWidth: 7 }, 19: { cellWidth: 7 },
            20: { cellWidth: 8 }, 21: { cellWidth: 7 }, 22: { cellWidth: 7 },
            23: { cellWidth: 7 }, 24: { cellWidth: 7 }, 25: { cellWidth: 7 },
            26: { cellWidth: 7 }, 27: { cellWidth: 7 }, 28: { cellWidth: 7},
            29: { cellWidth: 7 }, 30: { cellWidth: 7}, 31: { cellWidth: 7},
            32: { cellWidth: 6 }  
        }
    });

    // Save the PDF
    doc.save(`EmployeeData_${monthName}_${year}.pdf`);
}

 
  



  

  // downloadExcel() {
  //   // Select the main table element
  //   const mainTable = document.querySelector('table') as HTMLTableElement;
    
  //   if (!mainTable) {
  //     alert("No table data available!");
  //     return;
  //   }
  
  //   // Select the scrollable table element (dynamic columns)
  //   const scrollableTable = document.querySelector('.scrollable-table') as HTMLTableElement;
  
  //   // Combine headers from both tables
  //   const headers: string[] = [];
  //   mainTable.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
  //     headers.push(th.textContent?.trim() || "");
  //   });
  
  //   if (scrollableTable) {
  //     scrollableTable.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
  //       headers.push(th.textContent?.trim() || "");
  //     });
  //   }
  
  //   // Combine rows from both tables
  //   const data: any[][] = [];
  //   mainTable.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
  //     const rowData: any[] = [];
  //     row.querySelectorAll("td").forEach(td => {
  //       rowData.push(td.textContent?.trim() || "");
  //     });
  
  //     if (scrollableTable) {
  //       const scrollableRow = scrollableTable.querySelectorAll("tbody tr")[rowIndex];
  //       if (scrollableRow) {
  //         scrollableRow.querySelectorAll("td").forEach(td => {
  //           rowData.push(td.textContent?.trim() || "");
  //         });
  //       }
  //     }
  
  //     data.push(rowData);
  //   });
  
  //   // Add the "Total" row to the data
  //   const totalRow = ["Total", "", "", "", "", ...this.columnTotals, this.grandTotal];
  //   data.push(totalRow);
  
  //   // Create a new worksheet
  //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  //   // Create a new workbook and append the worksheet
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "EmployeeData");
  
  //   // Generate Excel file
  //   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  //   // Convert to Blob and save
  //   const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //   saveAs(blob, `EmployeeData_${this.selectedMonth}_${this.selectedYear}.xlsx`);
  // }

  
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
  downloadExcel() {
    const mainTable = document.querySelector('table') as HTMLTableElement;
  
    if (!mainTable) {
      alert("No table data available!");
      return;
    }
  
    const scrollableTable = document.querySelector('.scrollable-table') as HTMLTableElement;
  
    // Get the month and year names
    const monthName = this.months.find(m => m.value === this.selectedMonth)?.name || this.selectedMonth;
    const year = this.selectedYear;
  
    // Title row
    const titleRow = [`Employee Data - ${monthName} ${year}`];
  
    // Combine headers from both tables
    const headers: string[] = [];
    mainTable.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
      headers.push(th.textContent?.trim() || "");
    });
  
    if (scrollableTable) {
      scrollableTable.querySelectorAll("thead tr:nth-child(1) th").forEach(th => {
        headers.push(th.textContent?.trim() || "");
      });
    }
  
    // Combine rows from both tables
    const data: any[][] = [];
    mainTable.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
      const rowData: any[] = [];
      row.querySelectorAll("td").forEach(td => {
        rowData.push(td.textContent?.trim() || "");
      });
  
      if (scrollableTable) {
        const scrollableRow = scrollableTable.querySelectorAll("tbody tr")[rowIndex];
        if (scrollableRow) {
          scrollableRow.querySelectorAll("td").forEach(td => {
            rowData.push(td.textContent?.trim() || "");
          });
        }
      }
  
      data.push(rowData);
    });
  
    // Add the "Total" row to the data
    const totalRow = ["Total", "", "", "", "", ...this.columnTotals, this.grandTotal];
    data.push(totalRow);
  
    // Create a new worksheet with the title row
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([titleRow, [], headers, ...data]);
  
    // Create a new workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EmployeeData");
  
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    // Convert to Blob and save
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `EmployeeData_${monthName}_${year}.xlsx`);
  }
  
  filteredEmployees() {
    console.log("this.searchTerm", this.searchTerm);

    if (!this.employees || !Array.isArray(this.employees) || this.employees.length === 0) {
        console.warn("Employees data is missing or empty:", this.employees);
        return;
    }

    console.log("Employees Data Before Filtering:", this.employees);

    const hasSearchTerm = Object.values(this.searchTerm).some(value => value.trim() !== '');

    this.filteredEmployeesData = hasSearchTerm
        ? this.employees
            .filter(employee => {
                const codeNoMatch = !this.searchTerm.codeNo || 
                                    employee.codeNo.toString().includes(this.searchTerm.codeNo.toString());
                const nameMatch = !this.searchTerm.name || 
                                  employee.name.toLowerCase().includes(this.searchTerm.name.toLowerCase());
                const departmentMatch = !this.searchTerm.DepartmentName || 
                                        employee.DepartmentName.toLowerCase().includes(this.searchTerm.DepartmentName.toLowerCase());
                const contractorMatch = !this.searchTerm.contractor || 
                                        employee.contractor.toLowerCase().includes(this.searchTerm.contractor.toLowerCase());
                return codeNoMatch && nameMatch && departmentMatch && contractorMatch;
            })
            .map(employee => ({
                ...employee,
                total: Object.values(employee.attendance || {}).reduce((sum, hours) => Number(sum) + Number(hours), 0),
            }))
        : this.employees.map(employee => ({
            ...employee,
            total: Object.values(employee.attendance || {}).reduce((sum, hours) => Number(sum) + Number(hours), 0),
        }));

    console.log("Updated Table Data:", this.filteredEmployeesData);
   
}



  
  
  
  calculateTotals() {
    if (!Array.isArray(this.filteredEmployeesData)) {
      console.error("filteredEmployeesData is undefined or not an array", this.filteredEmployeesData);
      return; // Exit function to avoid error
    }

     this.columnTotals = this.daysInMonth.map(day => 
      this.filteredEmployeesData.reduce((sum, emp) => sum + (emp.attendance[day.day] || 0), 0)
    );

    // Compute grand total (sum of column totals)
    this.grandTotal = this.columnTotals.reduce((sum, total) => sum + total, 0);

    console.log("Column Totals:", this.columnTotals);
    console.log("Grand Total:", this.grandTotal);

  }
  

//   totalEmpandAtt() {
//     this.totalEmployeeAndAttendance = [];
//     this.spinner.show();

//     let obj = {
//       "month": this.selectedMonth,
//       "year": this.selectedYear,
//       "EmployeeId": null
//     };

//     this.service.combinationOfMonthAndYear(obj).subscribe(
//       (res: any) => {
//         this.spinner.hide();
//         console.log("API Response:", res);

//         if (res?.statusCode === 200 && Array.isArray(res.responseData)) {
//           this.totalEmployeeAndAttendance = res.responseData;

//           // ✅ Assign fetched data to `this.employees` for filtering to work
//           this.employees = this.totalEmployeeAndAttendance.map((emp, index) => {
//             const attendanceData = this.formatAttendance(emp.attendanceRecords);
//             return {
//               sno: index + 1,
//               codeNo: String(emp.EmployeeId || ''), 
//               name: String(emp.EmployeeName || ''),  
//               department: String(emp.DepartmentId || ''),  
//               contractor: String(emp.Designation || ''), 
//               DepartmentName: String(emp.DepartmentName || ''),
//               attendance: attendanceData, 
//               total: Object.values(attendanceData).reduce((sum, hours) => sum + Number(hours), 0),
//             };
//           });

//           console.log("this.employees Data:", this.employees);
//           this.filteredEmployees(); // ✅ Call filter function after setting employees
//           this.calculateTotals();
//           this. updatePagination();
//         } else {
//           this.employees = [];
//           this.filteredEmployeesData = [];
//           this.columnTotals = [];
//           this.grandTotal = 0;
//         }

//         console.log("Processed Employee Data:", this.filteredEmployeesData);
//       },
//       error => {
//         this.spinner.hide();
//         console.error("Error fetching employee attendance", error);
//       }
//     );
// }





  
  
  // formatAttendance(attendanceRecords: any[] | undefined): { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; } {
  //   // Ensure attendanceRecords is an array, if not, return default structure
  //   if (!Array.isArray(attendanceRecords)) {
  //     return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  //   }
  
  //   const formattedAttendance: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  
  //   attendanceRecords.forEach(record => {
  //     if (record && record.AttendanceDate) {
  //       const day = new Date(record.AttendanceDate).getDate(); // Extract day of the month
  //       if (day >= 1 && day <= 8) {
  //         formattedAttendance[day] = record.Present || 0; // Set Present value
  //       }
  //     }
  //   });
  
  //   return formattedAttendance as { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; };
  // }
  totalEmpandAtt() {
    this.totalEmployeeAndAttendance = [];
    this.spinner.show();

    let obj = {
      "month": this.selectedMonth,
      "year": this.selectedYear,
      "EmployeeId": null
    };

    this.service.combinationOfMonthAndYear(obj).subscribe(
      (res: any) => {
        this.spinner.hide();
        console.log("API Response:", res);

        if (res?.statusCode === 200 && Array.isArray(res.responseData)) {
          this.totalEmployeeAndAttendance = res.responseData;

          // ✅ Assign fetched data to this.employees for filtering to work
          this.employees = this.totalEmployeeAndAttendance.map((emp, index) => {
            const attendanceData = this.formatAttendance(emp.attendanceRecords);
            return {
              sno: index + 1,
              codeNo: String(emp.EmployeeId || ''), 
              name: String(emp.EmployeeName || ''),  
              department: String(emp.DepartmentId || ''),  
              contractor: String(emp.Designation || ''), 
              DepartmentName: String(emp.DepartmentName || ''),
              attendance: attendanceData, 
              total: Object.values(attendanceData).reduce((sum, hours) => sum + Number(hours), 0),
            };
          });

          console.log("this.employees Data:", this.employees);
          this.filteredEmployees(); // ✅ Call filter function after setting employees
          this.calculateTotals();
          this. updatePagination();
        } else {
          this.employees = [];
          this.filteredEmployeesData = [];
          this.columnTotals = [];
          this.grandTotal = 0;
        }

        console.log("Processed Employee Data:", this.filteredEmployeesData);
      },
      error => {
        this.spinner.hide();
        console.error("Error fetching employee attendance", error);
      }
    );
}
formatAttendance(attendanceRecords: any[] | undefined): { [key: number]: number } {
  if (!Array.isArray(attendanceRecords)) {
    return {}; // Return empty object if no records
  }

  const formattedAttendance: { [key: number]: number } = {};

  attendanceRecords.forEach(record => {
    if (record && record.AttendanceDate && record.InTime && record.OutTime) {
      const day = new Date(record.AttendanceDate).getDate();
      if (day >= 1 && day <= 31) {
        const inTime = new Date(record.InTime);
        const outTime = new Date(record.OutTime);

        if (!isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
          const timeDiff = outTime.getTime() - inTime.getTime();
          const hours = timeDiff / (1000 * 60 * 60);
          formattedAttendance[day] = Math.floor(hours); // Use Math.floor to get the integer part
        } else {
          formattedAttendance[day] = 0;
        }
      }
    } else if (record && record.AttendanceDate && record.totalCalculatedTime) {
      const day = new Date(record.AttendanceDate).getDate();
      if (day >= 1 && day <= 31) {
        formattedAttendance[day] = Math.floor(record.totalCalculatedTime); // Use Math.floor to get the integer part
      }
    }
  });

  return formattedAttendance;
}
  
  
  
  updateDaysInMonth() {
    const daysCount = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => ({
      day: i + 1,
      weekday: new Date(this.selectedYear, this.selectedMonth - 1, i + 1).toLocaleString('en-us', { weekday: 'short' }),
    }));
  }
}
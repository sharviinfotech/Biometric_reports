import { Component, OnInit,AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule,ChartComponent } from 'ng-apexcharts';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  ApexChart,
  ApexResponsive
} from "ng-apexcharts";
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ... (Other imports and interfaces remain the same)

export type ChartOptions = {
  series: any;
  chart: ApexChart;
  xaxis: any;
  yaxis: any;
  dataLabels: any;
  stroke: any;
  grid: any;
  plotOptions: any;
  legend: any;
  labels: any;
  fill: any;
  tooltip: any;
  responsive: ApexResponsive[];
  colors: any;
};

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, BsDatepickerModule,NgxSpinnerModule], 
  // providers: [NgxSpinnerService] // ✅ Provide NgxSpinnerService

})
export class DefaultComponent {  // ... (other properties)
  public barChartOptions: Partial<ChartOptions> = {};// Initially hidden
  public pieChartOptions: Partial<ChartOptions> = {};
  
  @ViewChild('barChart') barChart: ChartComponent;
  allInvoiceList: any[] = [];
  yearFilteredInvoices: any[] = [];  
  filteredInvoiceList: any[] = [];    
  bsConfig: { dateInputFormat: string; containerClass: string; };
  close: any;

  constructor(
    private service: GeneralserviceService,
    private spinner: NgxSpinnerService,private cdr: ChangeDetectorRef
  ) {
    this.bsConfig = {
      dateInputFormat: 'YYYY-MM-DD',
      containerClass: 'theme-blue',
    };
  }
 
  ngOnInit(): void {
    // this.getAllInvoice();
  }

  getAllInvoice() {
    setTimeout(() => {
      this.spinner.show();
      this.service.getAllInvoice().subscribe(
        (res: any) => {
          this.spinner.hide();
          this.allInvoiceList = res.data;
          this.filteredInvoiceList = res.data;
          console.log("Fetched Invoice Data:", this.allInvoiceList);
          if(this.allInvoiceList.length>0){
            this.updateBarChart(this.allInvoiceList);

          }
        },
        error => {
          this.spinner.hide();
          console.error("Error fetching invoices", error);
        }
      );
    }, 0);
   
  }

  updateBarChart(data: any[]) {
    this.spinner.show()

    const yearlyStatusCounts = this.calculateYearlyStatusCounts(data);
    if (Object.keys(yearlyStatusCounts).length === 0) return;

    const years = Object.keys(yearlyStatusCounts).sort();
    const seriesData = years.map(year => yearlyStatusCounts[year]);

    this.barChartOptions = {
      series: [{ name: "Invoices", data: seriesData }],
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
        toolbar: { show: true },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const selectedYear = years[config.dataPointIndex];
            console.log("Year selected:", selectedYear);
            this.filterByYear(selectedYear);
    
            // Reset all bar styles
            const bars = document.querySelectorAll(".apexcharts-bar-area");
            bars.forEach((bar) => {
              (bar as HTMLElement).style.stroke = "none"; // Remove previous borders
              (bar as HTMLElement).style.strokeWidth = "0";
            });
    
            // Highlight the selected bar
            const selectedBar = document.querySelector(
              `.apexcharts-bar-area[j="${config.dataPointIndex}"]`
            );
            if (selectedBar) {
              (selectedBar as HTMLElement).style.stroke = "red"; // Add red border
              (selectedBar as HTMLElement).style.strokeWidth = "2px";
            }
          }
        }
      },
      plotOptions: {
        bar: {
          columnWidth: "20%", // Decrease this value to make bars thinner
        }
      },
      colors: ["#007BFF"], 
      xaxis: { categories: years, title: { text: "Year" } },
      yaxis: { title: { text: "Invoice Count" } },
      legend: { position: 'bottom' }
    }; 

    setTimeout(() => {
      this.spinner.hide()
    }, 200);

  }

  filterByYear(selectedYear: string) {
    this.yearFilteredInvoices = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const [day, month, year] = invoice.header.ProformaInvoiceDate.split('-');
      return year === selectedYear;
    });

    this.filteredInvoiceList = [...this.yearFilteredInvoices]; // Reset to year filter
    this.updatePieChart();
  }
  updatePieChart() {
    this.spinner.show();
  
    setTimeout(() => {
      const statusCounts: { [status: string]: number } = {};
  
      if (!this.yearFilteredInvoices || this.yearFilteredInvoices.length === 0) {
        console.warn("No invoices available for the selected year.");
        this.pieChartOptions.series = [];
        this.cdr.detectChanges();
        return;
      }
  
      this.yearFilteredInvoices.forEach(invoice => {
        const status = invoice.status || "Unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
  
      console.log("Pie Chart Data:", statusCounts);
  
      if (Object.keys(statusCounts).length === 0) {
        console.warn("No status data found for pie chart.");
        this.pieChartOptions.series = [];
        this.cdr.detectChanges();
        return;
      }
     
      // Define color mapping for statuses
      const statusColors: { [key: string]: string } = {
        "Approved": "#16a34a",  // Green
        "Rejected": "#dc2626",  // Red
        "Pending": "#ffcc66",   // Orange
        "Rejected_Reverse": "#FF7518",       
      };
  
      const chartLabels = Object.keys(statusCounts);
      const chartColors = chartLabels.map(label => statusColors[label] || "#FF7518"); // Default grey if not found
  
      this.pieChartOptions = {
        series: Object.values(statusCounts),
        chart: {
          type: "pie",
          height: 350,
          events: {
            dataPointSelection: (event, chartContext, config) => {
              const selectedStatus = chartLabels[config.dataPointIndex];
              console.log("Selected Status:", selectedStatus);
              this.filterTableByStatus(selectedStatus);
            }
          }
        },
        labels: chartLabels,
        colors: chartColors,
        legend: { position: "bottom" },
        tooltip: { y: { formatter: (val) => `${val} invoices` } }
      };
  
      this.cdr.detectChanges();
      this.spinner.hide();
    }, 500);
  }
  
  
  

  filterTableByStatus(selectedStatus: string) {
    this.filteredInvoiceList = this.yearFilteredInvoices.filter(invoice => invoice.status?.trim().toLowerCase() === selectedStatus.trim().toLowerCase());
    console.log("Filtered Table Data by Status:", this.filteredInvoiceList);
    this.cdr.detectChanges(); // Ensure Angular detects the changes
  }
  
  

  calculateYearlyStatusCounts(invoices: any[]): { [year: string]: number } {
    const yearlyStatusCounts: { [year: string]: number } = {};

    invoices.forEach(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return;

      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');
      const date = new Date(`${year}-${month}-${day}`);

      if (isNaN(date.getTime())) return;

      const yearStr = date.getFullYear().toString();
      yearlyStatusCounts[yearStr] = (yearlyStatusCounts[yearStr] || 0) + 1;
    });

    return yearlyStatusCounts;
  }
}
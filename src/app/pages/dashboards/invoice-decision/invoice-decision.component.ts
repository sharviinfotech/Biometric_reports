import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NgxPrintModule } from 'ngx-print';
import Swal from 'sweetalert2';
import { Component, ElementRef, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface ChargeItem {
  description: string;
  units: string;
  rate: string;
  amount: string;
  _id: string;
}

interface TaxItem {
  description: string;
  percentage: string;
  amount: string;
  _id: string;
}

interface InvoiceHeader {
  invoiceHeader: string;
  invoiceImage: string;
  ProformaCustomerName: string;
  ProformaAddress: string;
  ProformaCity: string;
  ProformaState: string;
  ProformaPincode: string;
  ProformaGstNo: string;
  ProformaPanNO: string;
  ProformaInvoiceNumber: string;
  ProformaInvoiceDate: string;
  ProformaPan: string;
  ProformaGstNumber: string;
  ProformaTypeOfAircraft: string;
  ProformaSeatingCapasity: number;
  notes: string;
  BookingDateOfJourny: string;
  BookingSector: string;
  BookingBillingFlyingTime: string;
}

interface InvoiceItem {
  header: InvoiceHeader;
  _id: string;
  invoiceReferenceNo: number;
  chargesList: ChargeItem[];
  taxList: TaxItem[];
  subtotal: number;
  grandTotal: number;
  amountInWords: string;
  status: string;
  invoiceUniqueNumber: string;
}

@Component({
  selector: 'app-invoice-decision',
  templateUrl: './invoice-decision.component.html',
  styleUrl: './invoice-decision.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPrintModule],
  standalone: true,
})
export class InvoiceDecisionComponent {
  @ViewChild('approveModal') approveModal: TemplateRef<any>;
  @ViewChild('afterDecision') afterDecision: TemplateRef<any>;
  loginData: any; // Example login data
  approveForm!: FormGroup;
  submit: boolean = false;
  invoiceItem: any;
  selectedAction: string = '';

  selectedInvoice: any;


  allInvoiceList: any;

  remark: string = '';
  invoice = {
    invoiceNumber: 'INV-5678',
    invoiceDate: '2025-01-25',
    header: {
      toName: 'John Doe'
    },
    amount: '$500'
  };
  decisionTaking: any;


  constructor(private fb: FormBuilder, private service: GeneralserviceService, private spinner: NgxSpinnerService, private modalService: NgbModal) {
    this.createForm();

  }
  createForm() {
    this.approveForm = this.fb.group({
      remark: [''], // Default empty, validation added dynamically
      invoiceApprovedOrRejectedByUser: [''],
      invoiceApprovedOrRejectedDateAndTime:['']
    });
  }
  get f() {
    return this.approveForm.controls;
  }

  ngOnInit(): void {
    this.getAllInvoice()
    this.loginData = this.service.getLoginResponse()
    console.log("this.loginData ", this.loginData)
  }

  getAllInvoice() {
    this.allInvoiceList = []
    this.spinner.show()
    this.service.getAllInvoice().subscribe((res: any) => {
      console.log("getAllInvoice", res);
      this.spinner.hide()
      this.allInvoiceList = res.data;
    }, error => {
      this.spinner.hide()
    })
  }
  // ApproveOrReject(invoice: any,decision) {
  //   this.decisionTaking = null
  //   this.decisionTaking = decision
  //   if(decision == 'Approved'){
  //     this.invoice = invoice;
  //     this.modalService.open(this.approveModal,{size:'sm'});
  //   }else if(decision == 'Rejected'){
  //     this.invoice = invoice;
  //     this.modalService.open(this.approveModal,{size:'sm'});
  //   }

  // }

  // openModal(action: string, invoice: any) {
  //   this.selectedAction = action;
  //   this.selectedInvoice = invoice;
  
  //   // Reset form and validation
  //   this.approveForm.reset();
  //   this.submit = false;
  
  //   if (action === 'Rejected') {
  //     this.approveForm.get('remark')?.setValidators([Validators.required]);
  //   } else {
  //     this.approveForm.get('remark')?.clearValidators();
  //   }
  //   this.approveForm.get('remark')?.updateValueAndValidity();
  
  //   // Open the modal
  //   this.modalService.open(this.approveModal, { size: 'sm' });
  
  //   // Ensure parent is not hidden
  //   setTimeout(() => {
  //     document.body.removeAttribute('aria-hidden');
  //   }, 100);
  // }
  
  // afterDecisionOpen(invoice) {
  //   this.approveForm.reset()
  //   console.log("invoice", invoice);
  //   this.approveForm.patchValue({
  //     remark: invoice.reason,
  //     invoiceApprovedOrRejectedByUser: invoice.invoiceApprovedOrRejectedByUser,
  //     invoiceApprovedOrRejectedDateAndTime:invoice.invoiceApprovedOrRejectedDateAndTime
  //   })
  //   this.modalService.open(this.afterDecision, { size: 'lg' })
  // }
  // approveButton() {
  //   if (this.selectedAction === 'Approved') {
  //     this.ApproveOrReject(this.selectedInvoice, 'Approved');
  //     this.modalService.dismissAll();
  //   }
  // }

  // rejectButton() {
  //   this.submit = true;

  //   if (this.approveForm.invalid) {
  //     return;
  //   }

  //   this.ApproveOrReject(this.selectedInvoice, 'Rejected', this.approveForm.value.remark);
  //   this.modalService.dismissAll();
  // }

  ApproveOrReject(invoice: any, status: string, remark?: string): void {
    console.log(`Invoice: ${invoice}, Status: ${status}, Remark: ${''}`);
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24-hour format
    }).replace(',', ''); // Remove the comma between date and time

    const reqBody = {
      invoiceReferenceNo: invoice.invoiceReferenceNo, // Access invoice ID
      status: status, // Set status dynamically
      reason: this.approveForm.value.remark, // Default to 'N/A' if no remark is provided
      invoiceApprovedOrRejectedByUser: this.loginData?.data.userName,
      invoiceApprovedOrRejectedDateAndTime: formattedDateTime 

    };

    console.log('Payload sent to backend:', reqBody);
    this.service.invoiceApprovedOrRejected(reqBody).subscribe(
      (response: any) => {
        console.log('Response:', response); // Log the backend response

        // Ensure response structure is valid
        if (response.status == 200) {

          Swal.fire({
            text: response.message,
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.getAllInvoice()
        } else {
          Swal.fire({
            text: response.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      (error) => {
        // Handle API errors
        Swal.fire('Error!', 'Failed to update status. Please try again.', 'error');
        console.error('Approval error:', error);
      }
    );




  };
  openModal(action: string, invoice: any) {
    this.selectedAction = action;
    this.selectedInvoice = invoice;

    // Reset form and validation
    this.approveForm.reset();
    this.submit = false;

    if (action === 'Rejected') {
      this.approveForm.get('remark')?.setValidators([Validators.required]);
    } else {
      this.approveForm.get('remark')?.clearValidators();
    }
    this.approveForm.get('remark')?.updateValueAndValidity();

    this.modalService.open(this.approveModal, { size: 'sm' })
  }
  afterDecisionOpen(invoice) {
    this.approveForm.reset()
    console.log("invoice", invoice);
    this.approveForm.patchValue({
      remark: invoice.reason,
      invoiceApprovedOrRejectedByUser: invoice.invoiceApprovedOrRejectedByUser,
      invoiceApprovedOrRejectedDateAndTime:invoice.invoiceApprovedOrRejectedDateAndTime
    })
    this.modalService.open(this.afterDecision, { size: 'lg' })
  }
  approveButton() {
    console.log("approveButton",this.selectedAction)
    if (this.selectedAction === 'Approved') {
      this.ApproveOrReject(this.selectedInvoice, 'Approved');
      this.modalService.dismissAll();
    }
  }

  rejectButton() {
    console.log("approveButton",this.selectedAction,this.approveForm)
    
    if (this.approveForm.invalid) {
      this.submit = true;
      return;
    }

    this.ApproveOrReject(this.selectedInvoice, 'Rejected', this.approveForm.value.remark);
    this.modalService.dismissAll();
  }





  // in this screen below is not required
  selectInvoice(invoice: any) {
    this.invoiceItem = null
    this.invoiceItem = invoice
    const invoiceItem = invoice;
    console.log("invoice", invoice)
    console.log("this.invoiceItem", this.invoiceItem.invoiceReferenceNo);
    console.log("this.invoiceItem.header.status", this.invoiceItem.header.status)


    if (this.invoiceItem.status == "Rejected") {
      console.log("If rejected")
      Swal.fire({
        // title: 'question',
        text: 'The selected invoice has been rejected, so printing is not possible.',
        icon: 'info',
        // showCancelButton: true,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        } else {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        }
      });
    } else if (this.invoiceItem.status == "Pending") {
      console.log("If pending")
      Swal.fire({
        // title: 'question',
        text: 'The invoice is pending, so please proceed with the process.',
        icon: 'info',
        showCancelButton: false,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
        } else {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        }
      });
    } else {
      Swal.fire({
        text: 'The selected invoice has been approved. Do you want to print the invoice?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Print',
      }).then((result) => {
        if (result.isConfirmed) {
          this.generateInvoiceHTML(invoiceItem)
        }
      });
    }
  }
  generateInvoiceHTML(invoiceItem: InvoiceItem) {
    const invoiceHTML = `
          <html>
            <head>
              <title>Proforma Invoice</title>
              <style>
                /* General styles */
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 5px;
                  background-color: white;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  font-size: 12px;
                }
                .container {
                  width: 100%;
                  max-width: 1000px;
                  margin: 0 auto;
                }
                .orange-background {
                  background-color: rgb(255, 165, 0) !important;
                  padding: 8px;
                  color: black !important;
                  font-weight: bold;
                  text-align: center;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .card-header {
                  background-color: rgb(255, 165, 0) !important;
                  color: black !important;
                  padding: 8px;
                  text-align: center;
                  font-weight: bold;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .booking-title {
                  background-color: rgb(255, 165, 0) !important;
                  color: black !important;
                  padding: 8px;
                  text-align: center;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .table-bordered {
                  border-collapse: collapse;
                  width: 100%;
                  margin-bottom: 10px;
                }
                .table-bordered td,
                .table-bordered th {
                  border: 1px solid black;
                  padding: 5px;
                }
                .border {
                  border: 1px solid black;
                  padding: 5px;
                }
                .text-center {
                  text-align: center;
                }
                .text-right {
                  text-align: right;
                }
                .mb-4 {
                  margin-bottom: 1rem;
                }
                .mt-4 {
                  margin-top: 1rem;
                }
                .company-name {
                  text-align: center;
                  margin: 5px 0;
                  font-size: 14px;
                  font-weight: bold;
                }
                .footer-text {
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .header-row {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 10px;
                }
                .logo {
                  height: 90px;
                }
                .notes {
                  margin: 5px 0;
                  font-size: 11px;
                }
                .bank-details {
                  margin-top: 10px;
                }
                .bold {
                  font-weight: bold;
                }
                
                /* Print-specific styles */
                @media print {
                  body {
                    margin: 0;
                    padding: 5px;
                  }
                  .orange-background,
                  .card-header,
                  .booking-title {
                    background-color: rgb(255, 165, 0) !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  thead tr {
                    background-color: rgb(255, 165, 0) !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  thead th {
                    background-color: rgb(255, 165, 0) !important;
                    color: black !important;
                    vertical-align: middle !important;
                    padding: 5px !important;
                    font-weight: bold;
                    text-align: center !important;
                    font-size: 12px !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="border">
                <div class="header-row">
                
                  <div><img src="${invoiceItem.header.invoiceImage}" alt="Company Logo" class="logo"></div>
                  <div>
                    <img src="${invoiceItem.header.invoiceHeader}" alt="Company Logo" class="logo">
                  </div>
                  <div><img src="${invoiceItem.header.invoiceImage}" alt="Company Logo" class="logo"></div>
                </div>
                
                <div class="orange-background">
                 Proforma Invoice
                </div>
                
                <table class="table-bordered">
                  <tr><td width="50%">To:</td><td>INVOICE NO : ${invoiceItem.invoiceUniqueNumber}</td></tr>
                  <tr><td>${invoiceItem.header.ProformaCustomerName}</td><td>DATE :${invoiceItem.header.ProformaInvoiceDate}</td></tr>
                  <tr><td>${invoiceItem.header.ProformaAddress}</td><td>PAN :${invoiceItem.header.ProformaPanNO}</td></tr>
                  <tr><td>${invoiceItem.header.ProformaCity}-${invoiceItem.header.ProformaPincode}</td><td>GST NO :${invoiceItem.header.ProformaGstNumber}</td></tr>
                  <tr><td>GST NO : ${invoiceItem.header.ProformaGstNo}</td><td>TYPE OF Aircraft : ${invoiceItem.header.ProformaTypeOfAircraft}</td></tr>
                  <tr><td>PAN NO :${invoiceItem.header.ProformaPan}</td><td>SEATING CAPACITY : ${invoiceItem.header.ProformaSeatingCapasity}</td></tr>
                </table>
    
                <div class="card-header">
                  Charges DETAILS
                </div>
                
                <table class="table-bordered">
                  <tr><td width="50%">Date Of Journey</td><td>${invoiceItem.header.BookingDateOfJourny}</td></tr>
                  <tr><td>SECTOR</td><td>${invoiceItem.header.BookingSector}</td></tr>
                  <tr><td>BILLING FLYING TIME</td><td>${invoiceItem.header.BookingBillingFlyingTime} Hrs.</td></tr>
                </table>
    
                <table class="table-bordered">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Description</th>
                      <th>Units (Hrs.)</th>
                      <th>Rate (INR)</th>
                      <th>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                 <tr>
                  <td>1</td>
                  <td class="bold">Charges</td>
                  <td class="text-right"></td>
                  <td class="text-right"></td>
                  <td></td>
                </tr>
                    ${invoiceItem.chargesList.map((charge, index) => `
                      <tr>
                       
                         <td class="text-center"></td>
                        <td>${charge.description}</td>
                        <td class="text-center">${charge.units}</td>
                        <td class="text-right">${charge.rate}</td>
                        <td class="text-right">${charge.amount}</td>
                      </tr>
                    `).join('')}
                    
                    <tr>
                      <td colspan="4" class="text-right bold">Total</td>
                      <td class="text-right bold">${invoiceItem.subtotal}</td>
                    </tr>
                    <tr>
                  <td>2</td>
                        <td class="bold">Taxes:</td>
                        <td></td>
                        <td></td>
                        <td></td>
                  </tr>
    
                    ${invoiceItem.taxList.map(tax => `
                      <tr>
                        <td></td>
                        <td>${tax.description}</td>
                        <td></td>
                        <td></td>
                        <td class="text-right">${tax.amount}</td>
                      </tr>
                    `).join('')}
    
                    <tr>
                      <td colspan="4" class="text-right bold">Grand Total</td>
                      <td class="text-right bold">${invoiceItem.grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
    
                <div class="border">
                
                <div class="card-header">
                  Bank DETAILS
                </div>
                  <div style="padding: 5px;">
                    <div class="notes">
                      <p><strong>Note:</strong></p>
                      <p>${invoiceItem.header.notes}</p>
                      
                    </div>
                      <div class="header-row">
                        <div>
                          <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                            <div style="width: 30%; font-weight: bold;">ACCOUNT NAME:</div>
                            <div style="width: 70%;">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</div>
                          </div>
                          <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                            <div style="width: 30%; font-weight: bold;">BANK:</div>
                            <div style="width: 70%;">KOTAK MAHINDRA BANK</div>
                          </div>
                          <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                            <div style="width: 30%; font-weight: bold;">ACCOUNT NO:</div>
                            <div style="width: 70%;">0745211990</div>
                          </div>
                          <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                            <div style="width: 30%; font-weight: bold;">BRANCH:</div>
                            <div style="width: 70%;">BANJARAHILLS</div>
                          </div>
                          <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                            <div style="width: 30%; font-weight: bold;">IFSC CODE:</div>
                            <div style="width: 70%;">KKBK00007461(NEFT/RTGS)</div>
                          </div>
                        </div>
                        <div><p class="footer-text">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
                      <p>Authorised Signatory</p></div>
                      </div>
                    
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  updateStatus(invoice: any, status: string) {
    // Confirm before changing status
    if (confirm(`Are you sure you want to ${status.toLowerCase()} this invoice?`)) {
      invoice.status = status;

      // If you are updating status in the backend, call the API here
      // Example:
      // this.invoiceService.updateInvoiceStatus(invoice.id, status).subscribe(response => {
      //   console.log("Status updated:", response);
      // }, error => {
      //   console.error("Error updating status:", error);
      // });

      console.log(`Invoice ${invoice.invoiceUniqueNumber} status changed to ${status}`);
    }
  }



}




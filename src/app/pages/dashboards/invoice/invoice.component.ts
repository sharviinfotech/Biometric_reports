import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NumberToWordsService } from 'src/app/number-to-words.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ImageService } from 'src/app/image.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
interface TaxItem {
  description: string;
  percentage: number;
  amount: number;
}
interface ChargeItem {
  description: string;
  units?: string | null;  // Adding 'units' property
  rate: number;
  amount: number;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BsDatepickerModule,NgxSpinnerModule],
  standalone: true
})
export class InvoiceComponent implements OnInit {
  statesList: any[] = [];
  newInvoiceCreation!: FormGroup;
  showNewInvoice = false;
  panForm: FormGroup;
  isDropdownOpen = false;
  selectedInvoiceType: string | null = null;
  // selectedInvoiceType: string = '';
  activeTab: string = 'AllInvoice'; // Change this based on tab logic
  
  logoUrl: string | null = null;
  InvoiceLogo:string | null = null;
  isHoveringLogo: boolean = false;
  isHoveringRemove: boolean = false;
  StateName: string = '';
  showCGST_SGST = false;
  showIGST = false;
  proformaCardHeaderName: any;
  proformaCardHeaderId: null;
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
   
  }
  selectInvoiceType(type){
    this.proformaCardHeaderId = null
    this.proformaCardHeaderName = null
    this.proformaCardHeaderId = type

    if(this.proformaCardHeaderId == "PQ"){
     this.proformaCardHeaderName = "Proforma Invoice"
    }else{
      this.proformaCardHeaderName = "Tax Invoice"

    }
    this.activeTab = "NewInvoice";
    this.isDropdownOpen = false
    console.log("this.proformaCardHeaderId",this.proformaCardHeaderId,this.proformaCardHeaderName)

  }
 
 
  
  
  
  
  

  hoveredIndex: number = -1; 
  // chargeItems: ChargeItem[] = [
  //   {
  //     description: 'HYDERABAD-CHENNAI-HYDERABAD',
  //     units: '03.30 Hrs.',  // Only for the first item
  //     rate: 150000,
  //     amount: 525000
  //   },
  //   {
  //     description: 'GROUND HANDLING CHARGES',
  //     units: null,  // No units for this item
  //     rate: 120000,
  //     amount: 120000
  //   },
  //   {
  //     description: 'B.L.T CHARGES',
  //     units: null,  // No units
  //     rate: 0,
  //     amount: 0
  //   },
  //   {
  //     description: 'A.M.E CHARGES',
  //     units: null,  // No units
  //     rate: 0,
  //     amount: 0
  //   }
  // ];
  chargeItems: ChargeItem[] = [];
  // taxItems: TaxItem[] = [];
  taxItems: TaxItem[] = [
    {
      description: 'CGST @ 9%',
      percentage: 9,
      amount: 0
    },
    {
      description: 'SGST @ 9%',
      percentage: 9,
      amount: 0
    },
    {
      description: 'IGST @ 18%',
      percentage: 18,
      amount: 0
    }
  ];
  show: boolean = true
  subtotal: number;
  grandTotal: number;
  amountInWords: string = '';

  @ViewChild('logoInput') logoInput!: ElementRef;
  allInvoiceList: any;
  invoiceRefNo: number;

  // getstateList: any;

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  invoiceItem: any;
  loginData: any;
  reSubmitInvoice: boolean;
  reSubmitInvoiceStatus: any;
  reason: any;
  invoiceApprovedOrRejectedByUser: any;
  invoiceApprovedOrRejectedDateAndTime: any;
  constructor(private fb: FormBuilder, private numberToWordsService: NumberToWordsService, private service: GeneralserviceService, private datePipe: DatePipe, private spinner: NgxSpinnerService,private imageService: ImageService,private toaster: ToastrService) {
    this.newInvoiceCreation = this.fb.group({
      invoiceHeader: [''],
      ProformaCustomerName: ['', Validators.required],
      ProformaAddress: ['', Validators.required],
      ProformaCity: ['', Validators.required],
      ProformaState: ['', Validators.required],
      ProformaPincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]
      ],
      ProformaGstNo: ['', Validators.required],
      ProformaPanNO: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)  // Correct PAN format
        ]
      ],

      ProformaInvoiceNumber: [''],
      ProformaInvoiceDate: ['', Validators.required],
      ProformaPan: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)  // PAN format validation: 4 capital letters, 4 digits, 1 capital letter
        ]
      ],

      ProformaGstNumber: ['', Validators.required],
      proformatypeOfAircraft: ['', Validators.required],
      proformaseatingcapasity: ['', Validators.required],
      notes: [''],
      bookingdateOfjourny: ['', Validators.required],
      bookingsector: ['', Validators.required],
      bookingbillingflyingtime: ['', Validators.required],
      // accountName: [''],
      // bankname: [''],
      // accountNumber: [''],
      // branch:[''],
      // ifscCode: ['']
    });


  }

  ngOnInit(): void {
    console.log("taxlist", this.taxItems)

    this.getAllInvoice()
    this.getStates();
    this.loginData = null
    this.logoUrl = this.imageService.getBase64FlightLogo(); 
    this.InvoiceLogo = this.imageService.getBase64WorldLogo(); 
    this.loginData= this.service.getLoginResponse()
   console.log("this.loginData",this.loginData);

  }
  getStates() {
    this.spinner.show();
    this.service.getstateList().subscribe(
      (response: any) => {
        this.spinner.hide()
        if (response && response.responseData) {
          this.statesList = response.responseData.data;
        }
      },
      (error) => {

        console.error('Error fetching statesList:', error);
      }
    );
  }
  onChangeState() {
    this.taxItems = []
    const selectedState = this.newInvoiceCreation.value.ProformaState
    const seletedObj = this.statesList.find(item => item.stateName == selectedState);
    console.log("seletedObj", seletedObj)
    if (seletedObj.stateName == 'Telangana') {
      this.taxItems = [
        {
          description: 'CGST @ 9%',
          percentage: 9,
          amount: 0
        },
        {
          description: 'SGST @ 9%',
          percentage: 9,
          amount: 0
        },

      ];
    } else {
      this.taxItems = [

        {
          description: 'IGST @ 18%',
          percentage: 18,
          amount: 0
        }
      ];
    }

    console.log("this.activeTab ",this.activeTab ,this.subtotal)
   if( this.activeTab == 'Edit' && this.subtotal){
    console.log("if state")
    this.calculateTotals()
   } else{
    console.log("else state")
   }
  }


  getAllInvoice() {
    this.allInvoiceList = []
    this.spinner.show()
    this.service.getAllInvoice().subscribe((res: any) => {
      console.log("getAllInvoice", res);
      this.spinner.hide()
      this.allInvoiceList = res.data;
    })
  }



  selectedInvoice: any = null; // Stores the selected invoice
  isEditing = false; // Determines whether edit mode is active


  // Field configurations for form rendering
  invoiceFields = [
    { label: 'Company Name', controlName: 'companyName', placeholder: 'Enter company name' },
    { label: 'Date', controlName: 'date', placeholder: 'Enter date' },
    { label: 'City', controlName: 'city', placeholder: 'Enter city' },
    { label: 'invoiceReferenceNo', controlName: 'invoiceReferenceNo', placeholder: 'Enter invoiceReferenceNo' },
  ];
spinnerHideMethod(){
  this.spinner.show()
  setTimeout(() => {
    this.spinner.hide()
  }, 1000); // Delay of 2 seconds
}

  // Method to select and show an invoice
  selectInvoice(invoice: any) {
    this.reSubmitInvoice = false
    this.invoiceItem = null
    this.invoiceItem = invoice
    console.log("invoice", invoice)
    console.log("this.invoiceItem", this.invoiceItem.invoiceReferenceNo);
    console.log("this.invoiceItem.header.status", this.invoiceItem.header.status)
    
    if (this.invoiceItem.status == "Approved") {
      console.log("If approved")
      Swal.fire({
        // title: 'question',
        text: 'The selected invoice has been approved,Do you want to Preview Invoice?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
          this.activeTab = 'Preview'
          this.spinnerHideMethod()
          
        } else {
          // this.spinnerHideMethod()
          this.getAllInvoice()
          this.invoiceItem = null
          this.reSubmitInvoice = false
        }
      });
    }
    else {

      if (this.invoiceItem.status == "Rejected") {
        console.log("If rejected")
        Swal.fire({
          text: 'The selected invoice has been rejected.Do you still want to edit it to make changes and resubmit, or just preview the invoice?',
          icon: 'info',
          showCancelButton: true,  // Cancel Button
          cancelButtonText: 'Cancel',
          showDenyButton: true,  // Preview Button
          denyButtonText: 'Preview',
          showConfirmButton: true,  // Edit Button
          confirmButtonText: 'Edit',
        }).then((result) => {
          if (result.isConfirmed) {
            // Edit action
            this.editRow(invoice);
            this.reSubmitInvoice = true
            this.reSubmitInvoiceStatus = "Rejected_Reversed"
          } else if (result.isDenied) {
            // Preview action
            this.invoiceItem = invoice;
            console.log("this.invoiceItem", this.invoiceItem);
            this.activeTab = 'Preview';
            this.spinnerHideMethod()
            this.reSubmitInvoice = false
          } else {
            // Cancel action (Optional: You can add any logic if needed)
            console.log("Action Cancelled");
            this.getAllInvoice()
            this.invoiceItem = null
            this.reSubmitInvoice = null
            // this.spinnerHideMethod()
          }
        });


        // Swal.fire({
        //   // title: 'question',
        //   text: 'The selected invoice has been rejected',
        //   icon: 'info',
        //   showCancelButton: true,
        //   showConfirmButton: true,
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     this.invoiceItem = invoice
        //     console.log("this.invoiceItem", this.invoiceItem)
        //     this.activeTab = 'Preview'
        //     this.spinnerHideMethod()
        //   } else {
        //     this.invoiceItem = invoice
        //     console.log("this.invoiceItem", this.invoiceItem)
        //     // this.spinnerHideMethod()
        //     this.getAllInvoice()
        //     this.invoiceItem = null
        //   }
        // });
      } else {
        console.log("If pending");
        Swal.fire({
          text: 'Do you want to Edit or Preview the Invoice?',
          icon: 'info',
          showCancelButton: true,  // Cancel Button
          cancelButtonText: 'Cancel',
          showDenyButton: true,  // Preview Button
          denyButtonText: 'Preview',
          showConfirmButton: true,  // Edit Button
          confirmButtonText: 'Edit',
        }).then((result) => {
          if (result.isConfirmed) {
            // Edit action
            this.editRow(invoice);
            this.reSubmitInvoice = false
          } else if (result.isDenied) {
            // Preview action
            this.invoiceItem = invoice;
            console.log("this.invoiceItem", this.invoiceItem);
            this.activeTab = 'Preview';
            this.spinnerHideMethod()
            this.reSubmitInvoice = false
          } else {
            // Cancel action (Optional: You can add any logic if needed)
            console.log("Action Cancelled");
            this.getAllInvoice()
            this.invoiceItem = null
            this.reSubmitInvoice = false
            // this.spinnerHideMethod()
          }
        });

      }

    }


  }
  editRow(invoice) {
    this.reSubmitInvoiceStatus = null
    this.reason =null ,
    this.invoiceApprovedOrRejectedByUser =null ,
    this.invoiceApprovedOrRejectedDateAndTime =null ,
    this.spinnerHideMethod()
    this.chargeItems = [];
    this.taxItems = [];
    this.subtotal = 0;
    this.grandTotal = 0
    this.selectedInvoice = null
    this.selectedInvoice = invoice;
    console.log("this.selectedInvoice", this.selectedInvoice)
    this.invoiceRefNo = null
    this.invoiceRefNo = this.selectedInvoice.invoiceReferenceNo
    console.log("this.invoiceRefNo", this.invoiceRefNo,this.selectedInvoice.invoiceUniqueNumber)
    this.isEditing = false;
    this.activeTab = "Edit"
    this.show = false;
    this.newInvoiceCreation.patchValue({
      // invoiceHeader: this.selectedInvoice.header.invoiceHeader,
      ProformaCustomerName: this.selectedInvoice.header.ProformaCustomerName,
      ProformaAddress: this.selectedInvoice.header.ProformaAddress,
      ProformaCity: this.selectedInvoice.header.ProformaCity,
      ProformaState: this.selectedInvoice.header.ProformaState,
      ProformaPincode: this.selectedInvoice.header.ProformaPincode,
      ProformaGstNo: this.selectedInvoice.header.ProformaGstNo,
      ProformaPanNO: this.selectedInvoice.header.ProformaPanNO,
      ProformaInvoiceNumber: this.selectedInvoice.invoiceUniqueNumber,
      ProformaInvoiceDate: this.selectedInvoice.header.ProformaInvoiceDate,
      ProformaPan: this.selectedInvoice.header.ProformaPan,
      ProformaGstNumber: this.selectedInvoice.header.ProformaGstNumber,
      proformatypeOfAircraft: this.selectedInvoice.header.ProformaTypeOfAircraft,
      proformaseatingcapasity: this.selectedInvoice.header.ProformaSeatingCapasity,
      notes: this.selectedInvoice.header.notes,
      bookingdateOfjourny: this.selectedInvoice.header.BookingDateOfJourny,
      bookingsector: this.selectedInvoice.header.BookingSector,
      bookingbillingflyingtime: this.selectedInvoice.header.BookingBillingFlyingTime,
      // accountName: this.selectedInvoice.bankDetails.accountName,
      // bankname: this.selectedInvoice.bankDetails.bank,
      // accountNumber: this.selectedInvoice.bankDetails.accountNumber,
      // branch:this.selectedInvoice.bankDetails.branch,
      // ifscCode:this.selectedInvoice.bankDetails.ifscCode 
    })

    this.chargeItems = this.selectedInvoice.chargesList;
    this.taxItems = this.selectedInvoice.taxList;
    this.subtotal = this.selectedInvoice.subtotal;
    this.grandTotal = this.selectedInvoice.grandTotal
    this.amountInWords = this.selectedInvoice.amountInWords
    this.logoUrl = this.selectedInvoice.header.invoiceImage
    this.InvoiceLogo = this.selectedInvoice.header.invoiceHeader
    this.reSubmitInvoiceStatus =this.selectedInvoice.status 
    this.reason =this.selectedInvoice.reason ,
    this.invoiceApprovedOrRejectedByUser =this.selectedInvoice.invoiceApprovedOrRejectedByUser ,
    this.invoiceApprovedOrRejectedDateAndTime =this.selectedInvoice.invoiceApprovedOrRejectedDateAndTime 
    
if(this.logoUrl == ''|| this.logoUrl == null){
  this.logoUrl = this.imageService.getBase64FlightLogo(); 
}
if(this.InvoiceLogo== ''|| this.InvoiceLogo == null){
  this.InvoiceLogo = this.imageService.getBase64WorldLogo(); 

}
    console.log("this.selectedInvoice.header.invoiceUniqueNumber", this.selectedInvoice.invoiceUniqueNumber)
    console.log("this.newInvoiceCreation", this.newInvoiceCreation.value.ProformaInvoiceNumber)
  }
  resetAll() {
    // this.logoUrl = ""
    this.amountInWords = ""
    this.chargeItems = [];
    this.taxItems = [];
    this.subtotal = 0;
    this.grandTotal = 0
    this.selectedInvoice = null
    this.newInvoiceCreation.patchValue({
      invoiceHeader: "",
      ProformaCustomerName: "",
      ProformaAddress: "",
      ProformaCity: "",
      ProformaState: "",
      ProformaPincode: "",
      ProformaGstNo: "",
      ProformaPanNO: "",
      ProformaInvoiceNumber: "",
      ProformaInvoiceDate: "",
      ProformaPan: "",
      ProformaGstNumber: "",
      proformatypeOfAircraft: "",
      proformaseatingcapasity: "",
      // bookingdetailsdateofjourney:"" ,
      // bookingdetailssector: "",
      // bookingdetailsbillingflyingtime: "",
      notes: "",
      bookingdateOfjourny: "",
      bookingsector: "",
      bookingbillingflyingtime: "",
      // accountName: "",
      // bankname: "",
      // accountNumber:"",
      // branch:"",
      // ifscCode:"" 
    })
    setTimeout(() => {
      this.spinner.hide()
      console.log("enter into new or all spinner")
    }, 1000); // Delay of 2 seconds
  }

  backButton() {
    this.show = true
    this.activeTab = "AllInvoice"
  }

  // Method to preview an invoice
  previewInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = false;
  }

  // Method to edit an invoice
  editInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = true;
  }
  setTab(tabName: string) {
    this.spinner.show()
    
    if(tabName == 'AllInvoice' || tabName == 'NewInvoice'){
      this.activeTab = tabName;
      this.invoiceItem = null
      console.log("this.activeTab", this.activeTab);
      this.resetAll()
      this.show=true
      
    }else{
      this.activeTab = tabName;
      setTimeout(() => {
        this.spinner.hide()
        console.log('setTab else this.invoiceItem',this.invoiceItem)
        console.log('newInvoiceCreation',this.newInvoiceCreation.value)
      }, 1000); // Delay of 2 seconds
     
     
    }
   
    
  }


  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = () => {
        this.logoUrl = reader.result as string; // Store the image URL
        console.log("Image logoUrl:", this.logoUrl);
      };

      reader.readAsDataURL(input.files[0]); // Convert file to base64 URL
    }
  }

  removeLogo(event: Event): void {
    event.preventDefault();
    this.logoUrl = 'assets/images/AircraftFlight.png';
  }

  addChargeItem() {

    if(this.newInvoiceCreation.value.ProformaState){
      this.chargeItems.push({
        description: '',
        rate: 0,
        amount: 0
      });
      console.log("this.chargeItems addChargeItem",this.chargeItems)
    }else{
      // this.toaster.warning("Please select State and Add Charges")
      Swal.fire( `Please select State and Add Charges`);
    }
    
  }
  deleteChargeItem(index: number) {
    this.chargeItems.splice(index, 1); // Remove the selected item
    this.calculateTotals(); // Recalculate totals
    console.log("this.chargeItems",this.chargeItems)
  }
  

  addTaxItem(): void {
    this.taxItems.push({ description: '', percentage: 0, amount: 0 });
  }

  calculateTotals() {
    this.subtotal = 0
    this.grandTotal = 0
    // Loop through each charge item and calculate the amount
    this.chargeItems.forEach(item => {
      // If there are units, convert to hours and calculate the amount
      if (item.units) {
        const unitsInHours = this.convertUnitsToHours(item.units);
        item.amount = unitsInHours * item.rate; // Calculate amount based on rate and hours
      } else if (item.rate) {
        // If no units are provided, calculate amount based only on rate (assuming 1 unit)
        item.amount = item.rate; // If no units, assume 1 unit for calculation
      } else {
        // If no rate or units, set amount to 0
        item.amount = 0;
      }
    });

    this.subtotal = this.chargeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Calculate tax amounts based on subtotal
    this.taxItems.forEach(tax => {
      tax.amount = Math.round(this.subtotal * (Number(tax.percentage) / 100));
    });

    // Calculate grand total (subtotal + tax amounts)
    this.grandTotal = this.subtotal + this.taxItems.reduce((sum, tax) => sum + (Number(tax.amount) || 0), 0);

    // Convert amount to words
    this.amountInWords = this.numberToWordsService.convert(this.grandTotal);

    // Debugging logs
    console.log("chargeItems", this.chargeItems);
    console.log("taxItems", this.taxItems);
    console.log("subtotal", this.subtotal);
    console.log("grandTotal", this.grandTotal);
    console.log("amountInWords", this.amountInWords);

  }



  convertUnitsToHours(units: string | null): number {
    if (!units || units.trim() === '') return 0;

    // Clean up the 'Hrs.' part from the input
    const cleanUnits = units.replace(' Hrs.', '').trim();

    // Split the units by '.'
    const parts = cleanUnits.split('.');
    if (parts.length !== 2) return 0;  // Ensure there are exactly 2 parts (hours and minutes)

    let hours = Number(parts[0]);  // Use 'let' instead of 'const' for reassignment
    let minutes = Number(parts[1]); // Use 'let' instead of 'const' for reassignment

    // Validate the parsed values to avoid NaN issues
    if (isNaN(hours) || isNaN(minutes)) return 0; // Return 0 if any value is NaN

    // Ensure hours and minutes are within valid ranges
    if (hours > 24) hours = 24; // Max hours can be 24
    if (minutes >= 60) minutes = 59; // Max minutes can be 59

    return hours + minutes / 60; // Convert units to decimal hours
  }
  formatDate(proformaInvoiceDate: string): string {
    const date = new Date(proformaInvoiceDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  CreateInvoice(): void {
    

    console.log('this.newInvoiceCreation', this.newInvoiceCreation.invalid);
    if (this.newInvoiceCreation.invalid == true) {
      console.log('this.newInvoiceCreation', this.newInvoiceCreation);
      this.newInvoiceCreation.markAllAsTouched();

    } else {
      console.log('Invoice Saved', this.newInvoiceCreation.value);
      let invoiceDate = this.newInvoiceCreation.value.ProformaInvoiceDate;
      let bookingDate = this.newInvoiceCreation.value.bookingdateOfjourny;
  
      // ✅ Check if the date is already in 'DD-MM-YYYY' format
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  
      if (!dateRegex.test(invoiceDate)) {
        invoiceDate = this.formatDate(invoiceDate);
      }
  
      if (!dateRegex.test(bookingDate)) {
        bookingDate = this.formatDate(bookingDate);
      }
      console.log("invoiceDateSplit",invoiceDate,"bokingDateSplit",bookingDate)
      let createobj = {
        "header": {
          "invoiceHeader": this.InvoiceLogo,
          "invoiceImage": this.logoUrl,
          "ProformaCustomerName": this.newInvoiceCreation.value.ProformaCustomerName,
          "ProformaAddress": this.newInvoiceCreation.value.ProformaAddress,
          "ProformaCity": this.newInvoiceCreation.value.ProformaCity,
          "ProformaState": this.newInvoiceCreation.value.ProformaState,
          "ProformaPincode": this.newInvoiceCreation.value.ProformaPincode,
          "ProformaGstNo": this.newInvoiceCreation.value.ProformaGstNo,
          "ProformaPanNO": this.newInvoiceCreation.value.ProformaPanNO,
          "ProformaInvoiceNumber": this.newInvoiceCreation.value.ProformaInvoiceNumber,
          "ProformaInvoiceDate": invoiceDate,
          "ProformaPan": this.newInvoiceCreation.value.ProformaPan,
          "ProformaGstNumber": this.newInvoiceCreation.value.ProformaGstNumber,
          "ProformaTypeOfAircraft": this.newInvoiceCreation.value.proformatypeOfAircraft,
          "ProformaSeatingCapasity": this.newInvoiceCreation.value.proformaseatingcapasity,
          "notes": this.newInvoiceCreation.value.notes,
          "BookingDateOfJourny": bookingDate,
          "BookingSector": this.newInvoiceCreation.value.bookingsector,
          "BookingBillingFlyingTime": this.newInvoiceCreation.value.bookingbillingflyingtime
        },
        "chargesList": this.chargeItems,
        "taxList": this.taxItems,
        "subtotal": this.subtotal,
        "grandTotal": this.grandTotal,
        "amountInWords": this.amountInWords,
        "reason":'',
        "invoiceApprovedOrRejectedByUser":"",
        "invoiceApprovedOrRejectedDateAndTime":"",
        "loggedInUser":this.loginData.userName,
        "status":"Pending",
        "proformaCardHeaderId":this.proformaCardHeaderId,
        "proformaCardHeaderName":this.proformaCardHeaderName
        
        // "bankDetails":{
        //     "accountName":this.newInvoiceCreation.value.accountName,
        //     "bank":this.newInvoiceCreation.value.bank,
        //     "accountNumber":this.newInvoiceCreation.value.accountNumber,
        //     "branch":this.newInvoiceCreation.value.branch,
        //     "ifscCode":this.newInvoiceCreation.value.ifscCode
        // }
      };
      console.log('Payload sent to backend:', createobj);
      this.spinner.show()
      this.service.CreateInvoice(createobj).subscribe((response: any) => {
        console.log("CreateInvoice", response);
        this.spinner.hide()
        const resp = response.data;
        if (resp) {
          this.getAllInvoice()

          this.activeTab = 'AllInvoice'
          // Reset form and related data
          this.newInvoiceCreation.reset();
          // this.logoUrl = '';
          this.chargeItems = [];
          this.taxItems = [];
          this.subtotal = 0;
          this.grandTotal = 0;
          this.amountInWords = '';
          this.resetAll()
          Swal.fire({
            text: response.message + ' with Invoice Number ' + resp.invoiceUniqueNumber,
            icon: 'success',
            showConfirmButton: true
          });

        } else {
          this.spinner.hide()
          Swal.fire({
            text: 'failed to fetch data ',
            icon: 'error',
            showConfirmButton: true
          });
        }
      }, (error) => {
        // Handle error'
        this.spinner.hide()
        console.log('Error creating invoice:', error);
        Swal.fire({
          text: 'An error occurred while creating the invoice',
          icon: 'error',
          showConfirmButton: true
        });
      });
    }
  }

  numbersOnly(event: any) {
    const charCode = event.charCode;
    if (!(charCode >= 48 && charCode <= 57) && ![8, 9, 37, 39, 46].includes(charCode)) {
      event.preventDefault();
    }
  }

  UpdateInvoice(): void {
    

    if (this.newInvoiceCreation.valid) {
      console.log('Invoice Updated', this.newInvoiceCreation.value);

      let invoiceDate = this.newInvoiceCreation.value.ProformaInvoiceDate;
    let bookingDate = this.newInvoiceCreation.value.bookingdateOfjourny;

    // ✅ Check if the date is already in 'DD-MM-YYYY' format
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

    if (!dateRegex.test(invoiceDate)) {
      invoiceDate = this.formatDate(invoiceDate);
    }

    if (!dateRegex.test(bookingDate)) {
      bookingDate = this.formatDate(bookingDate);
    }
    
    
      // Implement update logic here
      let updateobj = {

        "invoiceReferenceNo": this.invoiceRefNo,
        "header": {
          "invoiceHeader": this.InvoiceLogo,
          "invoiceImage": this.logoUrl,
          "ProformaCustomerName": this.newInvoiceCreation.value.ProformaCustomerName,
          "ProformaAddress": this.newInvoiceCreation.value.ProformaAddress,
          "ProformaCity": this.newInvoiceCreation.value.ProformaCity,
          "ProformaState": this.newInvoiceCreation.value.ProformaState,
          "ProformaPincode": this.newInvoiceCreation.value.ProformaPincode,
          "ProformaGstNo": this.newInvoiceCreation.value.ProformaGstNo,
          "ProformaPanNO": this.newInvoiceCreation.value.ProformaPanNO,
          "ProformaInvoiceNumber": this.newInvoiceCreation.value.ProformaInvoiceNumber,
          "ProformaInvoiceDate": invoiceDate,
          "ProformaPan": this.newInvoiceCreation.value.ProformaPan,
          "ProformaGstNumber": this.newInvoiceCreation.value.ProformaGstNumber,
          "ProformaTypeOfAircraft": this.newInvoiceCreation.value.proformatypeOfAircraft,
          "ProformaSeatingCapasity": this.newInvoiceCreation.value.proformaseatingcapasity,
          "notes": this.newInvoiceCreation.value.notes,
          "BookingDateOfJourny": bookingDate,
          "BookingSector": this.newInvoiceCreation.value.bookingsector,
          "BookingBillingFlyingTime": this.newInvoiceCreation.value.bookingbillingflyingtime
        },
        "chargesList": this.chargeItems,
        "taxList": this.taxItems,
        "subtotal": this.subtotal,
        "grandTotal": this.grandTotal,
        "amountInWords": this.amountInWords,
        "reason":this.reason,
        "invoiceApprovedOrRejectedByUser":this.invoiceApprovedOrRejectedByUser,
        "invoiceApprovedOrRejectedDateAndTime":this.invoiceApprovedOrRejectedDateAndTime,
        "loggedInUser":this.loginData.userName,
        
       "status":this.reSubmitInvoiceStatus
        // "bankDetails":{
        //     "accountName":this.newInvoiceCreation.value.accountName,
        //     "bank":this.newInvoiceCreation.value.bank,
        //     "accountNumber":this.newInvoiceCreation.value.accountNumber,
        //     "branch":this.newInvoiceCreation.value.branch,
        //     "ifscCode":this.newInvoiceCreation.value.ifscCode
      };
      console.log('Payload sent to backend:', updateobj);
      this.spinner.show()
      this.service.UpdateInvoice(updateobj, this.invoiceRefNo).subscribe((response: any) => {
        console.log("updateInvoice", response);
        this.spinner.hide()
        const resp = response.updatedInvoice;
        if (resp) {
          this.getAllInvoice()
          // Reset form and related data
          this.newInvoiceCreation.reset();
          // this.logoUrl = '';
          this.chargeItems = [];
          this.taxItems = [];
          this.subtotal = 0;
          this.grandTotal = 0;
          this.amountInWords = '';
          this.activeTab = "AllInvoice"
          this.resetAll()
          this.show=true
          Swal.fire({
            text: response.message,
            icon: 'success',
            showConfirmButton: true
          });
          this.invoiceItem = null

        } else {
          this.spinner.hide()
          Swal.fire({
            text: 'Failed to Update data ',
            icon: 'error',
            showConfirmButton: true
          });
        }
      }, (error) => {
        // Handle error
        this.spinner.hide()
        console.log('Error updating invoice:', error);
        Swal.fire({
          text: 'An error occurred while updating the invoice',
          icon: 'error',
          showConfirmButton: true
        });
      });
    } else {
      this.spinner.hide()
      console.log('Form is invalid');
      Swal.fire({
        text: 'Please fill out the form correctly.',
        icon: 'warning',
        showConfirmButton: true
      });
    }
  }
  convertToUppercase(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }
  
  restrictToNumbers(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = event.key;
  
    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent non-numeric input
    }
  }
  




}

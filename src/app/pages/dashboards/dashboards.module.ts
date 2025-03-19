import { NgModule } from '@angular/core';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import { SampleComponentComponent } from './default/sample-component/sample-component.component';

import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BiometricreportsComponent } from './biometricreports/biometricreports.component';
import { UserCreationComponent } from './user-creation/user-creation.component';

@NgModule({
  declarations: [
    SampleComponentComponent,
    // UserCreationComponent,
    // BiometricreportsComponent,
    // InvoiceUserCreationComponent,
    // InvoiceReportsComponent,
    // InvoiceComponent,
    // InvoiceLayoutComponent
  ],
  imports: [
    DashboardsRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),  // Ensure it's in the imports array
    NgxSpinnerModule

  ],
  providers: [BsDropdownConfig],
})
export class DashboardsModule { }

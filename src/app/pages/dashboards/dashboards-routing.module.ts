import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './default/default.component';
import { SaasComponent } from './saas/saas.component';
import { CryptoComponent } from './crypto/crypto.component';
import { BlogComponent } from './blog/blog.component';
import { JobsComponent } from "./jobs/jobs.component";
import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceLayoutComponent } from './invoice-layout/invoice-layout.component';
import { InvoiceReportsComponent } from './invoice-reports/invoice-reports.component';
import { InvoiceUserCreationComponent } from './invoice-user-creation/invoice-user-creation.component';
import { InvoiceDecisionComponent } from './invoice-decision/invoice-decision.component';
import { CustomerCreationComponent } from './customer-creation/customer-creation.component';
import { ServiceChargesComponent } from './service-charges/service-charges.component';

const routes: Routes = [
    {
        path: 'default',
        component: DefaultComponent
    },
    {
        path: 'sampleComponent',
        component: SampleComponentComponent
    },
    {
        path: 'Invoice',
        component: InvoiceComponent
    },
    {
        path: 'InvoiceLayout',
        component: InvoiceLayoutComponent
    },
    {
        path: 'InvoiceReports',
        component: InvoiceReportsComponent
    },
    {
        path: 'InvoiceUserCreation',
        component: InvoiceUserCreationComponent
    },
    {
        path: 'InvoiceDecision',
        component: InvoiceDecisionComponent
    },
    {
        path: 'CustomerCreation',
        component: CustomerCreationComponent
    },
    {
        path: 'ServiceCharges',
        component: ServiceChargesComponent
    },
    // {
    //     path: 'saas',
    //     component: SaasComponent
    // },
    // {
    //     path: 'crypto',
    //     component: CryptoComponent
    // },
    // {
    //     path: 'blog',
    //     component: BlogComponent
    // },
    // {
    //     path:"jobs",
    //     component:JobsComponent
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}

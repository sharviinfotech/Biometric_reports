import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GeneralserviceService {

  allInvoices: any[] = []; // Store all invoices
  page: number = 1;
  pageSize: number = 10; // Adjust as needed
  data: any;
 
  setLoginDataList: any;
  userList: any;
  loginResponse: any;
  setTableData: any;
  

  
  constructor(private http: HttpClient) { }

  setLoginResponse(data){
    this.loginResponse = data;
}
getLoginResponse(){
    return  this.loginResponse;
}
  getAllInvoice(){
    return this.http.get(environment.baseUrl+'reports/getAllInvoices');
  }
  CreateInvoice(obj){
    return this.http.post(environment.baseUrl+'reports/createNewInvoice',obj);
  }
  
  UpdateInvoice(obj,invoiceRefNo){
    return this.http.put(environment.baseUrl+'updateInvoiceByReferenceNo/'+invoiceRefNo,obj);
  }
  getstateList(){
    return this.http.get(environment.baseUrl+'reports/stateList');
  }

  invoiceTemplate(obj){
    return this.http.post(environment.baseUrl+'reports/invoiceTemplate',obj);

  }
  userNewCreation(obj){
    return this.http.post(environment.baseUrl+'reports/userNewCreation',obj);

  }
  getAllUserList(){
    return this.http.get(environment.baseUrl+'reports/getAllUserList');
  }

  submitLogin(obj){
    return this.http.post(environment.baseUrl+'reports/authenticationLogin',obj);
  }
  updateExitUser(obj,){
    return this.http.post(environment.baseUrl+'reports/updateExitUser',obj);
  }
  invoiceApprovedOrRejected(obj){
    return this.http.post(environment.baseUrl+'reports/invoiceApprovedOrRejected',obj);
  }
  forgotPassword(obj){
    return this.http.post(environment.baseUrl+'reports/forgotPassword',obj);
  }
  getAllCustomerList(){
    return this.http.get(environment.baseUrl+'reports/getAllCustomerList');
  }
  savecustomerCreation(obj){
    return this.http.post(environment.baseUrl+'reports/SaveCustomerCreation',obj);
 
  }
  updateExitCustomer(obj,customerUniqueId){
    return this.http.put(environment.baseUrl+'reports/updateExitCustomer/'+customerUniqueId,obj);
 
  }

  // new API
  getEmployeeList(){
    return this.http.get(environment.baseUrl+'get/employeeList');
  }

  combinationOfMonthAndYear(obj){
    return this.http.post(environment.baseUrl+'get/combinationOfMonthAndYear',obj);
 
  }
  deteleGlobal(obj){
    return this.http.post(environment.baseUrl+'reports/deleteExitUser',obj);
 
  }

}

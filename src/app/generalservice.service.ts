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
    return this.http.get(environment.baseUrl+'invoice/getAllInvoices');
  }
  CreateInvoice(obj){
    return this.http.post(environment.baseUrl+'invoice/createNewInvoice',obj);
  }
  
  UpdateInvoice(obj,invoiceRefNo){
    return this.http.put(environment.baseUrl+'updateInvoiceByReferenceNo/'+invoiceRefNo,obj);
  }
  getstateList(){
    return this.http.get(environment.baseUrl+'invoice/stateList');
  }

  invoiceTemplate(obj){
    return this.http.post(environment.baseUrl+'invoice/invoiceTemplate',obj);

  }
  userNewCreation(obj){
    return this.http.post(environment.baseUrl+'invoice/userNewCreation',obj);

  }
  getAllUserList(){
    return this.http.get(environment.baseUrl+'invoice/getAllUserList');
  }

  submitLogin(obj){
    return this.http.post(environment.baseUrl+'invoice/authenticationLogin',obj);
  }
  updateExitUser(obj,userUniqueId){
    return this.http.put(environment.baseUrl+'invoice/updateExitUser/'+userUniqueId,obj);
  }
  invoiceApprovedOrRejected(obj){
    return this.http.post(environment.baseUrl+'invoice/invoiceApprovedOrRejected',obj);
  }
  forgotPassword(obj){
    return this.http.post(environment.baseUrl+'invoice/forgotPassword',obj);
  }
  getAllCustomerList(){
    return this.http.get(environment.baseUrl+'invoice/getAllCustomerList');
  }
  savecustomerCreation(obj){
    return this.http.post(environment.baseUrl+'invoice/SaveCustomerCreation',obj);
 
  }
  updateExitCustomer(obj,customerUniqueId){
    return this.http.put(environment.baseUrl+'invoice/updateExitCustomer/'+customerUniqueId,obj);
 
  }

  // new API
  getEmployeeList(){
    return this.http.get(environment.baseUrl+'get/employeeList');
  }

  combinationOfMonthAndYear(obj){
    return this.http.post(environment.baseUrl+'get/combinationOfMonthAndYear',obj);
 
  }
  deteleGlobal(obj){
    return this.http.post(environment.baseUrl+'invoice/deteleGlobal',obj);
 
  }

}

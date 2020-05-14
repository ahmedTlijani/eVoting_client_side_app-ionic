import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';
import { map, catchError, tap ,delay } from 'rxjs/operators';


@Injectable()
export class SpringAPiService {
  
  constructor(private myRoute: Router, private http: HttpClient) { }

  private baseurlElecteur ='http://localhost:8085/api/voter/';
  private verificationUrl = 'http://localhost:8085/api/verify-face/';
  private baseurlParti ='http://localhost:8085/api/parti/';

  
  public getOneElecteur(cin): Observable<any>
  {
    return(this.http.get(this.baseurlElecteur + 'get/' + cin));
  }

  public getOneElecteurByCinData(people: any): Observable<any> // we only need date naissance from people
  {
    return(this.http.post(this.baseurlElecteur + 'get-by-cin-date/' + people.cin, people));
  }

  // face verification 
  public verifierFace(dataObject: any) : Observable<any> // testing with spring api and python
  {
    let data = dataObject.image_captured;
    console.log(dataObject.personne.cin)
    return(this.http.post(this.verificationUrl + 'verify/'+ dataObject.personne.cin , data));
  }

  public getAllParti(): Observable<any>
  {
    return(this.http.get<[]>(this.baseurlParti + 'getAll'));
  }

  

}
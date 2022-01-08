import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanal, Status, Stellenangebot } from './model.Stellenangebot';

@Injectable({
  providedIn: 'root'
})
export class ServiceStellenangebote {

  private baseURL = "http://localhost:8080/ibm";

  constructor(private httpClient: HttpClient) { }

  getListeStatus(): Observable<Status[]>{
    return <Observable<Status[]>>this.httpClient.get<Status[]>(`${this.baseURL}/sd_status`);
  }

  getListeKanaele(): Observable<Kanal[]>{
    return <Observable<Kanal[]>>this.httpClient.get<Kanal[]>(`${this.baseURL}/sd_kanaele`);
  }

  getListeStellenangebote(): Observable<Stellenangebot[]>{
    return <Observable<Stellenangebot[]>>this.httpClient.get<Stellenangebot[]>(`${this.baseURL}/stellenangebote`);
  }


  getStellenangebotById(id: number): Observable<Stellenangebot>{
    return this.httpClient.get<Stellenangebot>(`${this.baseURL}/stellenangebote/${id}`);
  }


  /*
  getStellenangeboteList(): Observable<Stellenangebote[]>{
    return <Observable<Stellenangebote[]>>this.httpClient.get<Stellenangebote[]>(`${this.baseURL}`);
  }

  createStellenangebot(sa: Stellenangebote): Observable<Object>{
    return this.httpClient.post(`${this.baseURL}`, sa);
  }

  getStellenangebotById(id: number): Observable<Stellenangebote>{
    return this.httpClient.get<Stellenangebote>(`${this.baseURL}/${id}`);
  }

  updateStellenangebot(id: number, sa: Stellenangebote): Observable<Object>{
    return this.httpClient.put(`${this.baseURL}/${id}`, sa);
  }

  deleteStellenangebot(id: number): Observable<Object>{
    return this.httpClient.delete(`${this.baseURL}/${id}`);
  }
  */
}

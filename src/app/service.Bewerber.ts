import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanal, Status, Stellenangebot } from './model.Stellenangebot';
import { Bewerber } from './model.Bewerber';

@Injectable({
  providedIn: 'root'
})
export class ServiceBewerber {

  private baseURL = "http://localhost:8080/ibm";

  constructor(private httpClient: HttpClient) { }

  public getListeBewerber (id_stellenangebot: number): Observable<Bewerber[]> {

    // var bewerber!: Bewerber[];

    return <Observable<Bewerber[]>>this.httpClient.get<Bewerber[]>(`${this.baseURL}/bewerber/${id_stellenangebot}`);
  }

  /*
   * Holen von Stammmdaten - Tabelle SD_Kommunikation
   */
  getListeKommunikation(): Observable<Status[]>{
    return <Observable<Status[]>>this.httpClient.get<Status[]>(`${this.baseURL}/sd_kommunikation`);
  }

}

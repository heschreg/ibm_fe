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

  public getListeBewerber (idstellenangebot: number): Observable<Bewerber[]> {

    // var bewerber!: Bewerber[];

    return <Observable<Bewerber[]>>this.httpClient.get<Bewerber[]>(`${this.baseURL}/bewerber/${idstellenangebot}`);
  }

  /*
   * Holen von Stammmdaten - Tabelle SD_Kommunikation
   */
  getListeKommunikation(): Observable<Status[]>{
    return <Observable<Status[]>>this.httpClient.get<Status[]>(`${this.baseURL}/sd_kommunikation`);
  }

  /*
   * INSERTen eines neuen Bewerbers mit POST
   */
  public insBewerber(bew:Bewerber): Observable<Bewerber>{

    const url  = `${this.baseURL}/bewerber`;
    const body    = JSON.stringify(bew);
    const headers = {'content-type': 'application/json'};

    return this.httpClient.post<Bewerber>(url, body, {'headers':headers});

  }

  /*
   * UPDATen eines bestehenden Bewerbers mit PUT
   */
  public updBewerber(bew:Bewerber): Observable<Bewerber>{

    const url  = `${this.baseURL}/bewerber/${bew.id}`;
    const body    = JSON.stringify(bew);
    const headers = {'content-type': 'application/json'};

    return this.httpClient.put<Bewerber>(url, body, {'headers':headers});

  }


}

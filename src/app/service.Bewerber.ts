import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanal, Status, Stellenangebot } from './model.Stellenangebot';
import { Bewerber, Kommunikation, SD_Kommunikation } from './model.Bewerber';

@Injectable({
  providedIn: 'root'
})
export class ServiceBewerber {

  private baseURL = "http://localhost:8080/ibm";

  constructor(private httpClient: HttpClient) { }

  /*
   * Holen der Bewerber zu einem Stellenangebot - Tabelle "bewerber"
  */
  public getListeBewerber (idstellenangebot: number): Observable<Bewerber[]> {
    return <Observable<Bewerber[]>>this.httpClient.get<Bewerber[]>(`${this.baseURL}/bewerber/${idstellenangebot}`);
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

  /*
   * Holen der Kommunikationshistorie zum selektierten Bewerber
   */
  public getListeKommunikation (idbewerber: number): Observable<Kommunikation[]> {
    return <Observable<Kommunikation[]>>this.httpClient.get<Kommunikation[]>(`${this.baseURL}/kommunikation/${idbewerber}`);
  }


  /*
   * Holen von Stammmdaten - Tabelle SD_Kommunikation
   */
  getListeSdKommunikation(): Observable<SD_Kommunikation[]>{
    return <Observable<SD_Kommunikation[]>>this.httpClient.get<SD_Kommunikation[]>(`${this.baseURL}/sd_kommunikation`);
  }

}

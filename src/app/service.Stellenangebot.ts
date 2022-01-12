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

  /*
   *
   */
  getListeStatus(): Observable<Status[]>{
    return <Observable<Status[]>>this.httpClient.get<Status[]>(`${this.baseURL}/sd_status`);
  }

  /*
   *
   */
  getListeKanaele(): Observable<Kanal[]>{
    return <Observable<Kanal[]>>this.httpClient.get<Kanal[]>(`${this.baseURL}/sd_kanaele`);
  }

  /*
   *
   */
  getListeStellenangebote(): Observable<Stellenangebot[]>{
    return <Observable<Stellenangebot[]>>this.httpClient.get<Stellenangebot[]>(`${this.baseURL}/stellenangebot`);
  }


  /*
   *
   */
  getStellenangebotById(id: number): Observable<Stellenangebot>{
    return this.httpClient.get<Stellenangebot>(`${this.baseURL}/stellenangebot/${id}`);
  }

  /*
   *
   */
  public insStellenangebot(sa:Stellenangebot): Observable<Stellenangebot>{

     // Neuanlage ==> Insert

    const urlPdf  = `${this.baseURL}/stellenangebot`;
    const body    = JSON.stringify(sa);
    const headers = {'content-type': 'application/json'};

    return this.httpClient.post<Stellenangebot>(urlPdf, body, {'headers':headers});

  }

  public updStellenangebot(sa:Stellenangebot): Observable<Stellenangebot>{

    // Änderungen ==> Update

    const urlPdf = `${this.baseURL}/stellenangebot/${sa.id}`;
    const body = JSON.stringify(sa);
    const headers = {'content-type': 'application/json'};

    return this.httpClient.put<Stellenangebot>(urlPdf, body, {'headers':headers});
  }

  /*************************************
   * Handling der zugeordneten pdf-Datei
   *************************************/

  // wird wie folgt aus anzeigen.component.ts augerufen:
  // this.serviceStellenangebote.uploadPdfStellenangebot(this.selFilePdfStellenangebot).subscribe(data => {

  public postPdfStellenangebot(id: number, pdfFile: File)  {

    const uploadData = new FormData();
    uploadData.append('pdfFile', pdfFile, pdfFile.name);

    // @PostMapping(path = "/uploadpdfsa/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    return this.httpClient.post(`${this.baseURL}/uploadpdfsa/${id}`, uploadData);
  }


  public getPdfStellenangebotById( id: number) {

    // Holen der pdf-Datei, deren Name in this.selFilePdfStellenangebot steht
    // z.B.: "http://localhost:8080/ibm/byfilename/anzeige1.pdf";
    const fileUrl = `${this.baseURL}/dnldpdfbyid/` + id;

    // Es wird innerhalb der open-Methode ein REST-Aufruf mit der übergebenen Url gestartet
    // Dieser muss einen Bytestream zurückliefern, damit dieser von der open()-Methode
    // ausgewertet werden kann und das Pdf dannn downgeloaded wird
    window.open(fileUrl);

  }

  public getPdfStellenangebotByName( filename: String) {

    // Holen der pdf-Datei, deren Name in this.selFilePdfStellenangebot steht
    const urlPdf = `${this.baseURL}/downloadpdf/` + filename;
    /*
    this.httpClient.get(urlPdf).subscribe( (res) => {

        // Man bekommt folgenden Json vom Typ "ResponseFile": name, type, url
        const responseFile: any = res;

        // z.B.: "http://localhost:8080/ibm/byfilename/anzeige1.pdf";
        const fileUrl =`${this.baseURL}/downloadpdf2/` + responseFile.name;

        // z.B.: "http://localhost:8080/ibm/uploadpdf/1";
        // geht nicht, da man die Id gar nicht zurückbekommt
        // const fileUrl =`${this.baseURL}/byfileid/` + responseFile.id;

        // Wenn man in der HTML den pdf-Viewer ausblendet, so kommt die PDF als Download,
        // was man evtl auch so haben möchte
        window.open(fileUrl);
    });
    */

    // z.B.: "http://localhost:8080/ibm/byfilename/anzeige1.pdf";
    const fileUrl =`${this.baseURL}/downloadpdf2/` + filename;
    window.open(fileUrl);

  }


  postPdfStellenangebotOk( pdfFile: File) {

    const uploadData = new FormData();
    uploadData.append('pdfFile', pdfFile, pdfFile.name);

    return this.httpClient.post(`${this.baseURL}/uploadpdf`, uploadData);
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

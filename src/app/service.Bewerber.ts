import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanal, Status, Stellenangebot } from './model.Stellenangebot';
import { Anlage, Bewerber, Kommunikation, SD_Anlage, SD_Kommunikation } from './model.Bewerber';

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

  /*
    * Holen von Stammmdaten - Tabelle SD_Anlage
    */
  getListeSdAnlage(): Observable<SD_Anlage[]>{
    return <Observable<SD_Anlage[]>>this.httpClient.get<SD_Anlage[]>(`${this.baseURL}/sd_anlage`);
  }

  /***************************************
   * Handling einer zugeordneten pdf-Datei
   ***************************************/

  // wird wie folgt aus bewerber.component.ts augerufen:
  // this.serviceBewerber.postPdfStellenangebot(this.selBewerberObject.id, this.sdAnlageName!).subscribe(data => {

  public postPdfAnlage(id: number, anlage: Anlage, pdfFile: File)  {

    const formData = new FormData();
    formData.append("id_sd_anlage", anlage.sd_anlage.id.toString());
    formData.append("anmerkung", anlage.anmerkung);
    formData.append('pdfFile', pdfFile, pdfFile.name);

    // @PostMapping(path = "/upldpdfanlage/{id_bewerber}", produces = MediaType.APPLICATION_JSON_VALUE)
    return this.httpClient.post(`${this.baseURL}/upldpdfanlage/${id}`, formData);
  }

  //  this.serviceBewerber.getPdfAnlageByQuery(this.anlage);

  public getPdfAnlageByQuery(bewerber_id: number, id : number) {

    /*
    * In der open-Methode ist ein REST-Aufruf versteckt, der die übergebene Url nutzt
    *
    *  Der zugehörige Restendpoint muß einen Stream zurückliefern, aufgrund dessen
    *  im Browser der Dwonload der pdf-Daten und die entsprechend Konvertierung in
    *  eine pdf-Datei erfolgt
    *
    * über id, bewerber_id kann in der Entität "anlage" die selektierte Anlage angesprochen werden
    */

    const filestreamUrl = `${this.baseURL}/file/${id}/${bewerber_id}`;
    window.open(filestreamUrl);
  }



  public getPdfAnlageById(id: number) {

    // Holen der pdf-Datei, deren Name in this.selFilePdfStellenangebot steht
    // z.B.: "http://localhost:8080/ibm/byfilename/anzeige1.pdf";
    const filestreamUrl = `${this.baseURL}/file/${id}`;

    /*
     * In der open-Methode ist ein REST-Aufruf versteckt, der die übergebene Url nutzt
     *
     *  Der zugehörige Restendpoint muß einen Stream zurückliefern, aufgrund dessen
     *  im Browser der Dwonload der pdf-Daten und die entsprechend Konvertierung in
     *  eine pdf-Datei erfolgt
     */
    window.open(filestreamUrl);

  }

  public getPdfAnlageByName( filename: String) {

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

  // Hochalden und Aabspeichern einer pdf-Datei in der Tabelle #Anlage"
  public postPdfAnlageOk( pdfFile: File) {

    const uploadData = new FormData();
    uploadData.append('pdfFile', pdfFile, pdfFile.name);

    return this.httpClient.post(`${this.baseURL}/uploadpdf`, uploadData);
  }

}

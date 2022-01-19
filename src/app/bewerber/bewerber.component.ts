import { Component, OnInit, ViewChild } from '@angular/core';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { ServiceBewerber } from '../service.Bewerber';
import { Bewerber, Anlagen, Kommunikation, SD_Kommunikation } from '.././model.Bewerber';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MyAlertDialogComponent } from '../my-alert-dialog/my-alert-dialog.component'

// Konstanten zur Unterstützung der richtigen AKtivierung der Listboxen
const INIT: number = 1;
const INSERTED: number = 2;
const UPDATED: number = 3;
const CLICKED: number = 4;

// Konstanten bzgl. des Status der Form
const INSERT: number = 1;
const UPDATE: number = 2;
const READ:   number = 3;


@Component({
  selector: 'app-bewerber',
  templateUrl: './bewerber.component.html',
  styleUrls: ['./bewerber.component.scss']
})
export class BewerberComponent implements OnInit {

  @ViewChild('mySelect') mySelect: any;

  @ViewChild('fileInput')  fileInput: any;
  selFilePdfAnlage: File | null = null;

  public kommunikation_array: Kommunikation[] = [];
  public sd_kommunikation_array: SD_Kommunikation[] = [];
  public aktion!: SD_Kommunikation;

  public selIdKommunikation : number = -1;
  public aktionstext : string = "";
  public aktionsdatumS : string = "";
  public dateAktionDefault!:  any;
  public textHistorie : string = "";

  // in der Dropdown-LB selektiertes Stellenangebot
  public selStangObject!: Stellenangebot;
  public tmpSa!: Stellenangebot;
  public sa_array: Stellenangebot[] = [];

  // in der Dropdown-LB selektierter Bewerber
  public selBewerberObject!: Bewerber;
  public bew_array: Bewerber[] = [];

  public anlage_array: Anlagen[] = [];
  public anlage!: Anlagen;
  public selIdAnlage : number = -1;
  public nameAnlage : string = "";
  public anlagetext : string = "";

  public readonly: boolean = true;
  public readonlyCancel: boolean = true;

  public bewerberFormGroup!: FormGroup;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  // 1 = INSERT
  // 2 = UPDATE
  // 3 = READ
  formmode!: number;


  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private serviceBewerber: ServiceBewerber,
              private dialog: MatDialog) { }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {

    // Only highligh dates inside the month view.
    const day = cellDate.getDay();

    // Highlight the 1st and 20th day of each month.
    return (day === 0 || day === 6) ? 'highlight-dates' : '' ;
   }



  public ngOnInit(): void {

    // Der Dialog wird sofort ohne Werte erstmal aufgebaut
    this.addFormGroup();

    // Beim ersten Aufruf müssen einmalig
    // - die Stammdaten
    // - alle Stellenangebote und
    // - zum ersten Stellenangebot die zugehörigen Bewerber über REST geholt
    //   und entsprechend die beiden Listboxen aufgebaut werden
    this.initStellenangeboteBewerber();

    // Zum Testen, ob das anlage_array richtig in der Listbox dargestellt wird
    let oneAnlage : Anlagen = {
      id: 1,
      name: '',
      type: 'Lebenslauf'
    };
    this.anlage_array.push(oneAnlage);

    let oneAnlage1 : Anlagen = {
      id: 1,
      name: '',
      type: 'Anschreiben'
    };
    this.anlage_array.push(oneAnlage1);

    let oneAnlage2 : Anlagen = {
      id: 1,
      name: '',
      type: 'Arbeitszeugnis'
    };
    this.anlage_array.push(oneAnlage2);


  }

  private addFormGroup() {
    this.bewerberFormGroup = new FormGroup({
      nachname : new FormControl('', [Validators.required]),
      vorname : new FormControl('', [Validators.required]),
      anrede : new FormControl('', ),
      titel : new FormControl('', ),
      plz : new FormControl('', [Validators.required]),
      ort : new FormControl('', [Validators.required]),
      strasse : new FormControl('', [Validators.required]),
      hausnummer : new FormControl('', [Validators.required]),
      email : new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(40)]),
      notizen : new FormControl('', ),
      skills : new FormControl('', ),
    });

  }

  public checkError = (controlName: string, errorName: string) => {
    return this.bewerberFormGroup.controls[controlName].hasError(errorName);
  }

  // Holen der Stellenangbote und der Bewerber
  private initStellenangeboteBewerber(){

    // Holen aller Status aus der Tabelle "sd_kommunikation"
    this.serviceBewerber.getListeSdKommunikation().subscribe(data => {

      this.sd_kommunikation_array = [];
      data.forEach((d) => {
        this.sd_kommunikation_array.push(d);
      });

      this.serviceStellenangebote.getListeStellenangebote().subscribe(data => {

        // Das Json, das über Netzwerk verschickt wurde, ist hier
        // bereits in  ein TypeScript-Objekt konvertiert
        // Durch die Zuweisung von "this.tmpSa= d" bekommt man Typsicherheit.
        // Wenn man weiss, welches Format über Json rein kommt, kann man die
        // entsprechenden model-Dateien zusammenbasteln.
        this.sa_array = [];
        data.forEach((d) => {
          this.sa_array.push(d);
        });

        if (this.sa_array.length > 0) {
          this.selStangObject = this.sa_array[0];

          // Rest-Aufruf zum Holen aller erfassten Bewerber zum gewählten Stellenangebot bzw. die Id desselbigen
          /// evtl. die Id des initialen Bewerbers einstellen
          this.getListBewerber(this.selStangObject.id, INIT);

        }
      });
    });
  }

  private getSdKommunikation() {

    // Holen aller Status aus der Tabelle "sd_status"
    this.sd_kommunikation_array = [];
    this.serviceBewerber.getListeSdKommunikation().subscribe(data => {
      data.forEach((d) => {
        this.sd_kommunikation_array.push(d);
      });
    });
  }

  public get nachname() {  return this.bewerberFormGroup.get('nachname') };
  public get vorname()  {  return this.bewerberFormGroup.get('vorname') };
  public get anrede()   {  return this.bewerberFormGroup.get('anrede') };
  public get titel()    {  return this.bewerberFormGroup.get('titel') };
  public get plz()      {  return this.bewerberFormGroup.get('plz') };
  public get ort()      {  return this.bewerberFormGroup.get('ort') };
  public get strasse()  {  return this.bewerberFormGroup.get('strasse') };
  public get hausnummer() {return this.bewerberFormGroup.get('hausnummer') };
  public get email()    {  return this.bewerberFormGroup.get('email') };
  public get notizen()  {  return this.bewerberFormGroup.get('notizen') };
  public get skills()   {  return this.bewerberFormGroup.get('skills') };

  public bewerberShowDetails(bewerber: Bewerber) {

    if (bewerber.id == 0) {

      // alle Eingabefelder leer machen, um eine neuen Datensatz in die geleerten Felder eingeben zukönnen
      this.bewerberFormGroup.reset();

    } else {

      this.fillBewerbeControls(bewerber);

      // Setzen des aktuellen Bewerberobjekts
      this.selBewerberObject = bewerber;
    }
  }

  public fillBewerbeControls(bew : Bewerber) {
    // Anzeige des selektierten und in der Tabelle "bewerber" gefundenen Datensatzes
    this.nachname!.setValue(bew.nachname);
    this.vorname!.setValue(bew.vorname);
    this.anrede!.setValue(bew.anrede);
    this.titel!.setValue(bew.titel);
    this.plz!.setValue(bew.plz);
    this.ort!.setValue(bew.ort);
    this.strasse!.setValue(bew.strasse);
    this.hausnummer!.setValue(bew.hausnummer);
    this.email!.setValue(bew.email);
    this.notizen!.setValue(bew.notizen);
    this.skills!.setValue(bew.skills);

    // Diese Daten wurden wie folgt gefetched:  this.serviceBewerber.getListeKommunikation(this.selBewerberObject.id)
    // Schmarrn: es wird in der UI-Liste direkt der Inhalt von  this.kommunikation_array angezigt
    // this.bewerberFormGroup.value.kommunikation = this.kommunikation_array;

    // Dia Anlagen stehen ohne eingerichtete Relation in der Entität "ibm.anlagen"
    // Diese werden gesondert behandelt, da teilweise große Datenmengen bei mehren Pdf's zu transferieren wären
    // let tmpArrayAnlagen:Anlagen[] = [];
    // this.bewerberFormGroup.value.anlagen = tmpArrayAnlagen;
  }


  public saveFormGroupBewerber() {

    let localBew: Bewerber  = {
      id: 0, idstellenangebot: 0, nachname: '', vorname: '', anrede: '', titel: '',
      plz: 0, ort: '', strasse: '', hausnummer: 0, email: '', notizen: '', kommunikationen: [],
      anlagen: [], skills: ''};

    // Holen der im Formular erfassten Daten inklusive der Kommunikationshistorie
    this.getFormContralValues(localBew);


    if (this.formmode == INSERT) {
      // Neuen Bewerber inserten

      localBew.id = -1;

      // jetzt mit einem Post in der Entität "ibm.bewerber" inserten
      this.insertBewerber(localBew);

    } else {
      // Updaten der geänderten Bewerberdaten
      localBew.id = this.selBewerberObject.id;

      // jetzt mit einem Put in der Entität "ibm.bewerber" updaten
      this.updateBewerber(localBew);

    }

  }

  private insertBewerber(bewerber: Bewerber) {

    // Updaten einer Entität "stellenangebot"
    this.serviceBewerber.insBewerber(bewerber).subscribe(insertedBewerber => {

      // Merken des eignefügten Datensatzes, damit in der Listbox mit allen Bewerbern entsprechend positioniert werden kann
      this.selBewerberObject = insertedBewerber;

      // Holen aller Bewerber zum selektierten Stellenangebot über REST aus der Entität "bewerber" nach this.bew_array[]
      this.getListBewerber(this.selStangObject.id, INSERTED);

    });
  }

  private updateBewerber(bewerber: Bewerber) {

    // Updaten einer Entität "stellenangebot"
    this.serviceBewerber.updBewerber(bewerber).subscribe(updatedBewerber => {

      // Merken des eignefügten Datensatzes, damit in der Listbox mit allen Bewerbern entsprechend positioniert werden kann
      this.selBewerberObject = updatedBewerber;

      // Holen aller Bewerber zum selektierten Stellenangebot über REST aus der Entität "bewerber" nach this.bew_array[]
      this.getListBewerber(this.selStangObject.id, UPDATED);

    });
  }



  /*
   * Holen aller erfassten Bewerber zum gewählten Stellenangebot aus der Tabelle "bewerber" by "idstellenangebot"
   *
   * Anhand welcher ID gefetched wird, häng auch vom Modus ab, der gerade gültig ist:
   * INIT steht für den ersten Bewerber in der Liste (beim erstmaligen Initialisieren des Dialogs)
   * INSERTED steht für den ersten Bewerber in der Liste
   * UPDATET  steht für den ersten Bewerber in der Liste
   * CLICKED, ween der Benutzer einen Bewerber in der UI angeclicked hat
   */
  public getListBewerber(idstellenangebot: number, mode: number ){

    this.serviceBewerber.getListeBewerber(idstellenangebot).subscribe(data => {

      this.bew_array = [];
      data.forEach((d) => {
        this.bew_array.push(d);
      });

      // Falls mindestens ein Datensatz gefunden wird, Aufbau einer Listbox mit allen Bewerbern,
      if (this.bew_array.length > 0) {

        /*
        // Holen der bisherigen Kokmmunikation bzgl. des selektierten Bewerbers
        this.get_kommunikation(this.bew_array[0].id);

        // Holen der hinterlegten Anlagen bzgl. des selektierten Bewerbers
        this.get_anlagen(this.bew_array[0].id);
        */

        if (mode == INIT) {
          this.selBewerberObject = this.bew_array[0];
        }

        if (mode == INSERTED) {
          this.selBewerberObject = this.bew_array[this.bew_array.length -1];
        }

        let foundBewerber!: Bewerber;
        if (mode == UPDATED) {
          // der zu markierende LB-Eintrag muss ermittelt werden
          this.bew_array.forEach( (bew) => {
            if (bew.id == this.selBewerberObject.id) {
              this.selBewerberObject = bew;
            }
          })
        }

        this.initBereichKommunikation();

        this.formmode = READ; // Die Formulardaten können nicht verändert werden
        this.readonly = true; // alle Formcontrols werden disabled
        this.readonlyCancel = true;

        this.bewerberShowDetails(this.selBewerberObject);

      }  else {

        this.formmode = INSERT;
        this.readonly = false; // Falls noch kein Bewerber vorhanden ist, so kann man sofort mit den Eingaben loslegen

        // Falls noch kein Bewerber vorhanden ist, so darf man nur den "Speichern Button" aktiviert sein
        this.readonlyCancel = true;

        // leeres Formual anbieten, um den ersten eingegeangene Bewerber anlegen zu können
        this.bewerberFormGroup.reset();

        this.initBereichKommunikation();
        this.kommunikation_array = []; // nochmals leeren

      }
    });

    this.initBereichKommunikation();

    // Falls noch kein Bewerber erfasst wurde, Freischalten des Buttons, um einen neuen Bewerber anzulegen
    return null;
  }

  // Dten aus den FormControls übernehmen
  public getFormContralValues(localBew: Bewerber) {

    localBew.idstellenangebot = this.selStangObject.id;
    localBew.nachname = this.bewerberFormGroup.value.nachname;
    localBew.vorname  = this.bewerberFormGroup.value.vorname;
    localBew.anrede   = this.bewerberFormGroup.value.anrede;
    localBew.titel    = this.bewerberFormGroup.value.titel;
    localBew.plz      = this.bewerberFormGroup.value.plz;
    localBew.ort      = this.bewerberFormGroup.value.ort;
    localBew.strasse  = this.bewerberFormGroup.value.strasse;
    localBew.hausnummer  = this.bewerberFormGroup.value.hausnummer;
    localBew.email    = this.bewerberFormGroup.value.email;
    localBew.notizen  = this.bewerberFormGroup.value.notizen;
    localBew.skills   = this.bewerberFormGroup.value.skills;

    localBew.kommunikationen = this.kommunikation_array;

    let tmpArrayAnlagen:Anlagen[] = [];
    localBew.anlagen = tmpArrayAnlagen;
  }

  public initBereichKommunikation() {

    // Bereich mit den möglichen Kommunikationstypen
    this.dateAktionDefault = "";
    this.aktionstext = "";

    // Bereich mit der tatsächlichen KOmmunikationshistorie
    this.textHistorie ="";

    this.kommunikation_array = [];
    this.selBewerberObject.kommunikationen.forEach((k) => {
      // Übertragen des Arrays mit den Kommunikationseinträgen
      this.kommunikation_array.push(k);
    });

  }


  /* ========================= Methoden, die aus der UI getriggered werden =================== */

  ///////////////////////////////////////////////////
  // Listbox mit allen Stellenangeboten
  ///////////////////////////////////////////////////

  // Click-Event aus der UI
  public buildListBewerber(selStangObject: Stellenangebot) {

    console.log(this.selStangObject);

    this.getListBewerber(selStangObject.id, INIT);
  }

  ///////////////////////////////////////////////////
  // Listbox mit den Bewerbern eines Stellenangebots
  ///////////////////////////////////////////////////
  public startNewBewerber() {
    this.formmode = INSERT;
    this.readonly =false;  // Die FormControls können editiert werden
    this.readonlyCancel = false;

    // Rücksetzen aller form-Werte
    this.bewerberFormGroup.reset();

    this.initBereichKommunikation();
    this.kommunikation_array = []; // Bei Neuanlage nochmals zurücksetzen


  }

  public startUpdateBewerber() {
    this.formmode = UPDATE;
    this.readonly = false;  // Die FormControls können editiert werden
    this.readonlyCancel = false;
  }

  public cancelBewerber() {

    this.bewerberShowDetails(this.selBewerberObject);

    this.initBereichKommunikation();


    this.formmode = READ;
    this.readonly = true;  // Die FormControls können editiert werden
    this.readonlyCancel = true;


  }

  public submit() {
    console.log("submit");
    if (!this.bewerberFormGroup.valid) {
      return;
    } else {
      this.saveFormGroupBewerber();
    }
    // console.log(this.bewerberFormGroup.value);
    // console.log(this.bewerberFormGroup.value.email);
  }

  public showSelectedBewerber (selectedBewerber: Bewerber) {

    // Füllen der Formcontrols mit dem selektierten Bewerber
    this.fillBewerbeControls(selectedBewerber);

    this.selBewerberObject = selectedBewerber;

    this.initBereichKommunikation();

  }

  public selAktion(event:any) {
    // console.log(event);
    this.aktion = event;
  }

  public aktionsdatumEvent(event: any){
    var datum = new Date(event.value);
    var dd = String(datum.getDate()).padStart(2, '0');
    var mm = String(datum.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = datum.getFullYear();

    this.aktionsdatumS = dd + '.' + mm + '.' + yyyy;
  }

  // aus der Historie
  public showAktion(komm: Kommunikation) {
    this.textHistorie = komm.anmerkungen;
    this.selIdKommunikation = komm.id;

    // console.log(komm);
  }

  // aus der LB mit allen Kommunikationselementen (SD_Kommunikation)
  public showAktionAnmerkung() {
    // console.log(this.aktion.bezeichnung);
  }

  /*
   * Löschen einer Aktion aus den bereits besteheneden Aktionen
   */
  public removeAktion() {

    this.kommunikation_array.forEach( (komm, index) => {
      if (komm.id === this.selIdKommunikation) {
        this.kommunikation_array.splice(index,1);
        this.textHistorie ="";
      }
    });

    // Aufklappen der Listbox, damit man die Änderung gleich sieht
    this.mySelect.open();

  }

  public addAktion() {

    let localBewerber: Bewerber = {
      id: 0, idstellenangebot: 0, nachname: '', vorname: '',
      anrede: '', titel: '', plz: 0, ort: '', strasse: '',
      hausnummer: 0, email: '', notizen: '', kommunikationen: [],
      anlagen: [], skills: ''
    };

    let localSD_Kommunikation: SD_Kommunikation = { id: 0, bezeichnung: ''};

    let localAktion: Kommunikation = {
      id: 0,
      zeitpunkt: '',
      anmerkungen: '',
      sd_kommunikation: localSD_Kommunikation
    };

    localAktion.id = -1;
    localAktion.anmerkungen = this.aktionstext;
    localAktion.zeitpunkt = this.aktionsdatumS;
    // localAktion.bewerber = this.selBewerberObject;
    localAktion.sd_kommunikation = this.aktion;

    // das Array mit den zugewiesenen Aktionen um die neue Aktionshistorie erweitern
    this.kommunikation_array.push (localAktion);

    // Aufklappen der Listbox, damit man die Änderung gleich sieht
    this.mySelect.open();

  }

  /*   ===================== Verwaltung der Anlagen ============================= */

  // aus der Historie
  public showAnlage(anlage: Anlagen) {
    this.nameAnlage = "anlage.name";
    this.selIdAnlage = anlage.id;

    // console.log(anlage);
  }

  // aus der LB mit allen Kommunikationselementen (SD_Kommunikation)
  public showAnlageAnmerkung() {
    // console.log(this.anlage.name);
  }

  public selAnlage(event:any) {
    // console.log(event);
    this.anlage = event;
  }


  public fetchPdf() {

    // Die Daten sind in der Property this.sa.pdf_stellenangebot_id
    // Die downzuloadende und anzuzeigende PDF-Datei steht in "anlage.name"
    if (this.anlage.name !== null) {

      // Holen der pdf-Datei, deren Name oder Id !!! in this.selFilePdfStellenangebot steht
      /*
      this.serviceStellenangebote.getPdfStellenangebot(this.selFilePdfStellenangebot).subscribe(data => {
        console.log(data);
      });
      */
      this.serviceStellenangebote.getPdfStellenangebotById(this.anlage.id);
      // this.serviceStellenangebote.getPdfStellenangebotByName(this.anlage.name!);

    } else {
      // Hinweis ausgeben, dass kein Datei selektiert wurde
      this.showHinweisMissingPdfDatei();
    }
  }

  public showHinweisMissingPdfDatei() {
    let dialogRef = this.dialog.open(MyAlertDialogComponent);
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result == 'ok') {
        console.log(result);
      }
    })
  }
  public onFileChangeInput(event: any) {
    this.selFilePdfAnlage = event.target.files[0];
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Tricky FILE-Auswahldialog, da der schönere Material-Button den hässlichen Original FIE-Button nur überlagert
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

// Benutzer hat eine pdf-Datei ausgewählt, die dem aktuellen Stellenangebot zuzuordnen ist
public updateAnlagePdf() {

  if (this.selFilePdfAnlage !== undefined) {

    /*
    // Updaten der Property Stellenangebot.pdf_stellenangebot und updaten der pdf-Datei in die Entität "ibm.pdf_stellenangebot"
    this.serviceStellenangebote.postPdfStellenangebot(this.id, this.selFilePdfAnlage!).subscribe(data => {

     // In data müsste jetzt vom Typ <Stellenangebot> sein
     // console.log(data);

     this.tmpSa = <Stellenangebot> data;
      this.selFilePdfAnlage = null; //dadurch wird auch wieder der Hochladen -Button ausgeblendet

      // Jetzt muss man die Property this.pdf_attached noch richtig setzen
      this.nameAnlage = this.tmpSa.pdf_stellenangebot;

    });
    */

  } else {
    // Hinweis ausgeben, dass noch keine PDF-Datei zugeordnet ist
    this.showHinweisMissingPdfDatei();
  }
}


}

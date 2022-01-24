import { Component, OnInit, ViewChild } from '@angular/core';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { ServiceBewerber } from '../service.Bewerber';
import { Bewerber, Anlage, Kommunikation, SD_Kommunikation, SD_Anlage } from '.././model.Bewerber';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MyAlertDialogComponent } from '../my-alert-dialog/my-alert-dialog.component'

// Konstanten zur Unterstützung der richtigen Aktivierung von Buttons und Listboxen
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

  @ViewChild('mySelectBewerber') mySelectBewerber: any;

  @ViewChild('mySelectKommunikation') mySelectKommunikation: any;
  @ViewChild('mySelectSdKommunikation') mySelectSdKommunikation: any;

  @ViewChild('mySelectAnlage') mySelectAnlage: any;
  @ViewChild('mySelectSdAnlage') mySelectSdAnlage: any;

  @ViewChild('mySelectKategorie') mySelectKategorie: any;


  @ViewChild('fileInput')  fileInput: any;
  selFilePdfAnlage!: File;
  selPdfName: string = '';

  // in der Dropdown-LB selektiertes Stellenangebot
  public selStangObject!: Stellenangebot;
  public tmpSa!: Stellenangebot;
  public sa_array: Stellenangebot[] = [];

  // in der Dropdown-LB selektierter Bewerber
  public selBewerberObject!: Bewerber;
  public bew_array: Bewerber[] = [];

  // ======================================================================================

  // Bereich mit den aktuell erfassten Kommunikationstypen (Einladung, Interview, Rückfrage)
  public kommunikation_array: Kommunikation[] = [];
  public kommunikationSelected! : Kommunikation;
  public kommunikationSelectedZeitpunkt : string = '';
  public kommunikationSelectedAnmerkung : string = '';

  // Bereich  mit allen verfügbaren Kommunikationstypen
  public sd_kommunikation_array: SD_Kommunikation[] = [];
  public kommunikationDate : string = '';
  public kommunikationAnmerkung : string = "";

  public aktion!: SD_Kommunikation;
  public aktionsdatumS : string = "";

  // ==================================================

  // linker Bereich mit den aktuell zugeordneten Anlagen
  public anlage_array: Anlage[] = [];
  public anlageSelected! : Anlage;
  public anlageSelectedName : string = '';
  public anlageSelectedAnmerkung : string = '';

  // rechter Bereich mit allen verfügbaren Anlagekategorien
  public sd_anlage_array: SD_Anlage[] = [];
  public sd_anlage!: SD_Anlage;
  public sdAnlageName : string = '';
  public sdAnlageAnmerkung : string = '';

  public readonly: boolean = true;
  public readonlyCancel: boolean = true;

  public angeboteVorhanden: boolean = false;

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
    this.initDialogBewerber();

  }

  // Holen der Stellenangbote und der Bewerber
  private initDialogBewerber(){

    // Holen aller Status aus der Tabelle "sd_kommunikation"
    this.serviceBewerber.getListeSdKommunikation().subscribe(data => {

      this.sd_kommunikation_array = [];
      data.forEach((d) => {
        this.sd_kommunikation_array.push(d);
      });

      // Holen aller Status aus der Tabelle "sd_kommunikation"
      this.serviceBewerber.getListeSdAnlage().subscribe(data => {

        this.sd_anlage_array = [];
        data.forEach((d) => {
          this.sd_anlage_array.push(d);
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

            this.angeboteVorhanden = true;

            // Rest-Aufruf zum Holen aller erfassten Bewerber zum gewählten Stellenangebot bzw. die Id desselbigen
            /// evtl. die Id des initialen Bewerbers einstellen
            this.getListBewerber(this.selStangObject.id, INIT);
          }
          else {
            // Wenn boch kein Stellenagebot registriert ist dann kommt man hierher
            this.formmode = READ; // Die Formulardaten können nicht verändert werden
            this.readonly = true; // alle Formcontrols werden disabled
            this.readonlyCancel = true;
            this.angeboteVorhanden = false; // Man kann nix mit den Bewerbern machen, da nochkein Stellenangebot vorhanden ist

            this.showHinweisMissingPdfDatei("Es muss mindestens ein Stellenangebot angelegt sein");
          }
        });

      });

    });
  }


  public initBereichKommunikation() {

    // linker Bereich mit der tatsächlichen KOmmunikationshistorie
    if (this.kommunikationSelected) {
      this.kommunikationSelectedZeitpunkt = "";
      this.kommunikationSelectedAnmerkung = "";
    } else {
      let tmpSdKommunikation : SD_Kommunikation = {id: 0, bezeichnung : ''};
      this.kommunikationSelected = {id: 0, anmerkung: '', zeitpunkt: '', sd_kommunikation: tmpSdKommunikation};
      this.kommunikationSelectedZeitpunkt = this.kommunikationSelected.zeitpunkt;
      this.kommunikationSelectedAnmerkung = this.kommunikationSelected.anmerkung;

    }

    // rechter Bereich mit den Stammdaten bzgl. der möglichen Kommunikationstypen
    this.kommunikationDate = "";
    this.kommunikationAnmerkung = "";

    if  (this.selBewerberObject?.kommunikationen) {
      this.kommunikation_array = [];
      this.selBewerberObject.kommunikationen.forEach((k) => {
        // Übertragen des Arrays mit den Kommunikationseinträgen
        this.kommunikation_array.push(k);
      });
    }

  }

  public initBereichAnlagen() {

    // Bereich mit den tatsächlich aktuell erfassten Anlagen
    if (this.anlageSelected) {
    } else {
      let tmpSdAnlage : SD_Anlage = {id: 0, bezeichnung : ''};
      this.anlageSelected = {id: 0, anmerkung: '', name: '', type: '', sd_anlage: tmpSdAnlage};
    }
    this.anlageSelectedName = this.anlageSelected.name;
    this.anlageSelectedAnmerkung = this.anlageSelected.anmerkung;


    this.anlage_array = [];
    if (this.selBewerberObject && this.selBewerberObject.anlagen) {
      this.selBewerberObject.anlagen.forEach((k) => {
        // Übertragen des Arrays mit den erfassten Anlagen
        this.anlage_array.push(k);
      });
    }
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

    // Dia Anlagen stehen ohne eingerichtete Relation in der Entität "ibm.anlage"
    // Diese werden gesondert behandelt, da teilweise große Datenmengen bei mehren Pdf's zu transferieren wären
    // let tmpArrayAnlage:Anlage[] = [];
    // this.bewerberFormGroup.value.anlagen = tmpArrayAnlage;
  }


  public saveFormGroupBewerber() {

    let localBew: Bewerber  = {
      id: 0, idstellenangebot: 0, nachname: '', vorname: '', anrede: '', titel: '',
      plz: 0, ort: '', strasse: '', hausnummer: 0, email: '', notizen: '', kommunikationen: [],
      anlagen:[], skills: ''};

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

        if (this.selBewerberObject.id == 0) {

          // alle Eingabefelder leer machen, um eine neuen Datensatz in die geleerten Felder eingeben zu können
          this.bewerberFormGroup.reset();

        } else {

          this.fillBewerbeControls(this.selBewerberObject);
        }

        this.initBereichKommunikation();
        this.initBereichAnlagen();


        this.formmode = READ; // Die Formulardaten können nicht verändert werden
        this.readonly = true; // alle Formcontrols werden disabled
        this.readonlyCancel = true;

      }  else {

        this.formmode = INSERT;
        this.readonly = false; // Falls noch kein Bewerber vorhanden ist, so kann man sofort mit den Eingaben loslegen

        // Falls noch kein Bewerber vorhanden ist, so darf man nur den "Speichern Button" aktiviert sein
        this.readonlyCancel = true;

        // leeres Formual anbieten, um den ersten eingegeangene Bewerber anlegen zu können
        this.bewerberFormGroup.reset();

        this.showHinweisMissingPdfDatei("Es kann der erste Bewerber auf das selektierte Stellenangebot angelegt werden");

      }
    });


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

    let tmpArrayAnlage : Anlage[] = [];
    localBew.anlagen = tmpArrayAnlage;
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

    this.initBereichAnlagen();
    this.anlage_array = []; // Bei Neuanlage nochmals zurücksetzen

    this.mySelectBewerber.value = [];

  }

  public startUpdateBewerber() {

    // LB auf "nichts slektiert" setzen
    this.mySelectKommunikation.value = [];
    this.kommunikationSelectedZeitpunkt = '';
    this.kommunikationSelectedAnmerkung = '';

    this.mySelectAnlage.value = [];
    this.anlageSelectedName = '';
    this.anlageSelectedAnmerkung = '';

    this.formmode = UPDATE;
    this.readonly = false;  // Die FormControls können editiert werden
    this.readonlyCancel = false;
  }

  public cancelBewerber() {

    this.initBereichKommunikation();
    this.initBereichAnlagen();

    this.getListBewerber(this.selStangObject.id, INIT);

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

  // Click-Event auf einen der Bewerber in der LB mit allen Bewerbern zum Stellenangebot
  public setSelectedBewerber (selectedBewerber: Bewerber) {

    // Füllen der Formcontrols mit dem selektierten Bewerber
    this.fillBewerbeControls(selectedBewerber);

    // Setzen als aktuelles Bewerberobjekts
    this.selBewerberObject = selectedBewerber;

    this.initBereichKommunikation();
    this.initBereichAnlagen();

  }

  // ========================================================
  // Anzeige der Daten einer individuell angelegten Historie
  // ========================================================

  public aktionsdatumEvent(event: any) {
    var datum = new Date(event.value);
    var dd = String(datum.getDate()).padStart(2, '0');
    var mm = String(datum.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = datum.getFullYear();

    this.aktionsdatumS = dd + '.' + mm + '.' + yyyy;
  }


  /*
   * Löschen einer Aktion aus den bereits besteheneden Aktionen
  xxx
   */
  public removeAktion() {

    this.kommunikation_array.forEach( (komm, index) => {
      if (komm.id === this.kommunikationSelected.id) {
        this.kommunikationSelectedZeitpunkt = "";
        this.kommunikationSelectedAnmerkung = "";
           this.kommunikation_array.splice(index,1);
      }
    });

    // Rückübertrag des Arrays mit den aktuelen Anlagen in das Gesamtobjekt "Bewerber"
    this.selBewerberObject.kommunikationen = this.kommunikation_array;

    // Aufklappen der Listbox, damit man die Änderung gleich sieht
    // this.mySelectKommunikation.open();

    /*
    // const objData = JSON.parse(data); funkioniert nicht, da data schon ein Objekt und kein Json ist
    const json = '{"result":true, "count":42}';
    const obj1 = JSON.parse(json);
    */

  }


  // ========================================================
  // aus der LB mit den Stammdaten an Kommunikationselementen
  // ========================================================

  public setAktionGenerell(event:any) {

    // console.log(event);
    this.aktion = event;

    // gleichlzeitig leeren auf der linken Seite
    this.mySelectKommunikation.value = [];
    this.kommunikationSelectedZeitpunkt = "";
    this.kommunikationSelectedAnmerkung = "";
  }


  public addAktion() {

    let localBewerber: Bewerber = {
      id: 0, idstellenangebot: 0, nachname: '', vorname: '',
      anrede: '', titel: '', plz: 0, ort: '', strasse: '',
      hausnummer: 0, email: '', notizen: '', kommunikationen:[],
      anlagen:[], skills: ''
    };
    let localSD_Kommunikation: SD_Kommunikation = { id: 0, bezeichnung: ''};
    let localAktion: Kommunikation = {id: 0, zeitpunkt: '', sd_kommunikation: localSD_Kommunikation, anmerkung: ''};

    localAktion.id = -1;
    localAktion.zeitpunkt = this.aktionsdatumS;
    localAktion.sd_kommunikation = this.aktion;
    localAktion.anmerkung= this.kommunikationAnmerkung;
    // localAktion.bewerber = this.selBewerberObject;

    // das Array mit den zugewiesenen Aktionen um die neue Aktionshistorie erweitern
    this.kommunikation_array.push (localAktion);

    // Dadurch sollte der zugehörige Eintrag in der LB makraiert werden
    this.kommunikationSelected = localAktion;
    this.kommunikationSelectedZeitpunkt = localAktion.zeitpunkt;
    this.kommunikationSelectedAnmerkung = localAktion.anmerkung;

    //Die LB zur Auswahl eines Kommunikationstypes wieder auf "noselection" zurücksetzen
    // und die ganze ganz rechte Seite zurüäcksetzen
    this.mySelectSdKommunikation.value = [];
    this.kommunikationDate = '';
    this.kommunikationAnmerkung = '';

    // Aufklappen der Listbox, damit man die Änderung gleich sieht
   // this.mySelectKommunikation.open();

  }

  public setKommunikation() {
    this.kommunikationSelectedZeitpunkt = this.kommunikationSelected.zeitpunkt;
    this.kommunikationSelectedAnmerkung = this.kommunikationSelected.anmerkung;
  }

  /*   ===================== Verwaltung der Anlagen ============================= */

  ///////////////////////////////////////////////////////////////////////////
  // Bereich mit den aktuell zugeordneten Anlagen (SD_Anlage)
  ///////////////////////////////////////////////////////////////////////////

  // aus der Liste der aktuelle zugeordneten Anlagen
  public setAnlage(anlage: Anlage) {
    // console.log(this.anlageSelected);
    this.anlageSelectedAnmerkung = this.anlageSelected.anmerkung;
    this.anlageSelectedName = this.anlageSelected.name;
  }

  /*
   * yyy Löschen einer Anlage aus den bereits zugeordneten Anlage
   */
  public removeAnlage() {

    // Löschen der zu selektierten Anlage aus dem Array
    this.anlage_array.forEach( (anlage, index) => {

      if (anlage.id === this.anlageSelected.id) {
        this.anlageSelectedName = "";
        this.anlageSelectedAnmerkung = "";

        this.anlage_array.splice(index,1);

        // Löschen der zu löschenden Anlage aus der Entität "ibm.anlage"
        this.serviceBewerber.deleteAnlageByQuery(this.anlageSelected.id, this.selBewerberObject.id).subscribe(data => {

          // Zurück kommt das folgende Json-Response-Objekt: {deletetd:true}
          console.log(data);

          // Rückübertrag des Arrays mit den aktuelen Anlagen in das Gesamtobjekt "Bewerber"
          this.selBewerberObject.anlagen = this.anlage_array;

          // Aufklappen der Listbox, damit man die Änderung gleich sieht ist überflüssig
          /// this.mySelectAnlage.open();

        });
      }
    });
  }


  ///////////////////////////////////////////////////////////////////////////
  // Bereich mit allen zur Verfügung stehenden Anlagekategorien (SD_Anlage)
  ///////////////////////////////////////////////////////////////////////////

  // gewählte Kategorie, der eine pdf-Datei zugeordnet werden soll
  public selSdAnlage(event:any) {
    // console.log(event);
    this.sd_anlage = event;
  }

  // aus der Liste mit allen zur Verfügung stehenden Anlagekategorien (SD_Anlage)
  public showSdAnlageName() {
    console.log(this.sdAnlageName);
  }

  // aus der Liste mit allen zur Verfügung stehenden Anlagekategorien (SD_Anlage)
  public showSdAnlageAnmerkung() {
    // console.log(this.anlage.name);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Tricky FILE-Auswahldialog, da der schönere Material-Button den hässlichen Original FIE-Button nur überlagert
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public showHinweisMissingPdfDatei(content: string) {
    let dialogRef = this.dialog.open(MyAlertDialogComponent);

    dialogRef.componentInstance.message = content;

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result == 'ok') {
        console.log(result);
      }
    })
  }

  public onFileChangeInput(event: any) {

    this.selFilePdfAnlage = event.target.files[0];

    this.sdAnlageName = this.selFilePdfAnlage.name;

    // Man kann noch eine Anmerkung dazu eingeben

    // Der Hochlade-Button wird automatisch aktiviert

    // Löschen der Daten von einer gerade evtl. selektierten Anlage auf der linken Seite
    this.mySelectAnlage.value = [];

    if (this.anlageSelected) {
      this.anlageSelectedName = "";
      this.anlageSelectedAnmerkung  = "";
    }

  }

  public onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  // Benutzer hat eine pdf-Datei ausgewählt, die dem aktuellen Stellenangebot zuzuordnen ist
  public saveAnlagePdf() {

    if (this.sd_anlage === undefined) {
        // Hinweis ausgeben, dass noch Kategorie wie z. B. "Lebenslauf" ausgewählt wurde
        this.showHinweisMissingPdfDatei("Bitte zunächst eine Anlagekategorie aus der Liste wählen");

    } else {

      if (this.selFilePdfAnlage === undefined) {
        // Hinweis ausgeben, dass noch keine PDF-Datei zugeordnet ist
        this.showHinweisMissingPdfDatei("Bitte eine pdf-Datei auswählen");

      } else {
        // hierher, falls eine upzuloadende pdf-Datgei ausgewählt wurde

        let local_SdAnlage: SD_Anlage = {id: 0, bezeichnung: ''};
        let local_Anlage: Anlage = {
          id: -1, sd_anlage: local_SdAnlage, anmerkung: '',
          name: '', type: '',
        };

        local_Anlage.id = -1;
        local_Anlage.name  = this.sdAnlageName;
        local_Anlage.anmerkung = this.sdAnlageAnmerkung;
        local_Anlage.sd_anlage = this.sd_anlage; // z. B.: Eintrag "Lebenslauf" in SD_Anlage
        local_Anlage.type  = "pdf";

        // "type" unbd "name" sind auch im Objekt "selFilePdfAnlage" (= gewählte Datei) enthalten

        // Anhängen der neuen Anlagen-Pdf-Datei in der Property "anlage" d Entität "ibm.anlage"
        this.serviceBewerber.postPdfAnlage(this.selBewerberObject.id, local_Anlage, this.selFilePdfAnlage).subscribe( data => {

          // console.log(data); // In data steht jetzt in Object vom Typ <Bewerber>

          let localBew: any = data;
          localBew.anlagen.forEach( (anlage:any) => {
            if (anlage.name === local_Anlage.name) {
              local_Anlage.id = anlage.id;
            }
          });
          this.anlage_array.push(local_Anlage);
          this.selBewerberObject.anlagen = this.anlage_array;

          // Markieren des zugehörien LB-Eintrags in den erfassten Anlagen und
          // Übertragen der eben ergänzen Anlage-Pdf-Daten auf die linkee Detailseite
          this.anlageSelected = local_Anlage;
          this.anlageSelectedName  = this.anlageSelected.name;
          this.anlageSelectedAnmerkung  = this.anlageSelected.anmerkung;

          // Leeren alle Werte auf der rechten Masterseite
          this.mySelectKategorie.value = [];
          this.sdAnlageName = "";
          this.sdAnlageAnmerkung  = "";

          // Aufklappen der Seite mit allen zugeordnenten Anlagen und den hinterlegten pdf-Dateien
          // this.mySelectAnlage.open();

        });
      }
    }
  }

  public fetchPdf() {

    // Die Daten sind in der Property this.sa.pdf_stellenangebot_id
    // Die downzuloadende und anzuzeigende PDF-Datei steht in "anlage.name"
    if (this.anlageSelected && this.anlageSelected.name) {

      /*
       * Download der selektierten pdf-Datei, deren Daten in der Tabelle ibm.anlage stehen
       * @Query konstruieren, die anhand von id (PK) und bewerber_id den zugehörigen Datensatz filtert
       *
       */
      //
      this.serviceBewerber.getPdfAnlageByQuery(this.anlageSelected.id, this.selBewerberObject.id);

    } else {
      // Hinweis ausgeben, dass kein Datei selektiert wurde
      this.showHinweisMissingPdfDatei("Bitte eine der erfassten Anlagen auswählen");
    }
  }

}

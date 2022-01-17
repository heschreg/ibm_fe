import { Component, OnInit } from '@angular/core';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { ServiceBewerber } from '../service.Bewerber';
import { Bewerber, Anlagen, Kommunikation, SD_Kommunikation } from '.././model.Bewerber';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';

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

  public sd_kommunikation_array: SD_Kommunikation[] = [];
  public aktion!: SD_Kommunikation;
  public kommunikation_array: Kommunikation[] = [];

  public aktion_hinweistext : string = "";
  public aktionstext : string = "";
  public aktionsdatumS : string = "";
  public dateAktionDefault!:  any;

  // in der Dropdown-LB selektiertes Stellenangebot
  selStangObject!: Stellenangebot;
  tmpSa!: Stellenangebot;
  sa_array: Stellenangebot[] = [];

  // in der Dropdown-LB selektierter Bewerber
  selBewerberObject!: Bewerber;
  bew_array: Bewerber[] = [];

  public readonly: boolean = true;
  public readonlyCancel: boolean = true;

  public bewerberFormGroup!: FormGroup;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  // 1 = INSERT
  // 2 = UPDATE
  // 3 = READ
  formmode!: number;


  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private serviceBewerber: ServiceBewerber) { }

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
    this.serviceBewerber.getListeKommunikation().subscribe(data => {

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

        this.selStangObject = this.sa_array[0];

        // Rest-Aufruf zum Holen aller erfassten Bewerber zum gewählten Stellenangebot bzw. die Id desselbigen
        /// evtl. die Id des initialen Bewerbers einstellen
        this.getListBewerber(this.selStangObject.id, INIT);
      });
    });
  }

  private getSdKommunikation() {

    // Holen aller Status aus der Tabelle "sd_status"
    this.sd_kommunikation_array = [];
    this.serviceBewerber.getListeKommunikation().subscribe(data => {
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

    let tmpArrayKommunikation:Kommunikation[] = [];
    this.bewerberFormGroup.value.kommunikation = tmpArrayKommunikation;

    // Dia Anlagen stehen ohne eingerichtete Relation in der Entität "ibm.anlagen"
    // Diese werden gesondert behandelt, da teilweise große Datenmengen bei mehren Pdf's zu transferieren wären
    let tmpArrayAnlagen:Anlagen[] = [];
    this.bewerberFormGroup.value.anlagen = tmpArrayAnlagen;
  }


  public saveFormGroupBewerber() {

    let localBew: Bewerber  = {
      id: 0, idstellenangebot: 0, nachname: '', vorname: '', anrede: '', titel: '',
      plz: 0, ort: '', strasse: '', hausnummer: 0, email: '', notizen: '', kommunikation: [],
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
   * Holen aller erfassten Bewerber zum gewählten Stellenangebot aus der Tablle "bewerber" by "idstellenangebot"
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

    localBew.kommunikation = this.kommunikation_array;

    let tmpArrayAnlagen:Anlagen[] = [];
    localBew.anlagen = tmpArrayAnlagen;
  }



  /* ========================= Methoden, die aus der UI getriggered werden =================== */

  ///////////////////////////////////////////////////
  // Listbox mit allen Stellenangeboten
  ///////////////////////////////////////////////////

  public stangChangeAction(selStangObject: Stellenangebot) {

    // darin steht ein Objekt vom Typ "Stellenangebot"
    console.log(selStangObject);

    // Aufbau der Listbox mit allen zugehörigen Bewerbern
    this.getListBewerber(selStangObject.id, INIT);

  }

  public buildListBewerber(id_stellenangebot: number) {

    this.getListBewerber(id_stellenangebot, INIT);
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
  }

  public startUpdateBewerber() {
    this.formmode = UPDATE;
    this.readonly = false;  // Die FormControls können editiert werden
    this.readonlyCancel = false;
  }

  public cancelBewerber() {
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

  public bewerberChangeAction(bewerber: Bewerber) {
    // momentan keine weitere Funktionalität hinterlegt
    console.log(bewerber);
  }

  public showSelectedBewerber (selectedBewerber: Bewerber) {

    // Füllen der Formcontrols mit dem selektierten Bewerber
    this.fillBewerbeControls(selectedBewerber);

    this.selBewerberObject = selectedBewerber;
  }

  public selAktion(event:any) {

    console.log(event);
    this.aktion = event;
    this.aktion_hinweistext = "gewählte Aktion: " + this.aktion.bezeichnung;
  }

  public aktionsdatumEvent(event: any){
    var datum = new Date(event.value);
    var dd = String(datum.getDate()).padStart(2, '0');
    var mm = String(datum.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = datum.getFullYear();

    this.aktionsdatumS = dd + '.' + mm + '.' + yyyy;
  }

  public showAktion() {
    console.log(this.aktion);
  }

  // Button um die Aktion  in das kommunikationsarray zu übernehmen
  // sd_kommunikation_array
  /*
  export interface Kommunikation {
  id: number;
  Zeitpunkt: Date;
  Anmerkungen: string;
  Bewerber: Bewerber;
  sd_Kommunikation: SD_Kommunikation;
  */


  public addAktion() {

    let localBewerber: Bewerber = {
      id: 0, idstellenangebot: 0, nachname: '', vorname: '',
      anrede: '', titel: '', plz: 0, ort: '', strasse: '',
      hausnummer: 0, email: '', notizen: '', kommunikation: [],
      anlagen: [], skills: ''
    };

    let localSD_Kommunikation: SD_Kommunikation = { id: 0, bezeichnung: ''};

    let localAktion: Kommunikation = {
      id: 0,
      Zeitpunkt: '',
      Anmerkungen: '',
      Bewerber: localBewerber,
      sd_Kommunikation: localSD_Kommunikation
    };

    localAktion.id = -1;
    localAktion.Anmerkungen = this.aktionstext;
    localAktion.Zeitpunkt = this.aktionsdatumS;
    localAktion.Bewerber = this.selBewerberObject;
    localAktion.sd_Kommunikation = this.aktion;

    // das Array um die neue Aktionshistorie erweitern
    this.kommunikation_array.push (localAktion);

  }

}

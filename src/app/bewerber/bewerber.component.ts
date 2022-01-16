import { Component, OnInit } from '@angular/core';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { ServiceBewerber } from '../service.Bewerber';
import { Bewerber, Anlagen, Kommunikation, SD_Kommunikation } from '.././model.Bewerber';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  list1 = [
    { text: 'item 1', selected: false },
    { text: 'item 2', selected: false },
    { text: 'item 3', selected: false },
    { text: 'item 4', selected: false },
    { text: 'item 5', selected: false }
  ];
  list2 = [];
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

    let localBew: Bewerber  = {id: 0, idstellenangebot: 0, nachname: '', vorname: '', anrede: '', titel: '',
      plz: 0, ort: '', strasse: '', hausnummer: 0, email: '', notizen: '', kommunikation: [],
      anlagen: [], skills: ''};

    if (this.formmode == INSERT) {

      localBew.id = -1;

      this.getFormContralValues(localBew);

      // jetzt mit einem Post in der Entität "ibm.bewerber" inserten
      this.insertBewerber(localBew);

    } else {
      // Updaten der geänderten Bewreberdaten

      localBew.id = this.selBewerberObject.id;

      this.getFormContralValues(localBew);

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

    let tmpArrayKommunikation:Kommunikation[] = [];
    localBew.kommunikation = tmpArrayKommunikation;

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

  public toggleSelection(item: any, list: any) {
    item.selected = !item.selected;
  }

  public moveSelected(direction: any) {
    /*
    if (direction === 'left') {
      this.list2.forEach(item => {
        if (item.selected) {
          this.list1.push(item);
        }
      });
      this.list2 = this.list2.filter(i => !i.selected);
    } else {
      this.list1.forEach(item => {
        if (item.selected) {
          this.list2.push(item);
        }
      });
      this.list1 = this.list1.filter(i => !i.selected);
    }
    */
  }

  public moveAll(direction: any) {
    /*
    if (direction === 'left') {
      this.list1 = [...this.list1, ...this.list2];
      this.list2 = [];
    } else {
      this.list2 = [...this.list2, ...this.list1];
      this.list1 = [];
    }
    */
  }

  public selAktion(event:any) {
    console.log(event);
  }

}

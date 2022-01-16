import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { ServiceBewerber } from '../service.Bewerber';
import { Bewerber, Anlagen, Kommunikation } from '.././model.Bewerber';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

const FIRST: number = 1;
const INSERTED: number = 2;
const UPDATED: number = 3;
const CLICKED: number = 4;

@Component({
  selector: 'app-bewerber',
  templateUrl: './bewerber.component.html',
  styleUrls: ['./bewerber.component.scss']
})
export class BewerberComponent implements OnInit {


  // in der Dropdown-LB selektiertes Stellenangebot
  selStangObject!: Stellenangebot;
  tmpSa!: Stellenangebot;
  sa_array: Stellenangebot[] = [];

  // in der Dropdown-LB selektierter Bewerber
  selBewerberObject!: Bewerber;
  tmpBew!: Bewerber;
  bew_array: Bewerber[] = [];

  aktBewNachname: string = "";

  // in der Dropdown-LB selektierter Bewerber
  selBewerber!: Bewerber;

  public readonly: boolean = true;

  public bewerberFormGroup!: FormGroup;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  // 1 = INSERT
  // 2 = UPDATE
  mode!: number;


  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private serviceBewerber: ServiceBewerber,
              private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit(): void {

    // Der Dialog wird sofort ohne Werte erstmal dargestellt
    this.addFormGroup();

    // Beim ersten Aufruf müssen einmalig alle Stellenangebote und zum ersten Stellenangebot die
    // zugehörigen Bewerber über REST gewholt werden und ie beiden Listboxen aufgebaut werden
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

    this.serviceStellenangebote.getListeStellenangebote().subscribe(data => {

      // Das Json, das über Netzwerk verschickt wurde, ist hier
      // bereits in  ein TypeScript-Objekt konvertiert
      // Durch die Zuweisung von "this.tmpSa= d" bekommt man Typsicherheit.
      // Wenn man weiss, welches Format über Json rein kommt, kann man die
      // entsprechenden model-Dateien zusammenbasteln.
      this.sa_array = [];
      data.forEach((d) => {

        this.tmpSa= d;
        this.sa_array.push(this.tmpSa);

      });

      this.selStangObject = this.sa_array[0];

      // Rest-Aufruf zum Holen aller erfassten Bewerber zum gewählten Stellenangebot bzw. die Id desselbigen
      /// evtl. die Id des initialen Bewerbers einstellen
      this.getListBewerber(this.selStangObject.id, FIRST);

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

      // Anzeige des selektierten und in der Tabelle "bewerber" gefundenen Datensatzes
      this.nachname!.setValue(bewerber.nachname);
      this.vorname!.setValue(bewerber.vorname);
      this.anrede!.setValue(bewerber.anrede);
      this.titel!.setValue(bewerber.titel);
      this.plz!.setValue(bewerber.plz);
      this.ort!.setValue(bewerber.ort);
      this.strasse!.setValue(bewerber.strasse);
      this.hausnummer!.setValue(bewerber.hausnummer);
      this.email!.setValue(bewerber.email);
      this.notizen!.setValue(bewerber.notizen);
      this.skills!.setValue(bewerber.skills);

      let tmpArrayKommunikation:Kommunikation[] = [];
      this.bewerberFormGroup.value.kommunikation = tmpArrayKommunikation;

      // Dia Anlagen stehen ohne eingerichtete Relation in der Entität "ibm.anlagen"
      // Diese werden gesondert behandelt, da teilweise große Datenmengen bei mehren Pdf's zu transferieren wären
      let tmpArrayAnlagen:Anlagen[] = [];
      this.bewerberFormGroup.value.anlagen = tmpArrayAnlagen;

      // damit in der Dropdownlistbox ein Element vorausgewählt ist
      this.selBewerber = bewerber;

    }

    // console.log("geclicktes Stellenangebot: " + stang.bezeichnung);


    /*
    this.aktSaBezeichnung = stang.bezeichnung;

    this.id = stang.id;
    this.notizen = stang.notizen;
    this.status_selected = stang.sd_status;
    this.kanal_selected  = stang.sd_kanal;
    this.pdf_attached = stang.pdf_stellenangebot;

    this.dateEndeDefault = null;

    // 5 = Juni, die Monate werden ab 0 gezählt
    if (this.beginn && this.beginn.length == 10) {
      var day   = parseInt(this.beginn.substring(0,2));
      var month = parseInt(this.beginn.substring(3,5));
      var year  = parseInt(this.beginn.substring(6,10));
      // this.dateBeginnDefault = new FormControl(new Date(year,month-1,day));
      this.dateBeginnDefault = new Date(year,month-1,day);
    }

    // Rücksetzen, dass man eine neue Pdf-Datei zum COhladen ausgewählt hat
    this.selFilePdfStellenangebot = null;
    */

  }

  public saveFormGroupBewerber() {

    // 1 = INSERT
    // 2 = UPDATE
    if (this.mode == 1) {

      this.tmpBew.id = -1;
      this.tmpBew.idstellenangebot = this.selStangObject.id;
      this.tmpBew.nachname = this.bewerberFormGroup.value.nachname;
      this.tmpBew.vorname  = this.bewerberFormGroup.value.vorname;
      this.tmpBew.anrede   = this.bewerberFormGroup.value.anrede;
      this.tmpBew.titel    = this.bewerberFormGroup.value.titel;
      this.tmpBew.plz      = this.bewerberFormGroup.value.plz;
      this.tmpBew.ort      = this.bewerberFormGroup.value.ort;
      this.tmpBew.strasse  = this.bewerberFormGroup.value.strasse;
      this.tmpBew.hausnummer  = this.bewerberFormGroup.value.hausnummer;
      this.tmpBew.email    = this.bewerberFormGroup.value.email;
      this.tmpBew.notizen  = this.bewerberFormGroup.value.notizen;
      this.tmpBew.skills   = this.bewerberFormGroup.value.skills;

      let tmpArrayKommunikation:Kommunikation[] = [];
      this.tmpBew.kommunikation = tmpArrayKommunikation;

      let tmpArrayAnlagen:Anlagen[] = [];
      this.tmpBew.anlagen = tmpArrayAnlagen;

      // jetzt mit einem Post in der Entität "ibm.bewerber" inserten
      this.insertBewerber(this.tmpBew);

    } else {

      // Bewerberdaten mit einem PUT updaten
    }

  }


  private insertBewerber(bewerber: Bewerber) {

    // Updaten einer Entität "stellenangebot"
    this.serviceBewerber.insBewerber(bewerber).subscribe(data => {

      // Merken des Nachnamens des neuen Datensatzes, damit in der Listbox mit allen Bewerbern entsprechend positioniert werden kann
      this.aktBewNachname = bewerber.nachname;

      // Holen aller Bewerber zum selektierten Stellenangebot über REST aus der Entität "bewerber" nach this.bew_array[]
      this.getListBewerber(this.selStangObject.id, INSERTED);

    });
  }

  /*
   * Holen aller erfassten Bewerber zum gewählten Stellenangebot aus der Tablle "bewerber" by "idstellenangebot"
   *
   * Anhand welcher ID gefetched wird, häng auch vom Modus ab, der gerade gültig ist:
   * FIRST steht für den ersten Bewerber in der Liste (beim erstmaligen Initialisieren des Dialogs)
   * INSERTED steht für den ersten Bewerber in der Liste
   * UPDATET  steht für den ersten Bewerber in der Liste
   * CLICKED, ween der Benutzer einen Bewerber in der UI angeclicked hat
   */
  public getListBewerber(idstellenangebot: number, mode: number ){

    this.serviceBewerber.getListeBewerber(idstellenangebot).subscribe(data => {
      this.bew_array = [];

      data.forEach((d) => {
        this.tmpBew= d;
        this.bew_array.push(this.tmpBew);
      });

      // Falls mindestens ein Datensatz gefunden wird, Aufbau einer Listbox mit allen Bewerbern,
      if (this.bew_array.length > 0) {

        // Details des ersten gefunden Bewerbers anzeigen
        // (bzw. des eben neu angelegt Bewerbers bzw. des ben veränderten Bewerbers)
        this.bewerberShowDetails(this.bew_array[0]);

        /*
        // Holen der bisherigen Kokmmunikation bzgl. des selektierten Bewerbers
        this.get_kommunikation(this.bew_array[0].id);

        // Holen der hinterlegten Anlagen bzgl. des selektierten Bewerbers
        this.get_anlagen(this.bew_array[0].id);
        */

      }  else {

        this.tmpBew  = {id: 0, idstellenangebot: 0, nachname: '', vorname: '', anrede: '', titel: '',
                        plz: 0, ort: '', strasse: '', hausnummer: 0, email: '', notizen: '', kommunikation: [],
                        anlagen: [], skills: ''};

        this.readonly = false;

        this.mode = 1; // INSERT-Modus
        this.readonly = false;

        // leeres Formual anbieten, um den ersten eingegeangene Bewerber anlegen zu können
        this.bewerberFormGroup.reset();

        //  checken, ob das wirklich raus kann
        // this.bewerberShowDetails(this.tmpBew);
      }
    });

    // Falls noch kein Bewerber erfasst wurde, Freischalten des Buttons, um einen neuen Bewerber anzulegen
    return null;
  }

  /* ========================= Methoden, die aus der UI getriggered werden =================== */

  ///////////////////////////////////////////////////
  // Listbox mit allen Stellenangeboten
  ///////////////////////////////////////////////////


  public stangChangeAction(selStangObject: Stellenangebot) {

    // darin steht ein Objekt vom Typ "Stellenangebot"
    console.log(selStangObject);

    // Aufbau der Listbox mit allen zugehörigen Bewerbern
    this.getListBewerber(selStangObject.id, FIRST);

  }

  public buildListBewerber(id_stellenangebot: number) {

    this.getListBewerber(id_stellenangebot, FIRST);
  }

  ///////////////////////////////////////////////////
  // Listbox mit den Bewerbern eines Stellenangebots
  ///////////////////////////////////////////////////
  public bewerberChangeAction(bewerber: Bewerber) {

    // momentan keine weitere Funktionalität hinterlegt
    console.log(bewerber);

  }

  public showSelectedBewerber (idbewerber: number) {
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

}

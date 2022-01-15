import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { ServiceBewerber } from '../service.Bewerber';
import { Bewerber, Anlagen, Kommunikation } from '.././model.Bewerber';

@Component({
  selector: 'app-bewerber',
  templateUrl: './bewerber.component.html',
  styleUrls: ['./bewerber.component.scss']
})
export class BewerberComponent implements OnInit {

  sa_array: Stellenangebot[] = [];
  tmpSa!: Stellenangebot;

  // in der Dropdown-LB selektiertes Stellenangebot
  selStangObject!: Stellenangebot;

  bew_array: Bewerber[] = [];
  tmpBew!: Bewerber;
  // in der Dropdown-LB selektierter Bewerber
  selBewerberObject!: Bewerber;

  // in der Dropdown-LB selektierter Bewerber
  selBewerber!: Bewerber;

  public readonly: boolean = true;

  // Felder im Dialog zur Pflege der Bewerber
  id: number = 0;
  nachname: string = "";
  vorname: string = "";
  anrede: string = "";
  titel: string = "";
  plz: number = 0;
  ort: string = "";
  strasse: string = "";
  hausnummer: number = 0;
  email: string = "";
  notizen: string = "";
  kommunikation: Kommunikation[] = [];
  anlagen: Anlagen[] = [];


  // 1 = INSERT
  // 2 = UPDATE
  mode!: number;


  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private serviceBewerber: ServiceBewerber,
              private router: Router) { }

  ngOnInit(): void {

    this.getStellenangebote();

  }

  private getStellenangebote(){

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
      this.getListBewerber(this.selStangObject.id);

    });
  }


    // Holen aller erfassten Bewerber zum gewählten Stellenangebot aus der Tablle "bewerber" by "id_stellenangebot"
    public getListBewerber(id_Stellenangebot: number ){

      this.serviceBewerber.getListeBewerber(id_Stellenangebot).subscribe(data => {
        this.bew_array = [];

        data.forEach((d) => {

          this.tmpBew= d;
          this.bew_array.push(this.tmpBew);
        });

      // Falls mindestens ein Datensatz gefunden wird, Aufbau einer Listbox mit allen Bewerbern,
      if (this.bew_array.length > 0) {
        // Details des ersten gefunden Bewerbers anzeigen
        this.bewerberShowDetails(this.bew_array[0]);

        /*
        // Holen der bisherigen Kokmmunikation bzgl. des selektierten Bewerbers
        this.get_kkommunikation(this.bew_array[0].id);

        // Holen der hinterlegten Anlagen bzgl. des selektierten Bewerbers
        this.get_anlagen(this.bew_array[0].id);
        */

      }  else {
        this.tmpBew = undefined!;
        this.selBewerberObject  = undefined!;
        this.bewerberShowDetails(this.tmpBew);
      }


      });



      // Falls noch kein Bewerber erfasst wurde, Freischalten des Buttons, um einen neuen Bewerber anzulegen
      return null;
    }


  public bewerberShowDetails(bewerber: Bewerber) {

    if (bewerber === undefined) {
      // alle Eingabefelder sind empty
    } else {

    }

    // console.log("geclicktes Stellenangebot: " + stang.bezeichnung);

    // damit in der Dropdownlistbox ein Element vorausgewählt ist
    this.selBewerber = bewerber;

    /*
    this.aktSaBezeichnung = stang.bezeichnung;

    this.id = stang.id;
    this.bezeichnung = stang.bezeichnung;
    this.beginn = stang.beginn;
    this.ende = stang.ende;
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

    if (this.ende && this.ende.length == 10) {
      var day   = parseInt(this.ende.substring(0,2));
      var month = parseInt(this.ende.substring(3,5));
      var year  = parseInt(this.ende.substring(6,10));
      this.dateEndeDefault = new Date(year,month-1,day);
      // this.dateEndeDefault = new FormControl(new Date(year,month-1,day));
    }

    // Rücksetzen, dass man eine neue Pdf-Datei zum COhladen ausgewählt hat
    this.selFilePdfStellenangebot = null;

    // Setzen des aktuellen Status in der Radiolist, die alle Status beinhaltet
    this.sync_status(this.sd_status_array, stang.sd_status);

    // Setzen der geschalteten Kanäle im Array mit allen möglichen Kanälen
    this.sync_kanaele(this.sd_kanal_array, stang.kanaele);

    // Setzen des erfolgreichen Kanals in der Radiolist, die alle Kanäle beinhaltet
    this.sync_kanal_success(this.sd_kanal_success_array, stang.sd_kanal);

    */

  }



  public stangChangeAction(selStangObject: Stellenangebot) {
    // daring steht ein WErt vom Typ "Stellenangebot"
    console.log(selStangObject);
  }


  public showBewerber(sa: Stellenangebot) {
    console.log(sa);
  }

}

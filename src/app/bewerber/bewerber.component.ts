import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Stellenangebot } from '../model.Stellenangebot';
import { ServiceStellenangebote } from '../service.Stellenangebot';

@Component({
  selector: 'app-bewerber',
  templateUrl: './bewerber.component.html',
  styleUrls: ['./bewerber.component.scss']
})
export class BewerberComponent implements OnInit {

  public readonly: boolean = true;
  sa_array: Stellenangebot[] = [];
  tmpSa!: Stellenangebot;

  // in der Dropdown-LB selektiertes Stellenangebot
  selStangObject!: Stellenangebot;


  constructor(private serviceStellenangebote: ServiceStellenangebote, private router: Router) { }

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

      /*
      // Vorbelegen, dass der erste Eintrag ind er Listbox selektiert ist
      this.stangShowDetails(this.sa_array[0]);

      // Setzen des Status, der zum selektierten Stellenangebot gehört
      this.sync_status(this.sd_status_array, this.sa_array[0].sd_status);

      // Setzen des Kanäle, die beim aktuell selektierten Stellenangebot geschlaten wurden
      this.sync_kanaele(this.sd_kanal_array, this.sa_array[0].kanaele);

      this.sync_kanal_success(this.sd_kanal_success_array, this.sa_array[0].sd_kanal);
      */
    });
  }

  public stangChangeAction(selStangObject: Stellenangebot) {
    // daring steht ein WErt vom Typ "Stellenangebot"
    console.log(selStangObject);
  }


  public showBewerber(sa: Stellenangebot) {
    console.log(sa);
  }

  public stangShowDetails(stang: Stellenangebot) {

    // console.log("geclicktes Stellenangebot: " + stang.bezeichnung);

    // damit in der Dropdownlistbox ein Element vorausgewählt ist
    this. selStangObject = stang;

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


}

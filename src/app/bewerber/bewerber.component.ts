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

        // In JSON gibt es keinen Typ "Date", kommt als String und muss in ein Datum konvertiert werden
        this.tmpSa.beginnDate = new Date(this.tmpSa.beginn);
        this.tmpSa.endeDate = new Date(this.tmpSa.ende);

        this.sa_array.push(this.tmpSa);

      });

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

  public showBewerber(sa: Stellenangebot) {
    console.log(sa);
  }

}

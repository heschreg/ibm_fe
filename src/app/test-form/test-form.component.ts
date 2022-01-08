import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { Kanal, Status, Stellenangebot } from '../model.Stellenangebot';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TestFormComponent implements OnInit {

  public sd_status_array: Status[] = [];
  public sd_kanal_array: Kanal[] = [];

  sa_array: Stellenangebot[] = [];
  tmpSa!: Stellenangebot;
  selSa!: Stellenangebot;

  bez: String = "";
  begDate!: Date;
  endDate!: Date;
  notizen: String = "";

  status_selected: string = "";

  test_checked: boolean = false;

  form: FormGroup = new FormGroup({});

  constructor(private serviceStellenangebote: ServiceStellenangebote, private router: Router) {
  }

  ngOnInit(): void {

    this.getStatus();
    this.getKanaele();
    this.getStellenangebote();
    // this.getOneStellenangebot(1);
  }

  private getStatus() {
    // Holen aller Status aus der Tabelle "sd_status"
    this.serviceStellenangebote.getListeStatus().subscribe(data => {
      data.forEach((d) => {
        this.sd_status_array.push(d);
      });
    });
  }

  private getKanaele() {
    // Holen aller Kanaele aus der Tabelle "sd_kanal"
    this.serviceStellenangebote.getListeKanaele().subscribe(data => {
      data.forEach((d) => {
          this.sd_kanal_array.push(d);
      });
    });
  }

  public show_kanal(selectedChannel: Kanal) {
    // console.log(selectedChannel);
  }

  public showStatus() {
    console.log(this.status_selected);
  }


  /*
    this.tmpSa.bezeichnung = d.bezeichnung;
    this.tmpSa.beginnDate = new Date(d.beginn);
    this.tmpSa.endeDate = new Date(d.ende);

    this.tmpSa.sd_kanal = d.sd_kanal;
    this.tmpSa.sd_status = d.status;
    this.tmpSa.kanaele = d.kanaele;

    d.kanaele.forEach( (k) => {
      console.log('Id: ' + k.id + ', Kanalbez.:' + k.bezeichnung);
    })
    console.log('Beginn: ' + d.beginn);
    console.log('Bezeichnung: ' + d.sd_status.bezeichnung);
    console.log('Notizen: ' + d.notizen);
  */

  private getStellenangebote(){

    this.serviceStellenangebote.getListeStellenangebote().subscribe(data => {

      // Das Json, das über Netzwerk verschickt wurde, ist hier
      // bereits in  ein TypeScript-Objekt konvertiert
      // Durch die Zuweisung von "this.tmpSa= d" bekommt man Typsicherheit.
      // Wenn man weiss, welches Format über Json rein kommt, kann man die
      // entsprechenden model-Dateien zusammenbasteln.
      data.forEach((d) => {

        this.tmpSa= d;

        // In JSON gibt es keinen Typ "Date", kommt als String und muss in ein Datum konvertiert werden
        this.tmpSa.beginnDate = new Date(this.tmpSa.beginn);
        this.tmpSa.endeDate = new Date(this.tmpSa.ende);

        this.sa_array.push(this.tmpSa);

      });
    });
  }

  private getOneStellenangebot(id: number) {
    this.serviceStellenangebote.getStellenangebotById(id).subscribe(data => {
      console.log(data);
      // this.employees = data;
      // this.employees.forEach((e) => {console.log(e.firstName)});
    });
  }

  public stangShowDetails(stang: any) {
    console.log("geclicktes Stellenangebot: " + stang.bezeichnung);
    this.bez = stang.bezeichnung;
    this.begDate = stang.beginnDate;
    this.endDate = stang.endeDate;
    this.notizen = stang.notizen;
  }

  public submit() {

  }
}

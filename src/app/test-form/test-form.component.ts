import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { Kanal, Kanal_Success, Status, Stellenangebot } from '../model.Stellenangebot';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TestFormComponent implements OnInit {

  public readonly: boolean = true;
  public updateMode: boolean = false;

  public sd_status_array: Status[] = [];

  // für check-buttons, um alle geschalteten Kanäle auszuwählen (multi-select)
  public sd_kanal_array: Kanal[] = [];

  // für radio-buttons, um den einen erfolgreichen Kanals auszuwählen (single-select)
  public sd_kanal_success_array: Kanal_Success[] = [];

  sa_array: Stellenangebot[] = [];
  tmpSa!: Stellenangebot;
  id: number = 0;
  bezeichnung: string = "";
  beginn: string = "";
  ende: string = "";
  notizen: string = "";

  status_selected!: Status;
  kanal_selected!: Kanal;

  form: FormGroup = new FormGroup({});

  constructor(private serviceStellenangebote: ServiceStellenangebote, private router: Router) {
  }

  ngOnInit(): void {

    this.getStatus();

    this.getKanaele();

    this.getKanaeleSuccess();

    this.getStellenangebote();
    // this.getOneStellenangebot(1);

    this.readonly = true;
    this.updateMode = true;
  }

  private getStatus() {

    // Holen aller Status aus der Tabelle "sd_status"
    this.sd_status_array = [];
    this.serviceStellenangebote.getListeStatus().subscribe(data => {
      data.forEach((d) => {
        this.sd_status_array.push(d);
      });
    });
  }

  private getKanaele() {

    // Holen aller Kanäle aus der Tabelle "sd_kanal"
    this.sd_kanal_array = [];

    this.serviceStellenangebote.getListeKanaele().subscribe(data => {
      data.forEach((d) => {
        // Dieses Array wird zur Erfassung aller geschalteten Kanäle verwendet
        this.sd_kanal_array.push(d);
      });
    });
  }

  private getKanaeleSuccess() {

    // Holen aller Kanäle aus der Tabelle "sd_kanal"
    this.sd_kanal_success_array = [];
    // this.kanal_selected = null;

    this.serviceStellenangebote.getListeKanaele().subscribe(data => {
      data.forEach((d) => {

        // Dieses Array wird zur Auswahl des verantwortlichen Kanals im Erfolgsfall verwendet
        // DAs sind radio-Buttons, da im Gegensatz zu oben nur ein Single-Selct möglich sit
        d.selected=false;
        this.sd_kanal_success_array.push(d);
      });
    });
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

      // Vorbelegen, dass der erste Eintrag ind er Listbox selektiert ist
      this.stangShowDetails(this.sa_array[0]);

      // Setzen des Status, der zum selektierten Stellenangebot gehört
      this.sync_status(this.sd_status_array, this.sa_array[0].sd_status);

      // Setzen des Kanäle, die beim aktuell selektierten Stellenangebot geschlaten wurden
      this.sync_kanaele(this.sd_kanal_array, this.sa_array[0].kanaele);

      this.sync_kanal_success(this.sd_kanal_success_array, this.sa_array[0].sd_kanal);
    });
  }

  private getOneStellenangebot(id: number) {
    this.serviceStellenangebote.getStellenangebotById(id).subscribe(data => {
      console.log(data);
      // this.employees = data;
      // this.employees.forEach((e) => {console.log(e.firstName)});
    });
  }

  // Parameter 1: alle Status, die in der Stammdatentablle existieren
  public sync_status(status_alle: Status[], status_akt: Status) {
    status_alle.forEach( (st) => {
      if (st.bezeichnung === status_akt.bezeichnung) {
        st.checked = true;
      } else {
        st.checked = false;
      };
    });

  };

  // Parameter 1: alle Kanäle, die in der Stammdatentablle existieren
  // Parameter 2: alle Kanäle, die in der akuellen Stellanzeige geschalten sind
  public sync_kanaele(kanaele_alle: Kanal[], kanaele_akt: Kanal[]) {
    kanaele_alle.forEach( (k_all) => {
      kanaele_akt.every( (k_akt) => {
        k_all.selected = false;
        if (k_all.bezeichnung === k_akt.bezeichnung) {
          k_all.selected = true;
          return false;
        } else {
          return true;
        };
      });
    });
  };

  public sync_kanal_success(kanaele_alle: Kanal_Success[], kanal_success: Kanal_Success) {
    kanaele_alle.forEach( (k_all) => {
      k_all.selected = false;
      if (k_all.bezeichnung === kanal_success.bezeichnung) {
        k_all.selected = true;
        return false;
      } else {
        return true;
      };
    });
  };

  public stangShowDetails(stang: Stellenangebot) {
    console.log("geclicktes Stellenangebot: " + stang.bezeichnung);
    this.id = stang.id;
    this.bezeichnung = stang.bezeichnung;
    this.beginn = stang.beginn;
    this.ende = stang.ende;
    this.notizen = stang.notizen;

    // Setzen des richtigen Status im aktuell gewählten Stellenangebot
    this.sync_status(this.sd_status_array, stang.sd_status);

    // Setzen des Kanäle, die beim aktuell selektierten Stellenangebot geschalten wurden
    this.sync_kanaele(this.sd_kanal_array, stang.kanaele);

  }

  public setReadOnly(mode:boolean) {

    // Button, das man Daten bearbeiten möchte
    // 1. initialer Zustand: disabled = false, updateMode = false
    this.readonly = mode;
    this.updateMode = mode;
  }

  public resetStellenangebot() {
    this.ngOnInit();
  }

  public updStellenangebot() {

    // In welchem Stellenangebot befinden wir uns eigentlich

    this.sa_array.forEach( (sa) => {

      if (sa.id === this.id) {
        // Jetzt sind wir in dem Array-Eintrag der upzudaten ist
        sa.beginn = this.beginn;
        sa.bezeichnung = this.bezeichnung;
        // sa.ende = "";
        // sa.endeDate = new Date();

        // this.sd_kanal_array = {id, bezeichnung, selected}
        let tmpArray:Kanal[] = [];
        this.sd_kanal_array.forEach ( (k) => {
          if (k.selected === true) {
            delete k.selected;
            tmpArray.push(k);
          }
        });

        sa.kanaele = tmpArray;

        /*
        sa.kanaele.forEach ( k => {
          delete k.selected;
        })
        */

        sa.notizen = this.notizen;

        // sd_kanal_success_array: Kanal_Success[] = [];
        // In "kanal_selected" steht der erfolgreiche Kanal, der in die Property stellenangebot.sd_kanal muss
        sa.sd_kanal = this.kanal_selected;
        delete sa.sd_kanal.selected;

        // sd_status(_array) = {id, bezeichnung, checked}
        sa.sd_status = this.status_selected;
        delete sa.sd_status.checked;

        // Datumshandling fehlt an dieser Stelle noch
        // ....

        // jetzt mit einem Post updaten
        this.updateStellenangebot(sa);
      }

    })

    this.setReadOnly(true);

  }

  private updateStellenangebot(sa: Stellenangebot) {

    // Updaten einer Entität "stellenangebot"
    this.serviceStellenangebote.updStellenangebot(sa).subscribe(data => {
      console.log(data);
    });
  }


  public test() {
    console.log("test");
  }

  public show_kanal(selectedChannel: Kanal) {
    console.log(selectedChannel);
  }

  /*
  public submit() {  }
  */


}

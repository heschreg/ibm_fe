import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { Stellenangebot } from '../model.Stellenangebot';

@Component({
  selector: 'app-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss']
})
export class TestFormComponent implements OnInit {

  sa: Stellenangebot[] = [];

  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private router: Router) {
  }

  ngOnInit(): void {
    this.getStellenangebote();
    // this.getOneStellenangebot(1);
  }

  private getStellenangebote(){
    this.serviceStellenangebote.getListeStellenangebote().subscribe(data => {

      // Das JSon, das über das NEtzwerk verschickt wurde, ist an dieser Stelle
      // bereits in  ein TypeScript-Objekt konvertiert
      // Durch die Zuweisung von "this.sa <= data" bekommt man Typsicherheit
      // Da man weiss, welches Format über Json rein kommt, kann man die
      // entschrechen model-Dateien zusammenbasteln.
      this.sa = data;
      this.sa.forEach((s) => {
        console.log('Beginn: ' + s.beginn);
        console.log('Bezeichnung: ' + s.sd_status.bezeichnung);
        console.log('Notizen: ' + s.notizen);
        s.kanaele.forEach( (k) => {
          console.log('Id: ' + k.id + ', Kanalbez.:' + k.bezeichnung);
        })
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


}

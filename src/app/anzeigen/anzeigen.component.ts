import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { Kanal, Kanal_Success, Status, Stellenangebot } from '../model.Stellenangebot';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MyAlertDialogComponent } from '../my-alert-dialog/my-alert-dialog.component'


@Component({
  selector: 'app-anzeigen',
  templateUrl: './anzeigen.component.html',
  styleUrls: ['./anzeigen.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnzeigenComponent implements OnInit {

  @ViewChild('fileInput')  fileInput: any;
  selFilePdfStellenangebot: File | null = null;;

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
  bez: string = "";
  begDate!: Date;
  endDate!: Date;
  notizen: string = "";

  status_selected!: Status;
  kanal_selected!: Kanal;


  form: FormGroup = new FormGroup({});

  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private fb: FormBuilder,
              private router: Router,
              private dialog: MatDialog
              // private customDialog: MyCustomDialogService,
   ) {
    /* In stackblitz.com danach suchen
      this.customDialogForm = fb.group({
        dialogTitle: ['Title', [Validators.required]],
        dialogMsg: ['', [Validators.minLength(5), Validators.maxLength(1000)]],
        dialogType: ['alert'],
        okBtnColor: [''],
        okBtnLabel: [''],
        cancelBtnColor: [''],
        cancelBtnLabel: ['']
        */

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

    this.serviceStellenangebote.getListeKanaele().subscribe(data => {
      data.forEach((d) => {

        // Dieses Array wird zur Auswahl des verantwortlichen Kanals im Erfolgsfall verwendet
        // Das sind radio-Buttons, da im Gegensatz zu oben nur ein Single-Selct möglich sit
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

        // In JSON gibt es keinen Typ "Date", kommt als String und muss in ein Datum konvertiert werden
        this.tmpSa.beginnDate = new Date(this.tmpSa.beginn);
        this.tmpSa.endeDate = new Date(this.tmpSa.ende);

        this.sa_array.push(this.tmpSa);

      });

      // Vorbelegen, dass der erste Eintrag in der Listbox selektiert ist
      this.stangShowDetails(this.sa_array[0]);

      // Setzen des Status in der Radiolist, die alle Status enthält
      this.sync_status(this.sd_status_array, this.sa_array[0].sd_status);

      // Setzen des Kanäle, die beim aktuell selektierten Stellenangebot geschalten wurden
      this.sync_kanaele(this.sd_kanal_array, this.sa_array[0].kanaele);

      // Setzen des erfolgreichen Kanals in der Radiolist, die alle Kanäle beinhaltet
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
  // Parameter 2: alle Status des aktuell selektierten  Stellenangebots
  public sync_status(status_alle: Status[], status_akt: Status) {
    status_alle.forEach( (st_akt) => {
      if (st_akt.bezeichnung === status_akt.bezeichnung) {
        st_akt.checked = true;

        // Hier wird entschieden welcher der Radio-Buttons nach dem Initialisieren im Dialog selektiert wird
        this.status_selected = st_akt;

      } else {
        st_akt.checked = false;
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

        // Hier wird entschieden welcher der Radio-Buttons nach dem Initialisieren im Dialog selektiert wird
        this.kanal_selected = k_all;

        return false;
      } else {
        return true;
      };
    });
  };


  public setReadOnly(mode:boolean) {

    // Button, das man Daten bearbeiten möchte
    // 1. initialer Zustand: disabled = false, updateMode = false
    this.readonly = mode;
    this.updateMode = mode;
  }

  // Konkretes Stellenagebot aus der Liste ausgewählt
  public stangShowDetails(stang: Stellenangebot) {

    console.log("geclicktes Stellenangebot: " + stang.bezeichnung);

    this.id = stang.id;
    this.bez = stang.bezeichnung;
    this.begDate = stang.beginnDate!;
    this.endDate = stang.endeDate!;
    this.notizen = stang.notizen;
    this.status_selected = stang.sd_status;
    this.kanal_selected  = stang.sd_kanal;

    // Setzen des aktuellen Status in der Radiolist, die alle Status beinhaltet
    this.sync_status(this.sd_status_array, stang.sd_status);

    // Setzen der geschalteten Kanäle im Array mit allen möglichen Kanälen
    this.sync_kanaele(this.sd_kanal_array, stang.kanaele);

    // Setzen des erfolgreichen Kanals in der Radiolist, die alle Kanäle beinhaltet
    this.sync_kanal_success(this.sd_kanal_success_array, stang.sd_kanal);

  }


  public resetStellenangebot() {
    this.ngOnInit();
  }

  public updStellenangebot() {

    // In welchem Stellenangebot befinden wir uns eigentlich

    this.sa_array.forEach( (sa) => {

      if (sa.id === this.id) {
        // Jetzt sind wir in dem Array-Eintrag der upzudaten ist
        // sa.beginn = "";
        // sa.beginnDate = new Date();
        sa.bezeichnung = this.bez;
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
        if (sa.sd_kanal !== undefined) {
          delete sa.sd_kanal.selected;
        }

        // bei folgender Lösung wird jede  property innerhalb des Objektes auf null gesetzt
        /*
        if (this.kanal_selected !== undefined) {
          sa.sd_kanal = this.kanal_selected;
          delete sa.sd_kanal.selected;
        } else {
          this.setNull(sa.sd_kanal);
        }*/

        sa.sd_status = this.status_selected;
        if (sa.sd_status !== undefined) {
          delete sa.sd_status.checked;
        }

        // Datumshandling fehlt an dieser Stelle noch

        // ....

        // anschließend können die Hilfsproperties gelöscht werden:
        delete sa.beginnDate;
        delete sa.endeDate;

        // jetzt mit einem Post updaten
        this.updateStellenangebot(sa);
      }

    })

    this.setReadOnly(true);

  }

  private setAll(obj: any, val: any) {
    /* Duplicated with @Maksim Kalmykov
        for(index in obj) if(obj.hasOwnProperty(index))
            obj[index] = val;
    */
    Object.keys(obj).forEach(function(index) {
        obj[index] = val
    });
  }

  private setNull(obj: any) {
    this.setAll(obj, null);
  }

  private updateStellenangebot(sa: Stellenangebot) {

    // Updaten einer Entität "stellenangebot"
    this.serviceStellenangebote.updStellenangebot(sa).subscribe(data => {
      this.stangShowDetails(sa);
      // console.log(data);
    });
  }


  public test() {
    console.log("test");
  }

  public show_kanal(selectedChannel: Kanal) {
    console.log(selectedChannel);
  }

  // Handling der pdf-Datei, die das Stellenangebot enthlt
  ///////////////////////////////////////////////////////////

  public onFileChangeInput(event: any) {
    this.selFilePdfStellenangebot = event.target.files[0];
  }


  public onUploadPdf() {

    if (this.selFilePdfStellenangebot !== undefined) {
      // Updaten einer pdf-Datei mit einem Stellenangebots in die Entität "ibm.pdf_stellenangebot"
      this.serviceStellenangebote.postPdfStellenangebot(this.selFilePdfStellenangebot!).subscribe(data => {
        console.log(data);
      });
    } else {
      // Hinweis ausgeben, dass kein Datei selektiert wurde
      this.showHinweisMissingPdfDatei();
    }
  }

  public fetchPdf() {

    if (this.selFilePdfStellenangebot !== undefined) {
      // Holen der pdf-Datei, deren Name in this.selFilePdfStellenangebot steht
      /*
      this.serviceStellenangebote.getPdfStellenangebot(this.selFilePdfStellenangebot).subscribe(data => {
        console.log(data);
      });
      */
      this.serviceStellenangebote.getPdfStellenangebot(this.selFilePdfStellenangebot!.name);

    } else {
      // Hinweis ausgeben, dass kein Datei selektiert wurde
      this.showHinweisMissingPdfDatei();
    }
  }

  showHinweisMissingPdfDatei() {
    let dialogRef = this.dialog.open(MyAlertDialogComponent);
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result == 'ok') {
        console.log(result);
      }
    })
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Tricky Dateiauswahldialog, da der schöne Material-Button den hässlichen ORiginal Button nur überlagert
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.selFilePdfStellenangebot = files[0];
  }




}


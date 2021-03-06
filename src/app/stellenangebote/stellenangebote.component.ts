import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ServiceStellenangebote } from '../service.Stellenangebot';
import { Kanal, Status, Stellenangebot, Pdf_Attached } from '../model.Stellenangebot';
import { MatDialog } from '@angular/material/dialog';
import { MyAlertDialogComponent } from '../my-alert-dialog/my-alert-dialog.component'
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';


@Component({
  selector: 'app-stellenangebote',
  templateUrl: './stellenangebote.component.html',
  styleUrls: ['./stellenangebote.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StellenangeboteComponent implements OnInit {


  @ViewChild('fileInput')  fileInput: any;
  selFilePdfStellenangebot: File | null = null;

  public dateBeginnDefault!:  any;
  public dateEndeDefault!: any;

  public radioSaToSelect = 0;
  public firstRun : boolean = true;
  public aktSaBezeichnung = "";

  public mod_button_text = "Speichern";

  public readonly: boolean = true;
  public updateMode: boolean = false;

  public sd_status_array: Status[] = [];

  // für check-buttons, um alle geschalteten Kanäle auszuwählen (multi-select)
  public sd_kanal_array: Kanal[] = [];

  // für radio-buttons, um den einen erfolgreichen Kanals auszuwählen (single-select)
  public sd_kanal_success_array: Kanal[] = [];

  sa_array: Stellenangebot[] = [];
  tmpSa!: Stellenangebot;

  // in der Dropdown-LB selektiertes Stellenangebot
  selStangObject!: Stellenangebot;

  // Felder im Dialog zur Pflege der Stellenangebote
  id: number = 0;
  bezeichnung: string = "";
  beginn: string = "";
  ende: string = "";
  notizen: string = "";
  status_selected!: Status; // ???
  kanal_selected!: Kanal;
  kanaele: Kanal[] = [];
  pdf_attached : Pdf_Attached = {id: 0, name : '', type: ''};

  // 1 = INSERT
  // 2 = UPDATE
  mode!: number;


  // form: FormGroup = new FormGroup({});

  constructor(private serviceStellenangebote: ServiceStellenangebote,
              private dialog: MatDialog
              // private customDialog: MyCustomDialogService,
   ) {  }

  public beginnEvent(event: any){
    var datum = new Date(event.value);
    var dd = String(datum.getDate()).padStart(2, '0');
    var mm = String(datum.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = datum.getFullYear();
    const datumS = dd + '.' + mm + '.' + yyyy;

    this.beginn = datumS;
  }

  public endeEvent(event: any){
    var datum = new Date(event.value);
    var dd = String(datum.getDate()).padStart(2, '0');
    var mm = String(datum.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = datum.getFullYear();
    const datumS = dd + '.' + mm + '.' + yyyy;

    this.ende = datumS;
  }

  // wird beim Aufklappen dDAtePicker-Komponente für jedes Datum (cell) aufgerufen
  // Zurückgegeben wird im Positivfall die  css-Anweisung "highlight-dates"
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {

    // Only highligh dates inside the month view.
    const day = cellDate.getDay();

    // Highlight the 1st and 20th day of each month.
    return (day === 0 || day === 6) ? 'highlight-dates' : '' ;
  }

  public ngOnInit(): void {

    this.initDialogStellenangebote();
  }

  private initDialogStellenangebote() {

    console.log ("initDialogStellenangebote()");
    // Holen aller Status aus der Tabelle "sd_status"
    console.log ("getListeStatus()");
    this.sd_status_array = [];
    this.serviceStellenangebote.getListeStatus().subscribe(data => {

      data.forEach((d) => {
        this.sd_status_array.push(d);
      });

      // Holen aller Kanäle aus der Tabelle "sd_kanal"
      console.log ("getListeKanaele()");
      this.sd_kanal_array = [];
      this.serviceStellenangebote.getListeKanaele().subscribe(data => {
        data.forEach((d) => {
          // Dieses Array wird zur Erfassung aller geschalteten Kanäle verwendet
          if (d.bezeichnung !== "unklar") {
            this.sd_kanal_array.push(d);
          }
        });

        // Holen aller Kanäle aus der Tabelle "sd_kanal"
        console.log ("nochmal getListeKanaele()");
        this.sd_kanal_success_array = [];
        this.serviceStellenangebote.getListeKanaele().subscribe(data => {

          data.forEach((d) => {

            // Dieses Array wird zur Auswahl des verantwortlichen Kanals im Erfolgsfall verwendet
            // Das sind radio-Buttons, da im Gegensatz zu oben nur ein Single-Selct möglich sit
            d.selected=false;
            this.sd_kanal_success_array.push(d);
          });

          // Holen aller Stellenangebote über REST aus der Entität "stellenangebot" nach this.sa_array[]
          // Setzen von this.radioSaToSelect
          console.log ("getStellenangebote()");
          this.getStellenangebote();

        });
      });
    });
  }

  private setDialogValuesSelected( radioToSelect: number) {

    this.stangShowDetails(this.sa_array[radioToSelect]);

    // Setzen des Status in der Radiolist, die alle Status enthält
    this.sync_status(this.sd_status_array, this.sa_array[radioToSelect].sd_status);

    // Setzen des Kanäle, die beim aktuell selektierten Stellenangebot geschalten wurden
    this.sync_kanaele(this.sd_kanal_array, this.sa_array[radioToSelect].kanaele);

    // Setzen des erfolgreichen Kanals in der Radiolist, die alle Kanäle beinhaltet
    this.sync_kanal_success(this.sd_kanal_success_array, this.sa_array[radioToSelect].sd_kanal);

    this.readonly = true;
    this.updateMode = true;

  }

  public stangChangeAction(selStangObject: Stellenangebot) {
    // daring steht ein WErt vom Typ "Stellenangebot"
    console.log(selStangObject);
  }

  // Setzen von this.radioSaToSelect
      // Markieren des zuletzt gewähltenStellenangebots this.radioSaToSelect

  private getStellenangebote(){

    // console.log("Aufruf getStellenangebote");

    // Holen aller Stellenangebote über REST aus der DB
    this.serviceStellenangebote.getListeStellenangebote().subscribe(data => {

      // Das Json, das über Netzwerk verschickt wurde, ist hier
      // bereits in  ein TypeScript-Objekt konvertiert
      // Durch die Zuweisung von "this.tmpSa= d" bekommt man Typsicherheit.
      // Wenn man weiss, welches Format über Json rein kommt, kann man die
      // entsprechenden model-Dateien zusammenbasteln.
      console.log ("nach getListeStellenangebote().subscribe");

      this.sa_array = [];

      let index:number = 0;
      data.forEach((d) => {
        if (this.firstRun == false) {
          if (d.bezeichnung === this.aktSaBezeichnung) {
            // Jetzt weiss man, der wievielte Eintrag in der Listbox mit allen Stellenangeboten initial zu setzen ist
            this.radioSaToSelect = index;
          }
        } else {
            // Beim erstmaligen Starten des Dialogs den ersten Eintrag der Lb mit allen Stellangeboten selektieren
            this.radioSaToSelect = 0;
        }
        index++;

        this.sa_array.push(d);


      });

      this.firstRun = false;

      if (this.sa_array.length > 0) {
        // Setzen der Daten des selkierten Stellenangebotes im Dialog
        this.setDialogValuesSelected(this.radioSaToSelect);
      } else {
        this.showHinweisMissingPdfDatei("Das erste Stellenagebot kann jetzt angelegt werden");
        this.setMode(1); // ==> INSERT-Modus
      }

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

  public sync_kanal_success(kanaele_alle: Kanal[], kanal_success: Kanal) {
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


  public setMode(mode:number) {
    // 1 = INSERT
    // 2 = UPDATE
    this.mode = mode;


    if (mode > 0)  {
      if (mode == 1)  {
        this.mod_button_text = "Angebot anlegen";
        this.pdf_attached.name = "";
        this.firstRun = false;

      } else {
        this.mod_button_text = "Änderungen abspeichern";

      }

      this.setReadOnly(false);
    } else {
      this.setReadOnly(true);
    }

  }

  public setReadOnly(ro:boolean) {

    // Button, das man Daten bearbeiten möchte
    // 1. initialer Zustand: disabled = false, updateMode = false
    this.readonly = ro;
    this.updateMode = ro;
  }

  /*
   * wird aufgerufen
     1. aus Template:  (click)-funktion, falls konkretes Stellenagebot aus der Liste ausgewählt wird
     2. intern: ^      setDialogValuesSelected()
  */
  public stangShowDetails(stang: Stellenangebot) {

    // console.log("geclicktes Stellenangebot: " + stang.bezeichnung);

    // damit in der Dropdownlistbox ein Element vorausgewählt ist
    this. selStangObject = stang;

    this.aktSaBezeichnung = stang.bezeichnung;

    // Felder im Dialog zur Pflege der Stellenangebote
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

  }

  //  wird aus dem Template aufgerufen
  public saveStellenangebot() {

    // 1 = INSERT
    // 2 = UPDATE
    if (this.mode == 1) {

      let localStatus: Status = { id: 0, bezeichnung: ''};
      let localKanal: Kanal = {id: 0, bezeichnung: ''};
      let localPdfStellenangebot: Pdf_Attached = {id: 0, name: '', type: ''};

      let sa: Stellenangebot = {
        id: 0,
        bezeichnung: '',
        beginn: '',
        ende: '',
        notizen: '',
        sd_status: localStatus,
        sd_kanal: localKanal,
        kanaele: [],
        pdf_stellenangebot: localPdfStellenangebot
      };

      sa.id = -1;

      //////////////////////////////////////////////
      // Am Ende wird ein neuer Datensatz inserted
      //////////////////////////////////////////////

      sa.beginn = this.beginn;
      sa.bezeichnung = this.aktSaBezeichnung;
      sa.ende = this.ende;

      // this.sd_kanal_array = {id, bezeichnung, selected}
      let tmpArrayKanal:Kanal[] = [];
      this.sd_kanal_array.forEach ( (k) => {
        if (k.selected === true) {
          delete k.selected; // Property wegnehmen
          tmpArrayKanal.push(k);
        }
        sa.kanaele = tmpArrayKanal;

        sa.notizen = this.notizen;

        sa.sd_kanal = this.kanal_selected;
        if (sa.sd_kanal !== undefined) {
          delete sa.sd_kanal.selected;
        }

        sa.sd_status = this.status_selected;
        if (sa.sd_status !== undefined) {
          delete sa.sd_status.checked;
        }
      })

      // jetzt mit einem Post inserten
      this.insertStellenangebot(sa);

    } else {

      ////////////////////////////////////////
      // Am Ende wird der Datensatz geupdated
      ////////////////////////////////////////

      // Ermitteln, in welchem Stellenangebot man sich aktuell befindet
      this.sa_array.forEach( (sa) => {

        if (sa.id === this.id) {
          // Jetzt sind wir in dem Array-Eintrag der upzudaten ist

          sa.bezeichnung = this.aktSaBezeichnung;

          sa.beginn= this.beginn;
          sa.ende = this.ende;

          // this.sd_kanal_array = {id, bezeichnung, selected}
          let tmpArray:Kanal[] = [];
          this.sd_kanal_array.forEach ( (k) => {
            if (k.selected === true) {
              delete k.selected;
              tmpArray.push(k);
            }
          });
          sa.kanaele = tmpArray;

          sa.notizen = this.notizen;

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

          // jetzt mit einem Post updaten
          this.updateStellenangebot(sa);
        }

      })

    };

    this.setReadOnly(true);
  }


  public showBezeichnung() {
    console.log(this.aktSaBezeichnung);
  }

  public cancelStellenangebot() {

    this.mode = 0;
    this.mod_button_text = "Speichern";

    // Holen aller Stellenangebote über REST aus der Entität "stellenangebot" nach this.sa_array[]
    // Markieren des zuletzt gewähltenStellenangebots this.radioSaToSelect
    this.getStellenangebote();
  }

  private insertStellenangebot(sa: Stellenangebot) {

    // Updaten einer Entität "stellenangebot"
    this.serviceStellenangebote.insStellenangebot(sa).subscribe(data => {

      // Merken der Bezeichnung des neuen Datensatzes, damit in der Listbox entsprechend positioniert werden kann
      this.aktSaBezeichnung = sa.bezeichnung;

      // Holen aller Stellenangebote über REST aus der Entität "stellenangebot" nach this.sa_array[]
      // Setzen von this.radioSaToSelect
      this.getStellenangebote();

    });
  }

  private updateStellenangebot(sa: Stellenangebot) {

    // Updaten einer Entität "stellenangebot"
    this.serviceStellenangebote.updStellenangebot(sa).subscribe(data => {

      // Merken der Bezeichnung des geänderten Datensatze
      this.aktSaBezeichnung = sa.bezeichnung;

      // Holen aller Stellenangebote über REST aus der Entität "stellenangebot" nach this.sa_array[]
      // Setzen von this.radioSaToSelect
      this.getStellenangebote();

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

  /*
  public onFileChangeInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.selFilePdfStellenangebot = files[0];
  }
  */

  // Benutzer hat eine pdf-Datei ausgewählt, die dem aktuellen Stellenangebot zuzuordnen ist
  public updateStellenangebotPdf() {

    if (this.selFilePdfStellenangebot !== undefined) {
      // Updaten der Property Stellenangebot.pdf_stellenangebot und updaten der pdf-Datei in die Entität "ibm.pdf_stellenangebot"
      this.serviceStellenangebote.postPdfStellenangebot(this.id, this.selFilePdfStellenangebot!).subscribe(data => {

       // In data müsste jetzt vom Typ <Stellenangebot> sein
       // console.log(data);

        this.tmpSa = <Stellenangebot> data;
        this.selFilePdfStellenangebot = null; //dadurch wird auch wieder der Hochladen -Button ausgeblendet

        // Jetzt muss man die Property this.pdf_attached noch richtig setzen
        this.pdf_attached = this.tmpSa.pdf_stellenangebot;

      });

    } else {
      // Hinweis ausgeben, dass noch keine PDF-Datei zugeordnet ist
      this.showHinweisMissingPdfDatei("Bitte eine pdf-Datei auswählen");
    }
  }

  public fetchPdf() {

    // Die Daten sind in der Property this.sa.pdf_stellenangebot_id
    // Die dokwzuloadende und anzuzeigende PDF-Datei steht in "pdf_attached.name"
    if (this.pdf_attached.name !== null) {

      // Holen der pdf-Datei, deren Name oder Id !!! in this.selFilePdfStellenangebot steht
      /*
      this.serviceStellenangebote.getPdfStellenangebot(this.selFilePdfStellenangebot).subscribe(data => {
        console.log(data);
      });
      */
      this.serviceStellenangebote.getPdfStellenangebotById(this.pdf_attached.id);
      // this.serviceStellenangebote.getPdfStellenangebotByName(this.pdf_attached.name!);

    } else {
      // Hinweis ausgeben, dass kein Datei selektiert wurde
      this.showHinweisMissingPdfDatei("Bitte zunächst eine pdf-Datei selektieren");
    }
  }

  public showHinweisMissingPdfDatei(content: string) {
    let dialogRef = this.dialog.open(MyAlertDialogComponent);

    dialogRef.componentInstance.message = content;

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result == 'ok') {
        console.log(result);
      }
    })
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Tricky FILE-Auswahldialog, da der schönere Material-Button den hässlichen Original FIE-Button nur überlagert
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  /////////////////
  // Hilfsmethoden
  /////////////////

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

}


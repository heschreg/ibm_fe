import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { AppRoutingModule } from './app-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { TestFormComponent } from './test-form/test-form.component';
import { TestFormReactiveComponent } from './test-form-reactive/test-form-reactive.component';
import { HeaderComponent } from './header/header.component';
import { StellenangeboteComponent } from './stellenangebote/stellenangebote.component';
import { BewerberComponent } from './bewerber/bewerber.component';
import { MyAlertDialogComponent } from './my-alert-dialog/my-alert-dialog.component';
import { StammdatenComponent } from './stammdaten/stammdaten.component';

import { formatDate } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
// import { MomentDateModule} from '@angular/material-moment-adapter';

import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

/* ===================================================================  */

const MY_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }
},
display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
}
};

export class PickDateAdapter extends NativeDateAdapter {

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      /*
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      */
      const sd = formatDate(date,'dd.MM.yyyy',this.locale);
      return sd;
    } else {
      return date.toDateString();
    }
  }


  override getFirstDayOfWeek(): number {
    return 1;
   }
}


@NgModule({
  declarations: [
    AppComponent,
    TestFormComponent,
    TestFormReactiveComponent,
    HeaderComponent,
    StellenangeboteComponent,
    BewerberComponent,
    MyAlertDialogComponent,
    StammdatenComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    // MomentDateModule,
  ],

  providers: [
    {provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: { color: 'accent' }},
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: 'de-DE'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

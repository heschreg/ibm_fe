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
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { HeaderComponent } from './header/header.component';
import { AnzeigenComponent } from './anzeigen/anzeigen.component';
import { BewerberComponent } from './bewerber/bewerber.component';
import { MyAlertDialogComponent } from './my-alert-dialog/my-alert-dialog.component';
import { StammdatenComponent } from './stammdaten/stammdaten.component';

@NgModule({
  declarations: [
    AppComponent,
    TestFormComponent,
    TestFormReactiveComponent,
    HeaderComponent,
    AnzeigenComponent,
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
  ],

  providers: [{
    provide: MAT_RADIO_DEFAULT_OPTIONS,
    useValue: { color: 'accent' },
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }

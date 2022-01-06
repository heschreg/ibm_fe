import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TestFormComponent } from './test-form/test-form.component';
import { TestFormReactiveComponent } from './test-form-reactive/test-form-reactive.component';


@NgModule({
  declarations: [
    AppComponent,
    TestFormComponent,
    TestFormReactiveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

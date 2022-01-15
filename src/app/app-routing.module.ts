import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { StellenangeboteComponent } from './stellenangebote/stellenangebote.component';
import { BewerberComponent } from './bewerber/bewerber.component';
import { TestFormReactiveComponent } from './test-form-reactive/test-form-reactive.component';
import { TestFormComponent } from './test-form/test-form.component';
import { StammdatenComponent } from './stammdaten/stammdaten.component';

const routes: Routes = [
  /*{path: '' , component: HeaderComponent }, */ // sonst kommen die Menüpunkte doppelr
  {path: 'bewerber' , component: BewerberComponent },
  {path: 'stellenangebote' , component: StellenangeboteComponent },
  {path: 'stammdaten' , component: StammdatenComponent },
  {path: 'react' , component: TestFormReactiveComponent },

  /*
  {path: '0', component: BatchExamplesComponent },
  {path: '1', component: NotificationBadgeComponentComponent},
  */
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

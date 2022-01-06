import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestFormReactiveComponent } from './test-form-reactive/test-form-reactive.component';
import { TestFormComponent } from './test-form/test-form.component';

const routes: Routes = [
  {path: '' , component: TestFormComponent },
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

import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge'
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule} from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
   imports: [
      MatButtonModule,
      MatToolbarModule,
      MatIconModule,
      MatCardModule,
      MatBadgeModule,
      MatTooltipModule,
      MatInputModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatTableModule,
      MatPaginatorModule,
      MatMenuModule,
      MatRadioModule,
      MatListModule,
      MatCheckboxModule
   ],
   exports: [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatRadioModule,
    MatListModule,
    MatCheckboxModule
   ],

   providers: [
    MatDatepickerModule,
    MatNativeDateModule
   ]
})
export class MaterialModule { }

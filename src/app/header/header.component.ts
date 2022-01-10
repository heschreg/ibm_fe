import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
// import { AuthService } from 'src/app/auth/auth.service';
// import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // Wir geben den Event, dass die Sidemap ausgeklappt werden soll, an die Parent-Komponente app-component
  /*
  @Output() sidenavToggle = new EventEmitter<void>();
  isAuth = false;
  authSubscription?: Subscription;
  */

  // Der AuthService wird im provided-Array zhur Verfügung gestellt, damit nur eine Instanz davon existiert
  constructor( /* private authService: AuthService */) { }

  ngOnInit(): void {
    // Hier befindet man sich im Header mit der waagrechten Navigation und fängt den Event ab,
    // dass sich jemand ordnuungsgemäß angemeldet hat ==> nur die Menüpunkte Training und Logout machen in diesem Status Sinn
    /*
    this.authSubscription = this.authService.authChange.subscribe(authStatus => {
      this.isAuth = authStatus;
    });
    */
  }

  /*
  OnTogglesSidenav() {
    // Jetzt wird der Event generiert
    this.sidenavToggle.emit();
  }
  */

  /*
  onLogout() {
    this.authService.logout();
  }
  */

  /*
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
  */


}

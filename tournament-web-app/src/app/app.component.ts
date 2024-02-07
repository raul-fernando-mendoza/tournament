import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../environments/environment';
import {MatMenuModule} from '@angular/material/menu';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    RouterModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tournament-web-app';
  displayName = ""

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private route: ActivatedRoute
    , private authService: AuthService
  ) {

    onAuthStateChanged( auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        this.authService.getDisplayName().then( displayName=>{
          this.displayName = displayName
        })
        // ...
      } else {
        // User is signed out
        // ...
        this.displayName = ""
      }
    })

  }
  login(){
    this.router.navigate(['/loginForm'])
  }
  Register(){
    this.router.navigate(['/registerForm',{"isRegister":true}])
  }  
  home(){
    this.router.navigate(['/'])
  }  
  logout(){
    this.authService.logout()
    this.router.navigate(['/loginForm']);
  }
  isEmailVerified(){
    return this.authService.isEmailVerified()
  }

  isLoggedIn(){
    return this.authService.isloggedIn()
  }  
  onCreateTournament(){
    if( this.authService.isloggedIn() ){
      this.router.navigate(['/tournamentNew'])
    }
    else{
      this.router.navigate(['/loginForm/tournamentNew'])
    }
  }  
}

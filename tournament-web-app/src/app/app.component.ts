import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
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
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { auth } from '../environments/environment';
import {MatMenuModule} from '@angular/material/menu';
import { BusinesslogicService } from './businesslogic.service';
import { PathService } from './path.service';



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
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'tournament-web-app';
  displayName = ""

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  unsubscribe:Unsubscribe | undefined  

  isLoggedIn:boolean = false

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private route: ActivatedRoute
    , private authService: AuthService
    , public bussiness:BusinesslogicService
    , public pathSrv:PathService
  ) {



  }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
  }
 
  ngOnInit(): void {
    this.unsubscribe = onAuthStateChanged( auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        console.log( "App component login: true")
        this.isLoggedIn = true
        const uid = user.uid;
        this.authService.getDisplayName().then( displayName=>{
          this.displayName = displayName
        })
        // ...
      } else {
        console.log( "App component login: false")
        this.isLoggedIn = false
        this.displayName = ""
      }
    })    
    
  }
  
  login(){
    this.router.navigate(["/","loginForm",this.pathSrv.getDecodePath(this.bussiness.home)])
  }
  Register(){
    this.router.navigate(['/registerForm',this.pathSrv.getDecodePath(this.bussiness.home), {"isRegister":true}])
  }  
  home(){
    this.router.navigate(["/"+this.pathSrv.getDecodePath(this.bussiness.home)])
  }  
  logout(){
    this.authService.logout().then( ()=>{
      if(this.pathSrv.getDecodePath(this.bussiness.home).startsWith('tournamentAdmin')){
        this.bussiness.home = '/'
        this.router.navigate(["/"])
      }
      else{
        this.router.navigate([this.pathSrv.getDecodePath(this.bussiness.home)])
      }
    })
  }
  isEmailVerified(){
    return this.authService.isEmailVerified()
  }

  



  
}

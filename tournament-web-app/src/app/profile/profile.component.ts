import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { Observable, map, shareReplay  } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );  
    
  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private authService: AuthService
    , private bussiness:BusinesslogicService    
    ){

  }

    
  onParticipant(){
    this.bussiness.setCurrentProfile("participant")
    this.router.navigate(['/participant'])
  }
  onJuror(){
    this.bussiness.setCurrentProfile("juror")
    if( !this.authService.isloggedIn() ){
      this.router.navigate(['/loginForm/juror'])
    }
    else{
      this.router.navigate(['/juror'])
    }    
  }
  onOrganizer(){
    this.bussiness.setCurrentProfile("organizer")
    if( !this.authService.isloggedIn() ){
      this.router.navigate(['/loginForm/organizer'])
    }
    else{
      this.router.navigate(['/organizer'])
    }
  }


}

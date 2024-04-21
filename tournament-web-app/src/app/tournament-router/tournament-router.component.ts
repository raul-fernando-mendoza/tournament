import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { updateCurrentUser } from 'firebase/auth';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-tournament-router',
  standalone: true,
  imports: [],
  templateUrl: './tournament-router.component.html',
  styleUrl: './tournament-router.component.css'
})
export class TournamentRouterComponent implements OnInit{
  
  tournamentId :string | null= null
  isLoggedIn:[boolean|null] = [null]

  constructor( 
     private activatedRoute: ActivatedRoute
    ,private auth:AuthService
    ,private router: Router ){

    var thiz = this  
    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.tournamentId = null
        if( paramMap.get('tournamentId') )
          thiz.tournamentId = paramMap.get('tournamentId')
          thiz.update()
        }
    })      

  }
  ngOnInit(): void {

  }
  update(){
    this.isLoggedIn.push(this.auth.isloggedIn() )
    if( this.auth.isloggedIn() ){
      this.router.navigate(["/tournamentAdmin/",this.tournamentId])
    }
    else{
      this.router.navigate(["/tournamentGuess/",this.tournamentId])
    }
  }

}

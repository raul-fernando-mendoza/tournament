import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';
import { DateFormatService } from '../date-format.service';
import { FirebaseService } from '../firebase.service';
import { TournamentCollection, TournamentObj } from '../types';

@Component({
  selector: 'app-guess-tournament',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule 
    ,MatDividerModule 
    ,MatListModule    
    ,MatExpansionModule
    ,RouterModule    
    ,MatGridListModule
    ,QuillModule  
    ,MatProgressBarModule    
  ],
  templateUrl: './guess-tournament.component.html',
  styleUrl: './guess-tournament.component.css'
})
export class GuessTournamentComponent implements OnInit{

  tournamentId:string|null = null
  tournament:TournamentObj|null = null

  constructor(
    private activatedRoute: ActivatedRoute
    ,private router:Router
    ,private firebase:FirebaseService 
    ,public dateSrv:DateFormatService  
    ,public business:BusinesslogicService  
  ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe( {
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId )
            thiz.tournamentId = tournamentId
            business.home = "/" + TournamentCollection.collectionName + "/" + tournamentId
            thiz.update()
          }
        })       
  }
  ngOnInit(): void {
    this.business.home = "/" + TournamentCollection.collectionName + "/" + this.tournamentId

  }
  update(){
    if( this.tournamentId != null){
      this.firebase.getDocument( TournamentCollection.collectionName, this.tournamentId).then(data=>{
        this.tournament = data as TournamentObj
      },
      reason=>{
        alert("Error leyendo torneo:" + reason)
      }) 
    }
  }
  onWantToParticipate(){
    let parts = ['tournament',this.tournamentId]
    let url = encodeURIComponent( parts.join("/") )
    this.router.navigate(['/loginForm', url])
  }
}

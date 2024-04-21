import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { InscriptionRequest, InscriptionRequestCollection, PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj } from '../types';
import { FirebaseService,Filter } from '../firebase.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { QuillModule } from 'ngx-quill';
import { PerformanceListComponent } from '../performance-list/performance-list.component';
import { DateFormatService } from '../date-format.service';
import { BusinesslogicService, Profile } from '../businesslogic.service';


interface PerformanceReference{
  id:string
  performance:PerformanceObj
  isInProgram:boolean
}

@Component({
  selector: 'app-participant-tournament',
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
    ,PerformanceListComponent
  ],
  templateUrl: './participant-tournament.component.html',
  styleUrl: './participant-tournament.component.css'
})
export class ParticipantTournamentComponent {

  tournamentId! :string 
  tournament:TournamentObj| null = null
  isParticipant = false  
  isInscriptionInProgress = false
  isLoggedIn = false

  performances:Array<PerformanceReference> = []

  program:Array<PerformanceReference> = []  
  
  currentProfile:Profile = null

  activePanel:string | null = null

  constructor(
    private activatedRoute: ActivatedRoute
    ,private auth:AuthService
    ,private router:Router
    ,private firebase:FirebaseService 
    ,public dateSrv:DateFormatService
    ,public businesslogic:BusinesslogicService ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe( {
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId )
            thiz.tournamentId = tournamentId
            thiz.update()
          }
  
        })       
  }


  ngOnInit(): void {
    this.businesslogic.onProfileChangeEvent().subscribe( profile =>{
      this.currentProfile = profile
    })
    this.currentProfile = this.businesslogic.getProfile()
    this.activePanel = this.businesslogic.getStoredItem("activePanel")

  }


  update(){
    if( this.tournamentId != null){
      this.firebase.getDocument( TournamentCollection.collectionName, this.tournamentId).then( data =>{
        this.tournament = data as TournamentObj

        let email = this.auth.getUserEmail()

        if(this.auth.isloggedIn() ){
          this.isLoggedIn = true
          let email = this.auth.getUserEmail()
          if( this.tournament.participantEmails.find( e=>e==email ) ){
            this.isParticipant = true
          }

        } 

        var t:any = this.tournament.eventDate

        var d = t.toDate()
        
        this.readPerformances()
        this.readProgram()
      })
    }
  }

  onPanelActivated(activePanel:string){
    this.activePanel = activePanel 
    this.businesslogic.setStoredItem("activePanel", activePanel)
  }
    
  readPerformances(){
    this.performances.length = 0
    if( this.isLoggedIn ){
      let userFilter:Filter = {
        field: 'email',
        operator: '==',
        value: this.auth.getUserEmail()
      }
      let filter:Array<Filter> = [userFilter]
      this.firebase.getDocuments( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/"), filter).then( set =>{
        set.map( doc =>{
          let p = doc.data() as PerformanceObj

          let pr:PerformanceReference = {
            id: doc.id,
            performance: p,
            isInProgram: this.isInProgram(doc.id)
          }
          this.performances.push( pr )

        })
        this.performances.sort( (a,b) => a.performance.label > b.performance.label ? 1 : -1)
      })
    }
  }

  readProgram(){
    this.program.length = 0  

    if( this.tournament ){
      this.tournament.program.map( programId =>{
        console.log("reading program:" + programId)
        this.firebase.getDocument( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") , programId).then( (data)=>{
          let performance = data as PerformanceObj
          let pr:PerformanceReference = {
            id: programId,
            performance: performance,
            isInProgram: this.isInProgram(programId)
          }
          this.program.push( pr )
        },
        reason =>{
          alert("ERROR error reading perfomance in program:" + reason)
        })  
      })
    }
  }  
  isInProgram( id:string ):boolean{
    if(  this.tournament!.program.find( e => e == id) ){
      return true
    }
    else{
      return false
    }
  }
    
  onInscribe(){
    if( !this.auth.isloggedIn() ){
      this.router.navigate(['/loginForm', encodeURI("participantTournament/" + this.tournamentId + "/inscribe")])
    }
    else{
      this.router.navigate(["participantTournament",this.tournamentId, "inscribe"])
    }
  }
  addParticipant(email:string){
    if( this.tournament && this.tournament.participantEmails.findIndex( e => e == email) < 0){
      this.tournament.participantEmails.push( email )
      let t:Tournament ={
        participantEmails: this.tournament.participantEmails
      }
      this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, t).then( ()=>{
        this.update()
      },
      reason=>{
        alert("Error saving participant:" + reason)
      })
    }
  }   
  
}



import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute,  Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { PerformanceCollection, PerformanceObj, TournamentCollection, TournamentObj } from '../types';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { QuillModule } from 'ngx-quill';
import { DateFormatService } from '../date-format.service';
import { BusinesslogicService } from '../businesslogic.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FirebaseFullService, Filter } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/auth';

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
    ,MatProgressSpinnerModule
  ],
  templateUrl: './participant-tournament.component.html',
  styleUrl: './participant-tournament.component.css'
})
export class ParticipantTournamentComponent implements OnDestroy{

  tournamentId! :string 
  tournament:TournamentObj| null = null
  isParticipant = false  
  isInscriptionInProgress = false
  isLoggedIn = false

  performances:Array<PerformanceReference> = []

  program:Array<PerformanceReference> = []  
  
  activePanel:string | null = null

  unsubscribe:Unsubscribe | undefined

  constructor(
    private activatedRoute: ActivatedRoute
    ,private auth:AuthService
    ,private router:Router
    ,private firebase:FirebaseFullService 
    ,public dateSrv:DateFormatService
    ,public business:BusinesslogicService ){
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
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }   
  }


  ngOnInit(): void {
    this.activePanel = this.business.getStoredItem("activePanel")
    this.business.home = "/" + TournamentCollection.collectionName + "/" + this.tournamentId
  }


  update(){
    let thiz = this

    if( this.tournamentId != null){
      if( this.unsubscribe ){
        this.unsubscribe()
      }      
      this.unsubscribe = this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId,
        {
          next(doc){
            thiz.tournament = doc.data() as TournamentObj
            thiz.readPerformances()
            thiz.readProgram()
          },
          error(reason){
            alert("Error reading tournament")
          }
        }
      )
    }
  }
    
  readPerformances(){
    this.performances.length = 0
    let userFilter:Filter = {
      field: 'email',
      operator: '==',
      value: this.auth.getUserEmail()
    }
    let filter:Array<Filter> = [userFilter]
    this.firebase.getDocuments( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/"), filter).then( set =>{
      this.performances.length = 0
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
  
  onPerformanceNew(){
    this.router.navigate(["performanceNew"], {relativeTo: this.activatedRoute})
  }
}



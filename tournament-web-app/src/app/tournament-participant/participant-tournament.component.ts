import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute,  Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { PerformanceCollection, PerformanceObj, TournamentCollection, TournamentObj } from '../types';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { DateFormatService } from '../date-format.service';
import { BusinesslogicService } from '../businesslogic.service';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FirebaseFullService, Filter } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/auth';
import { where } from 'firebase/firestore';
import {MatChipsModule} from '@angular/material/chips';
import { BehaviorSubject } from 'rxjs';
import {MatButtonToggleChange, MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

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
    ,MatCardModule
    ,MatListModule   
    ,MatTabsModule 
    ,RouterModule    
    ,MatGridListModule
    ,MatProgressSpinnerModule
    ,MatChipsModule
    ,MatButtonToggleModule
  ],
  templateUrl: './tournament-participant.component.html',
  styleUrl: './tournament-participant.component.css'
})
export class ParticipantTournamentComponent implements OnDestroy{

  tournamentId! :string 
  tournament:TournamentObj| null = null
  isParticipant = false  
  isInscriptionInProgress = false
  isLoggedIn = false

  performanceReferences:Array<PerformanceReference> = []

  program:Array<PerformanceReference> = []  
  
  unsubscribe:Unsubscribe | undefined

  unsubscribePerformances:Unsubscribe | undefined

  isShowDeleted = false

  hasDeletedOrCancel:boolean = false

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
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }    
  }

  logout(){

    let hasActive = false
    for(let i =0 ; i<this.performanceReferences.length; i++){
      if( this.performanceReferences[i].performance.isRejected == false && 
        this.performanceReferences[i].performance.isCanceled == false ){
          hasActive=true
        }
    }
    if( hasActive ){
      alert("Sus solicitudes estan siendo atendidas. Gracias")
      this.auth.logout().then( ()=>{
        this.router.navigate(['/loginForm'])
      })
  
    }
    else{
      alert("Adicione solicitudes")
    }
  }  


  ngOnInit(): void {
    this.business.home = TournamentCollection.collectionName + "/" + this.tournamentId
  }


  update(){
    let thiz = this

    if( this.tournamentId != null){
      if( this.unsubscribe ){
        this.unsubscribe()
      }    
      console.debug("reading tournament")  
      this.unsubscribe = this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId,
        {
          next(doc){
            
            thiz.tournament = doc.data() as TournamentObj
            console.debug("tournamen found:" + thiz.tournament.label)
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
    this.performanceReferences.length = 0
    let filter = where("email","==", this.auth.getUserEmail()) 
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }
    console.debug("reading performances")
    this.unsubscribePerformances = this.firebase.onsnapShotCollection( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/"),{
      'next' : set =>{
        this.performanceReferences.length = 0
        this.hasDeletedOrCancel = false
        set.docs.map( doc =>{
          let p = doc.data() as PerformanceObj
          console.debug("performance found:" + p.label)
          let pr:PerformanceReference = {
            id: doc.id,
            performance: p,
            isInProgram: this.isInProgram(doc.id)
          }
          this.performanceReferences.push( pr )
          if( p.isCanceled || p.isDeleted ){
            this.hasDeletedOrCancel = true
          }

        })
        this.performanceReferences.sort( (a,b) => a.performance.label > b.performance.label ? 1 : -1)
        this.applyFilter()
      }
    }, filter)
  }

  readProgram(){
    this.program.length = 0  

    if( this.tournament ){
      this.tournament.program.map( programId =>{
        console.log("reading program:" + programId)
        this.firebase.getDocument( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") , programId).then( (data)=>{
          let performance = data as PerformanceObj
          console.debug("program read:" + performance.label)
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


  isFilterValid( p:PerformanceObj ){
    let result:boolean = true
    if( this.isShowDeleted==false ){
      if ( p.isDeleted || p.isCanceled ){
        result=false;
      }
    }
    return result
  }

  
  performanceReferencesFiltered$ = new BehaviorSubject(new Array<PerformanceReference>() );

  //set the display filter list
  applyFilter(){
    let performanceReferencesFiltered:Array<PerformanceReference> = []
    performanceReferencesFiltered.length = 0
    this.performanceReferences.map( pr =>{
      if( this.isFilterValid( pr.performance ) ){
        performanceReferencesFiltered.push(pr)
      }
    })
    this.performanceReferencesFiltered$.next(performanceReferencesFiltered)
  }

  onShowDeleted(e:MatButtonToggleChange){
    this.isShowDeleted = e.source.checked
    this.applyFilter()
  }

  

 
}



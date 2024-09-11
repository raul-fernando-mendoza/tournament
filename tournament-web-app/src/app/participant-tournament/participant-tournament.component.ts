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
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FirebaseFullService, Filter } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/auth';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { where } from 'firebase/firestore';
import {MatChipsModule} from '@angular/material/chips';

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
    ,MatCheckboxModule
    ,FormsModule
    ,MatGridListModule
    ,MatChipsModule
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
    for(let i =0 ; i<this.performances.length; i++){
      if( this.performances[i].performance.isRejected == false && 
        this.performances[i].performance.isCanceled == false ){
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
      alert("Por favor adicione solicitudes")
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
    this.performances.length = 0
    let filter = where("email","==", this.auth.getUserEmail()) 
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }
    console.debug("reading performances")
    this.unsubscribePerformances = this.firebase.onsnapShotCollection( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/"),{
      'next' : set =>{
        this.performances.length = 0
        this.hasDeletedOrCancel = false
        set.docs.map( doc =>{
          let p = doc.data() as PerformanceObj
          console.debug("performance found:" + p.label)
          let pr:PerformanceReference = {
            id: doc.id,
            performance: p,
            isInProgram: this.isInProgram(doc.id)
          }
          this.performances.push( pr )
          if( p.isCanceled || p.isDeleted ){
            this.hasDeletedOrCancel = true
          }

        })
        this.performances.sort( (a,b) => a.performance.label > b.performance.label ? 1 : -1)
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

 
}



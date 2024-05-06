import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Unsubscribe } from 'firebase/firestore';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import { FirebaseFullService, Filter } from '../firebasefull.service';
import { PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj } from '../types';

interface ProgramRef{
  id:string
  performance:PerformanceObj
  medal:string
}

@Component({
  selector: 'app-welcome-juror',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,RouterModule
    ,MatGridListModule
    ,EvaluationgradeListComponent
    ,MatExpansionModule    
  ],
  templateUrl: './welcome-juror.component.html',
  styleUrl: './welcome-juror.component.css'
})
export class WelcomeJurorComponent implements OnInit{



  tournamentId! :string 
  tournament:TournamentObj| null = null

  unsubscribe:Unsubscribe | undefined = undefined
  unsubscribePerformances:Unsubscribe | undefined = undefined

  programRefs:Array<ProgramRef> = []  
  
  constructor(
    private auth:AuthService,
    private firebase:FirebaseFullService,
    private router:Router,
    private activatedRoute: ActivatedRoute,
    private business:BusinesslogicService

  ){
    var thiz = this

    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
       
        if( paramMap.get('tournamentId') )
          thiz.tournamentId = paramMap.get('tournamentId')!
          thiz.update()
        }

      })     
  }

  ngOnInit(): void {
    //get all the tournaments where I am a juror
    this.update()    
  }

  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }    
  }

  update(){
    this.unsubscribe = this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId, {
      'next': (doc) =>{
        this.tournament = doc.data() as TournamentObj
        this.readPerformances()
      },
      'error':(reason)=>{
        alert("ERROR reading tournament:" +  reason)
      },
      'complete':() =>{
        console.log("reading program as ended")
      }        
    })
  }

  readPerformances(){
     
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }  

    let filter:Array<Filter> = []

    let email:string | null = this.auth.getUserEmail()
    if( email ){
      let filter:Filter[] = [{
        field:"jurors",
        operator:"==",
        value:email
      }]
        
      this.unsubscribePerformances = this.firebase.onsnapShotCollection(
        [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") 
        ,{
          'next': (set)=>{
            this.programRefs.length = 0
            set.docs.map( doc =>{
              let performance = doc.data() as PerformanceObj
              //check if the performance is in the program
              let idx = this.tournament!.program.findIndex( e => e == doc.id )
              if( idx >= 0 ){
                let pr:ProgramRef = {
                  id: doc.id,
                  performance: performance,
                  medal: this.business.getMedalForPerformance(this.tournament!, performance.grade),
                }
                this.programRefs[idx] = pr 
              }
            })
        }  
      })
    }
  }


}

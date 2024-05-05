import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, Input, OnDestroy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { Unsubscribe } from "firebase/firestore";
import { BusinesslogicService } from "../businesslogic.service";
import { FirebaseFullService } from "../firebasefull.service";
import { PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj } from "../types";


interface ProgramRef{
  id:string
  performance:PerformanceObj
  medal:string
}


@Component({
    selector: 'app-tournament-edit-podium',
    standalone: true,
    imports: [
     CommonModule
    ,MatButtonModule
    ,MatIconModule
    ,MatGridListModule
    ,RouterModule],
    templateUrl: './tournament-edit-podium.component.html',
    styleUrl: './tournament-edit-podium.component.css'
  })
  export class TournamentEditPodiumComponent implements OnDestroy, AfterViewInit {
    @Input() tournamentId!:string
    @Input() tournament!:TournamentObj

    unsubscribe:Unsubscribe | undefined = undefined

    programRefs:Array<ProgramRef> = []

    constructor(private firebase:FirebaseFullService
      ,private bussiness:BusinesslogicService ){
      
    }

    ngAfterViewInit(): void {
      this.readPerformances()
        
    }
    ngOnDestroy(): void {
      if( this.unsubscribe ){
        this.unsubscribe()
      }
    }
    
    readPerformances(){
      
      this.unsubscribe = this.firebase.onsnapShotCollection(
        [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") 
        ,{
          'next': (set)=>{
            this.programRefs.length = 0
            set.docs.map( doc =>{
              let performance = doc.data() as PerformanceObj
              //check if the performance is in the program
              let idx = this.tournament!.program.findIndex( e => e == doc.id )
              if( performance.isReleased && idx >= 0 ){
                let pending:ProgramRef={
                  id: doc.id,
                  performance: performance,
                  medal: this.bussiness.getMedalForPerformance(this.tournament, performance.grade)
                }
                this.programRefs.push(pending)
              }
            })
            this.programRefs.sort( (a,b) => a.performance.grade > b.performance.grade ? -1 : 1)
        }  
      })
    }    
    
 
    
  }
import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Medal, Performance, PerformanceObj, TournamentObj } from './types';
import { AuthService } from './auth.service';
import { MedalsListComponent } from './medals-list/medals-list.component';

@Injectable({
  providedIn: 'root'
})
export class BusinesslogicService {

  constructor(private firebaseService:FirebaseService
    ,private authService:AuthService) { }

  getIsAdmin(parentCollection:string):Promise<boolean>{
    let splitted = parentCollection.split("/")
    let mainCollection=splitted[0]
    let mainId=splitted[1]    
    return new Promise<boolean>((resolve, reject)=>{
      this.firebaseService.getDocument(mainCollection, mainId).then( data=>{
        var tournament = data as TournamentObj
        if( tournament.creatorUid == this.authService.getUserUid() ){
          resolve(true)
        }
        else{
          resolve(false)
        }
      })    
    })
  }  
  getMedal( tournament:TournamentObj, performance:PerformanceObj):Medal | null{
    tournament.medals.sort( (a,b)=>a.minGrade > b.minGrade ? -1 : 1)
    for(let i=0; i<tournament.medals.length; i++){
      if( performance.grade >= tournament.medals[i].minGrade){
        return tournament.medals[i]
      }
    }
    return null
  }
}

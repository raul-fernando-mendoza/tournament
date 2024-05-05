import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { TournamentObj} from './types';


@Injectable({
  providedIn: 'root'
})
export class BusinesslogicService {
  constructor(private firebaseService:FirebaseService
    ,private authService:AuthService) { 

  }

  setStoredItem(id:string, value:string){
    if (typeof window !== 'undefined') {
      localStorage.setItem(id, value ) 
    }
  }  
  getStoredItem( id:string):string | null{
    let valueStr:string | null = null
    try {
      if (typeof window !== 'undefined') {
        valueStr = localStorage.getItem(id)
      }
    }
    catch( e ){
      console.log("error reading value from disk:" + id + " " + e)
    }
    return valueStr 
  } 



  isSetupCompleted(tournament:TournamentObj):boolean {
    let isSetupCompleted:boolean = false
    if( tournament.categories.length > 0 &&
      tournament.evaluations.length > 0 &&
      tournament.jurors.length > 0 &&
      tournament.medals.length > 0 )
    {
      isSetupCompleted = true
    }
    return isSetupCompleted
  }

  getMedalForPerformance(tournament:TournamentObj, grade:number):string{
    for( let i = 0; i < tournament.medals.length; i++){
      if( grade >= tournament.medals[i].minGrade ){
        return tournament.medals[i].label
      }
    }
    return ""
  }    

}

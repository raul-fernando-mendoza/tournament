import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { TournamentObj} from './types';


@Injectable({
  providedIn: 'root'
})
export class BusinesslogicService {

  public home:string = "/"

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
      tournament.medals.length > 0 )
    {
      tournament.evaluations.map( e =>{
        if(e.aspects.length > 0){
          isSetupCompleted = true
        }
      })      
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
  
  getMinGrades(){
    let minGrades = []
    for( let g=10.0; g>=6.0;g=g-0.1){
      minGrades.push( Number(g.toFixed(1)) )
    }
    return minGrades
  }

  camelCase(str:string){
    let strSpanish = str.toLowerCase()
                      .replaceAll("á","a")
                      .replaceAll("é","e")
                      .replaceAll("í","i")
                      .replaceAll("ó","o")
                      .replaceAll("ú","u")
                      .replace(/\baños\b/g," years ")
                      .replace(/\baño\b/g," year ")
                      .replaceAll("ñ","nn")

    let endStr = strSpanish.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
                    .reduce((result, word) => result + this.capitalize(word.toLowerCase()))
   
    return endStr
  }
  
  capitalize(str:string){
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)
  }
  

}

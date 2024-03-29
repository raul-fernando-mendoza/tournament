import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { Performance, EvaluationGradeCollection, EvaluationGradeObj, Filter, PerformanceCollection, PerformanceObj, Tournament , TournamentCollection, TournamentObj, Juror} from '../types'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatNativeDateModule} from '@angular/material/core';
import { Timestamp } from "firebase/firestore/lite"
import { AuthService } from '../auth.service';
import { v4 as uuidv4 } from 'uuid';
import { NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { PathService } from '../path.service';
import { BusinesslogicService, Profile } from '../businesslogic.service';
import { MatGridListModule} from '@angular/material/grid-list';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import { ImageLoaderComponent } from '../image-loader/image-loader.component';
import {  ref , getDownloadURL} from "firebase/storage";
import { storage } from '../../environments/environment';
import { QuillModule } from 'ngx-quill'
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';

interface PerformanceReference{
  id:string
  performance:PerformanceObj
  isInProgram:boolean
}


@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule
  ,MatIconModule
  ,MatButtonModule    
  ,FormsModule
  ,ReactiveFormsModule
  ,MatFormFieldModule
  ,MatInputModule
  ,MatCardModule
  ,RouterModule
  ,MatDatepickerModule
  ,MatNativeDateModule
  ,NgxMaterialTimepickerModule
  ,MatGridListModule
  ,EvaluationgradeListComponent
  ,MatDividerModule
  ,MatMenuModule
  ,ImageLoaderComponent
  ,QuillModule
  ,MatExpansionModule
  ,MatListModule
  ],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent implements OnInit{

  tournamentId :string | null= null
  tournament:TournamentObj| null = null
  submitting = false
  isAdmin = false
  isLoggedIn = false

  jurorList:Array<Juror> = []

  performanceColor = 'lightblue'


  form = this.fb.group({
    label:['',Validators.required],
    eventDate:[new Date(),Validators.required],
    eventTime:[""],
    imageUrl:[""],
    imagePath:[""]
  })

  collection = TournamentCollection.collectionName

  performances:Array<PerformanceReference> = []

  program:Array<PerformanceReference> = []  

  isJuror = false

  currentProfile:Profile = null

  isParticipant = false

  constructor(
     private activatedRoute: ActivatedRoute
    ,public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,public authService:AuthService
    ,private router: Router
    ,public pathService:PathService
    ,public businesslogic:BusinesslogicService){

    var thiz = this
    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.tournamentId = null
        if( paramMap.get('id') )
          thiz.tournamentId = paramMap.get('id')
          thiz.update()
        }

      })      

  }

  ngOnInit(): void {
    this.businesslogic.onProfileChangeEvent().subscribe( profile =>{
      this.currentProfile = profile
    })
    this.currentProfile = this.businesslogic.getProfile()
  }

  update(){
    if( this.tournamentId != null){
      this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( data =>{
        this.tournament = data as TournamentObj

        let email = this.authService.getUserEmail()

        

        this.tournament.jurors.forEach( j =>{
          if( j.email == email  ){
            this.isJuror = true
          }
        })

        if(this.authService.isloggedIn() ){
          let uid = this.authService.getUserEmail()
          if( this.tournament.participants.findIndex( e=>e==uid ) >= 0 ){
            this.isParticipant = true
          }
        } 

        
    
        this.form.controls.label.setValue( this.tournament.label )
        var t:any = this.tournament.eventDate

        var d = t.toDate()
        
        this.form.controls.eventDate.setValue( d )
        if(  this.tournament.eventTime ){
          this.form.controls.eventTime.setValue( this.tournament.eventTime )
        }
        if( this.tournament.imageUrl ){
          this.form.controls.imageUrl.setValue( this.tournament.imageUrl )
        }

        if( this.authService.getUserUid()!= null && this.tournament?.creatorUid != null ){
          this.isAdmin = (this.authService.getUserUid() == this.tournament?.creatorUid) 
        } 
        if( this.authService.getUserUid()!= null){
          this.isLoggedIn = true
        }
        
        this.readPerformances()
        this.readProgram()
      })
    }
  }

  onSubmit(){
    if( !this.tournamentId ){
      let id = uuidv4();
      let d:Date = this.form.controls.eventDate.value!

      
      let t:Timestamp = new Timestamp(d.getTime()/1000, 0)

      var label = this.form.controls.label.value!
      var tags:Array<string> =  []
      const matches = label.match(/(\b[^\s]+\b)/g);
      if( matches ){
        
        matches.forEach((e) => {
          tags.push(e)
        })
      }

      let tournament :TournamentObj = {
        label: label,
        eventDate: t,
        eventTime: this.form.controls.eventTime.value!,
        imageUrl: this.form.controls.imageUrl.value,
        imagePath: this.form.controls.imagePath.value,
        active: true,
        creatorUid: this.authService.getUserUid()!,
        tags: tags,
        program: [],
        categories: [],
        medals: [],
        evaluations: [],
        jurors: [],
        jurorEmails:[],
        participants: []
      }

      this.firebaseService.setDocument( this.collection, id, tournament).then( ()=>{
        this.router.navigate(['/' + TournamentCollection.collectionName + "/" + id]);
      },
      reason =>{
        alert("Error guardando documento:" + reason)
      })
    }
  }


   

  onNameChange( $event:any ){


    var label = this.form.controls.label.value!
    if( this.tournamentId && label ){
        
      const matches = label.match(/(\b[^\s]+\b)/g);
      if( matches ){
        var tags:Array<string> =  []
        matches.forEach((e) => {
          tags.push(e)
        });
        var obj:Tournament ={
          label: this.form.controls.label.value!,
          tags: tags
        }
        this.firebaseService.updateDocument(TournamentCollection.collectionName, this.tournamentId, obj).then(data=>{
          console.log("update name")
        },
        reason =>{
          alert("Error onNameChange:" + reason)
        })        
      }

    }
    
  }
  onChange($event:any, id:string | null,attr:string){
    if( id ){
      this.firebaseService.onChange($event,this.collection,id,attr).then( ()=>{
        this.update()
      },
      reason=>{
        alert("ERROR onChange:" + reason)
      })
    }
  }
  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.tournament!.label) ){
      return
    }        
    this.firebaseService.deleteDocument( this.collection , this.tournamentId! ).then( ()=>{
      console.log( "category removed")
      this.router.navigate([""])
    },
    reason=>{
      alert("Error onDelte:" + reason)
    })
  }
  getFilter():Array<Filter>{
    let filter:Filter = {
      field: 'email',
      operator: '==',
      value: this.authService.getUserEmail()
    }
    return [filter]
  }

  onAccept( id:string ){
    this.firebaseService.unionArrayElementDoc( this.collection + "/" + this.tournamentId, "program", id).then( ()=>{
      console.log("update programa")
      this.update()
    },
    reason =>{
      alert("Error updating programa:" + reason)
    })
  }
  onReject( id:string ){
    this.firebaseService.removeArrayElementDoc( this.collection + "/" + this.tournamentId, "program", id).then( ()=>{
      console.log("update programa")
      this.update()
    },
    reason =>{
      alert("Error updating programa:" + reason)
    }) 
  }  
  onProgramUp(linkId:string){
    if( this.tournament ){
      let idx = this.tournament.program.findIndex( e=>e == linkId )
      if( idx > 0){
        this.tournament.program.splice(idx, 1);
        this.tournament.program.splice(idx-1, 0, linkId); 
        let obj:Tournament ={
          program:this.tournament.program
        }
        this.firebaseService.updateDocument( this.collection, this.tournamentId, obj).then( ()=>{
          this.update()
        },
        reason =>{
          alert("ERROR moviendo programa arriba:" + reason)
        })  
      } 
    }
  }
  onProgramDown(linkId:string){
    if( this.tournament ){
      let idx = this.tournament.program.findIndex( e=>e == linkId )
      if( idx < (this.tournament.program.length - 1) ){
        this.tournament.program.splice(idx, 1);
        this.tournament.program.splice(idx+1, 0, linkId); 
        let obj:Tournament ={
          program:this.tournament.program
        }
        this.firebaseService.updateDocument( this.collection, this.tournamentId, obj).then( ()=>{
          this.update()
        },
        reason =>{
          alert("ERROR moviendo programa arriba:" + reason)
        }) 
      }  
    }
  }
  
  onPerformanceReleaseGrade(performanceId:string){
    let obj:Performance = {
      isReleased:true
    }
    this.firebaseService.updateDocument( [TournamentCollection.collectionName, this.tournamentId
      ,PerformanceCollection.collectionName].join("/"), performanceId, obj).then( ()=>{
        this.update()
    },
    reason=>{
      alert("ERROR: liberando calificacion de performance"+ reason )
    })

  }
  formatTimestamp(t:any):string{
    
    let d:Date = new Date(t.seconds)
    return this.formatDate(d)
  }
  formatDate(d:Date):string {
    var 
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return [year, month, day].join('-');
  } 
  onPerformancesEdit(){
    let parts = ['tournament',this.tournamentId,'performances']
    let url = encodeURIComponent( parts.join("/") )
    if( this.authService.isloggedIn() ){
      this.router.navigate(parts)
    }
    else{
      this.router.navigate(['/loginForm', url])
    }
  } 

  getBasePath():string{
    return this.tournamentId!

  }
  fileLoaded(fullpath:string){
    console.log("files has been loaded")
    var storageRef = ref(storage, fullpath )
    getDownloadURL(storageRef).then((downloadURL) => {
      if( this.tournament ){
        this.tournament.imageUrl = downloadURL 
        this.tournament.imagePath = fullpath  
        let obj:Tournament = {
          imageUrl:this.tournament.imageUrl,
          imagePath:this.tournament.imagePath
        }
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log( "imagen Updated" )
        },
        reason=>{
          alert("ERROR: guardando la imagen:" + reason)
        })    

        
      }
      else{
        this.form.controls.imageUrl.setValue(fullpath)
      }      
    })


  }  
  fileDeleted(fullpath:string){
    console.log("files has been deleted")
    if( this.tournament ){
      this.tournament.imageUrl = ""
      this.tournament.imagePath = ""
      let obj:Tournament = {
        imageUrl:this.tournament.imageUrl,
        imagePath:this.tournament.imagePath
      }
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log( "imagen deleted" )
      },
      reason=>{
        alert("ERROR: guardando la imagen:" + reason)
      })          
    }
    else{
      this.form.controls.imageUrl.setValue("")
    }        
  }  

  readPerformances(){
    this.performances.length = 0
    if( this.isLoggedIn ){
      let filter:Array<Filter> = []
      if( !this.isAdmin ){
        let userFilter:Filter = {
          field: 'email',
          operator: '==',
          value: this.authService.getUserEmail()
        }
        filter.push( userFilter )
      }
      this.firebaseService.getDocuments( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/"), filter).then( set =>{
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
        this.firebaseService.getDocument( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") , programId).then( (data)=>{
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
    let idx = this.tournament!.program.findIndex( e => e == id)
    if( idx >= 0){
      return true
    }
    else{
      return false
    }
  }
  
  onInscribe(){
    if( !this.authService.isloggedIn() ){
      this.router.navigate(['/loginForm', encodeURI("tournament/" + this.tournamentId)])
    }
    else{
      this.addParticipant( this.authService.getUserEmail()! )
    }
  }
  addParticipant(email:string){
    if( this.tournament && this.tournament.participants.findIndex( e => e == email) < 0){
      this.tournament.participants.push( email )
      let t:Tournament ={
        participants: this.tournament.participants
      }
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, t).then( ()=>{
        this.update()
      },
      reason=>{
        alert("Error saving participant:" + reason)
      })
    }
  } 
   

}

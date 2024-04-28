import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule , Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Filter } from '../firebase.service';
import { Performance,  PerformanceCollection, PerformanceObj, Tournament , TournamentCollection, TournamentObj, Juror, InscriptionRequest, InscriptionRequestCollection} from '../types'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatNativeDateModule} from '@angular/material/core';
import { AuthService } from '../auth.service';
import { v4 as uuidv4 } from 'uuid';
import { NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { PathService } from '../path.service';
import { BusinesslogicService, Profile } from '../businesslogic.service';
import { MatGridListModule} from '@angular/material/grid-list';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import { FileLoaded, ImageLoaderComponent } from '../image-loader/image-loader.component';
import { QuillModule } from 'ngx-quill'
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import { FirebaseFullService } from '../firebasefull.service';
import { DocumentData, QuerySnapshot } from '@firebase/firestore';
import { DocumentSnapshot, FirestoreError, Unsubscribe } from 'firebase/firestore';
import { DateFormatService } from '../date-format.service';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { urlbase } from '../../environments/environment';

interface PerformanceReference{
  id:string
  performance:PerformanceObj
  isInProgram:boolean
}


interface InscriptionRequestLink{
  id:string
  inscriptionRequest:InscriptionRequest
  isAccepted:boolean
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [
   CommonModule
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
  ,MatTabsModule
  ,MatProgressSpinnerModule
  ],
  templateUrl: './admin-tournament.component.html',
  styleUrl: './admin-tournament.component.css'
})
export class AdminTournamentComponent implements OnInit, OnDestroy{

  tournamentId :string | null= null
  tournament:TournamentObj| null = null
  submitting = false
  isAdmin = false
  isLoggedIn = false

  performanceColor = 'lightblue'

  

  form = this.fb.group({
    label:['',Validators.required],
    eventDate:[new Date(),Validators.required],
    eventTime:[""],
    imageUrl:[""],
    imagePath:[""]
  })



  performances:Array<PerformanceReference> = []

  program:Array<PerformanceReference> = []  

  currentProfile:Profile = null

  isParticipant = false

  inscriptionRequestLinks:Array<InscriptionRequestLink> = []

  unsubscribe:Unsubscribe | undefined = undefined

  activePanel:string | null = null

  hasPendingRequests = false

  pendingRequests:Array<PerformanceReference> = []

  @ViewChild("tournamentTab", { static: false }) demo3Tab!: MatTabGroup;

  route:string = ""
  constructor(
     private activatedRoute: ActivatedRoute
    ,public firebase:FirebaseFullService 
    ,private fb:FormBuilder
    ,public auth:AuthService
    ,private router: Router
    ,public pathService:PathService
    ,public businesslogic:BusinesslogicService
    ,public dateSrv:DateFormatService
    ,location: Location){

    var thiz = this
    router.events.subscribe((val) => {
      if(location.path() != ''){
        this.route = location.path();
      } else {
        this.route = 'Home'
      }
    });

    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.tournamentId = null
        if( paramMap.get('tournamentId') )
          thiz.tournamentId = paramMap.get('tournamentId')
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
    this.businesslogic.onProfileChangeEvent().subscribe( profile =>{
      this.currentProfile = profile
    })
    this.currentProfile = this.businesslogic.getProfile()
    this.activePanel = this.businesslogic.getStoredItem("activePanel")

  }

  update(){
    if( this.unsubscribe ){
      this.unsubscribe()
    }    
    let email = this.auth.getUserEmail()
    if( this.tournamentId != null){
      this.unsubscribe = this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId, {
        'next': (doc:DocumentSnapshot<DocumentData, DocumentData>) =>{
          this.tournament = doc.data() as TournamentObj

          if(this.auth.isloggedIn() ){
            if( this.tournament.participantEmails.findIndex( e=>e==email ) >= 0 ){
              this.isParticipant = true
            }
          } 
  
          this.form.controls.label.setValue( this.tournament.label )

          let eventDate = this.dateSrv.getDate( this.tournament.eventDate )
  
          this.form.controls.eventDate.setValue( eventDate )
          if(  this.tournament.eventTime ){
            this.form.controls.eventTime.setValue( this.tournament.eventTime )
          }
          if( this.tournament.imageUrl ){
            this.form.controls.imageUrl.setValue( this.tournament.imageUrl )
          }
  
          if( this.auth.getUserUid()!= null && this.tournament?.creatorUid != null ){
            this.isAdmin = (this.auth.getUserUid() == this.tournament?.creatorUid) 
          } 
          if( this.auth.getUserUid()!= null){
            this.isLoggedIn = true
          }
          
          this.readPerformances()
          this.readProgram()
          this.loadInscriptionRequests()
        },
        'error':(reason: FirestoreError)=>{
          alert("ERROR reading tournament:" +  reason)
        },
        'complete':() =>{
          console.log("reading program as ended")
        }        
      })
    }
  }

  onSubmit(){
    if( !this.tournamentId ){
      let id = uuidv4();
      let d:Date = this.form.controls.eventDate.value!

      
      let eventDate:number = this.dateSrv.getDayId(d)

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
        eventDate: eventDate,
        eventTime: this.form.controls.eventTime.value!,
        imageUrl: this.form.controls.imageUrl.value,
        imagePath: this.form.controls.imagePath.value,
        active: true,
        creatorUid: this.auth.getUserUid()!,
        tags: tags,
        program: [],
        isProgramReleased: false,
        categories: [],
        medals: [],
        evaluations: [],
        jurors: [],
        jurorEmails: [],
        participantEmails: [],
        
      }

      this.firebase.setDocument( TournamentCollection.collectionName, id, tournament).then( ()=>{
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
        this.firebase.updateDocument(TournamentCollection.collectionName, this.tournamentId, obj).then(data=>{
          console.log("update name")
        },
        reason =>{
          alert("Error onNameChange:" + reason)
        })        
      }

    }
    
  }
  onChange($event:any, id:string | null,attr:string){

  }
  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.tournament!.label) ){
      return
    }        
    this.firebase.deleteDocument( TournamentCollection.collectionName , this.tournamentId! ).then( ()=>{
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
      value: this.auth.getUserEmail()
    }
    return [filter]
  }

  onAccept( id:string ){
    this.firebase.unionArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId, "program", id).then( ()=>{
      console.log("update programa")
    },
    reason =>{
      alert("Error updating programa:" + reason)
    })
  }
  onReject( id:string ){
    this.firebase.removeArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId, "program", id).then( ()=>{
      console.log("update programa")
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
        this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("update program up")
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
        this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("update program down")
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
    this.firebase.updateDocument( [TournamentCollection.collectionName, this.tournamentId
      ,PerformanceCollection.collectionName].join("/"), performanceId, obj).then( ()=>{
        console.log("on performance release")
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
    if( this.auth.isloggedIn() ){
      this.router.navigate(parts)
    }
    else{
      this.router.navigate(['/loginForm', url])
    }
  } 

  getBasePath():string{
    return this.tournamentId!

  }
  
  fileLoaded(fileLoaded:FileLoaded){
    console.log("files has been loaded")
    if( this.tournament ){
      this.tournament.imageUrl = fileLoaded.url 
      this.tournament.imagePath = fileLoaded.fullpath
      let obj:Tournament = {
        imageUrl:this.tournament.imageUrl,
        imagePath:this.tournament.imagePath
      }
      this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log( "imagen Updated" )
      },
      reason=>{
        alert("ERROR: guardando la imagen:" + reason)
      })    
    }
  }  
  fileDeleted(fullpath:string){
    console.log("files has been deleted")
    if( this.tournament ){
      this.tournament.imageUrl = null
      this.tournament.imagePath = null
      let obj:Tournament = {
        imageUrl:this.tournament.imageUrl,
        imagePath:this.tournament.imagePath
      }
      this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
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
        this.pendingRequests.length = 0
        this.hasPendingRequests = false
        if( this.performances.length > 0 ){
          for( let i=0; i<this.performances.length; i++){
            let p = this.performances[i]
            if( p.performance.isCanceled == false && !p.isInProgram ){
              this.pendingRequests.push( p )
            }
          }
          this.hasPendingRequests = this.pendingRequests.length > 0
          this.demo3Tab.selectedIndex = 0
        }
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
    let idx = this.tournament!.program.findIndex( e => e == id)
    if( idx >= 0){
      return true
    }
    else{
      return false
    }
  }
  
  loadInscriptionRequests(){
    this.firebase.getDocuments([TournamentCollection.collectionName, this.tournamentId, InscriptionRequestCollection.collectionName].join("/")).then( set =>{
      this.inscriptionRequestLinks.length = 0
      set.map( doc => {
        let inscriptionRequest:InscriptionRequest = doc.data() as InscriptionRequest
        
        if( !this.tournament!.participantEmails.find( e=>e == inscriptionRequest.email )){
          var accepted = false
        }
        else{
          var accepted = true
        }
        let inscriptionRequestLink:InscriptionRequestLink = {
          id: doc.id,
          inscriptionRequest: inscriptionRequest,
          isAccepted: accepted
        }

        this.inscriptionRequestLinks.push( inscriptionRequestLink )
      })

    },
    reason =>{
      alert("ERROR:inscripciones no pueden ser leidas:" + reason)
    })    
  }
  onAcceptInscriptionRequest(e:InscriptionRequestLink){
    let inscription:InscriptionRequest = e.inscriptionRequest
    if( !this.tournament!.participantEmails.find( e => e == inscription.email)){
      this.tournament!.participantEmails.push( inscription.email )
      let obj:Tournament = {
        participantEmails:this.tournament!.participantEmails
      }
      this.firebase.updateDocument(TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("accept inscription")
      },
      reason =>{
        alert("ERROR: aceptando inscripciones" + reason )
      })
    }  
  } 

  onRejectInscriptionRequest(e:InscriptionRequestLink){
    let idx = this.tournament!.participantEmails.findIndex( p => p == e.inscriptionRequest.email)
    if( idx >=0 ){
      this.tournament!.participantEmails.splice( idx, 1)
      let obj:Tournament = {
        participantEmails:this.tournament!.participantEmails
      }
      this.firebase.updateDocument(TournamentCollection.collectionName, this.tournamentId, obj).then( () =>{
        console.log("reject inscription")
      },
      reason =>{
        alert("Error:Error removing inscription")
      })
    }
  }
  onPanelActivated(activePanel:string){
    this.activePanel = activePanel 
    this.businesslogic.setStoredItem("activePanel", activePanel)
  }

  getTournamentPath():string{
 
        return urlbase + '/tournament/' + this.tournamentId;

  }  
}

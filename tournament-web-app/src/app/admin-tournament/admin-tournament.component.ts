import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule , Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Filter } from '../firebase.service';
import { Performance,  PerformanceCollection, PerformanceObj, Tournament , TournamentCollection, TournamentObj, Juror, InscriptionRequest, InscriptionRequestCollection, PerformanceReference, JurorCollection, JurorObj} from '../types'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatNativeDateModule} from '@angular/material/core';
import { AuthService } from '../auth.service';
import { NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { PathService } from '../path.service';
import { BusinesslogicService } from '../businesslogic.service';
import { MatGridListModule} from '@angular/material/grid-list';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import { FileLoaded, ImageLoaderComponent } from '../image-loader/image-loader.component';
import { QuillModule } from 'ngx-quill'
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import { FirebaseFullService } from '../firebasefull.service';
import { DocumentData } from '@firebase/firestore';
import { DocumentSnapshot, FirestoreError, Unsubscribe } from 'firebase/firestore';
import { DateFormatService } from '../date-format.service';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { urlbase } from '../../environments/environment';
import { TournamentEditPodiumComponent } from '../podium/tournament-edit-podium.component';
import { ProgramListComponent } from '../program-list/program-list.component';

interface ProgramRef{
  id:string
  performance:PerformanceObj
  noEvaluationsFound:boolean
  newGradeAvailable:boolean
  medal:string
}

interface JurorRef{
  id:string
  juror:JurorObj
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
  ,TournamentEditPodiumComponent
  ,ProgramListComponent
  ],
  templateUrl: './admin-tournament.component.html',
  styleUrl: './admin-tournament.component.css'
})
export class AdminTournamentComponent implements OnInit, OnDestroy, AfterViewInit{

  tournamentId! :string 
  tournament:TournamentObj| null = null
  submitting = false
  isAdmin = false
  isLoggedIn = false

  performanceColor = 'lightblue'
  form = this.fb.group({
    label:['',Validators.required],
    eventDate:[new Date(),Validators.required],
    eventTime:[""],
    place:[""],
    imageUrl:[""],
    imagePath:[""]
  })
  pendingRefs:Array<PerformanceReference> = []  

  jurors:Array<JurorRef> = []

  unsubscribe:Unsubscribe | undefined = undefined
  unsubscribePerformances:Unsubscribe | undefined = undefined


  activePanel:string | null = null



  @ViewChild("tournamentTab", {static: true}) demo3Tab!: MatTabGroup;

  constructor(
     private activatedRoute: ActivatedRoute
    ,private firebase:FirebaseFullService 
    ,private fb:FormBuilder
    ,private auth:AuthService
    ,private router: Router
    ,private pathService:PathService
    ,private business:BusinesslogicService
    ,private dateSrv:DateFormatService
    ,private location: Location){

    var thiz = this

    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
       
        if( paramMap.get('tournamentId') )
          thiz.tournamentId = paramMap.get('tournamentId')!
          thiz.update()
        }

      })      

  }
  ngAfterViewInit(): void {
    //this.demo3Tab.selectedIndex = 0    
  }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }    
  }

  ngOnInit(): void {
    this.activePanel = this.business.getStoredItem("activePanel")
  }

  update(){
    this.unsubscribe = this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId, {
      'next': (doc:DocumentSnapshot<DocumentData, DocumentData>) =>{
        this.tournament = doc.data() as TournamentObj
        this.form.controls.label.setValue( this.tournament.label )

        let eventDate = this.dateSrv.getDate( this.tournament.eventDate )

        this.form.controls.eventDate.setValue( eventDate )
        if(  this.tournament.eventTime ){
          this.form.controls.eventTime.setValue( this.tournament.eventTime )
        }
        if(  this.tournament.place ){
          this.form.controls.place.setValue( this.tournament.place )
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
        this.loadJurors()
        this.readPerformances()
        
        
      },
      'error':(reason: FirestoreError)=>{
        alert("ERROR reading tournament:" +  reason)
      },
      'complete':() =>{
        console.log("reading program as ended")
      }        
    })
  }
  loadJurors(){
    if( this.tournamentId != null){
      this.firebase.onsnapShotCollection( [TournamentCollection.collectionName, this.tournamentId,
      JurorCollection.collectionName ].join("/"), {
        'next': (set) =>{
            this.jurors.length = 0
            set.docs.forEach( doc =>{
              let juror = doc.data() as JurorObj
              let jurorRef:JurorRef={
                id: doc.id,
                juror: juror
              }
              this.jurors.push( jurorRef )
            })
            this.jurors.sort( (a,b) => a.juror.label > b.juror.label ? 1:-1)
        } 
      })
    }
  }


  readPerformances(){
    let filter:Array<Filter> = []
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }  
    this.unsubscribePerformances = this.firebase.onsnapShotCollection(
      [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") 
      ,{
        'next': (set)=>{
          this.pendingRefs.length = 0
          set.docs.map( doc =>{
            let performance = doc.data() as PerformanceObj
            //check if the performance is in the program
            let idx = this.tournament!.program.findIndex( e => e == doc.id )
            if( idx < 0 ){
              let pending:PerformanceReference={
                id: doc.id,
                performance: performance,
              }
              this.pendingRefs.push(pending)
            }
          })
          this.pendingRefs.sort( (a,b) => a.performance.label > b.performance.label ? 1 : -1)
      }  
    })
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

  onAccept( id:string ){
    this.firebase.unionArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId, "program", id).then( ()=>{
      console.log("update programa")
    },
    reason =>{
      alert("Error updating programa:" + reason)
    })
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

  onPanelActivated(activePanel:string){
    this.activePanel = activePanel 
    this.business.setStoredItem("activePanel", activePanel)
  }

  getTournamentPath():string{
 
        return urlbase + '/tournament/' + this.tournamentId;

  }  
   


 
}

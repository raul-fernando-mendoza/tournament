import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { Performance, EvaluationGradeCollection, EvaluationGradeObj, Filter, PerformanceCollection, PerformanceObj, Tournament , TournamentCollection, TournamentObj} from '../types'
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
import { BusinesslogicService } from '../businesslogic.service';
import { MatGridListModule} from '@angular/material/grid-list';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';



interface PerformanceReference{
  id:string
  performance:PerformanceObj
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
  ],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent{

  id :string | null= null
  tournament:TournamentObj| null = null
  submitting = false
  isAdmin = false

  performanceColor = 'lightblue'


  form = this.fb.group({
    label:['',Validators.required],
    eventDate:[new Date(),Validators.required],
    eventTime:[""],
    imageUrl:[""]
  })

  collection = TournamentCollection.collectionName

  performanceLinks:Array<PerformanceReference> = []

  programLinks:Array<PerformanceReference> = []

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
        thiz.id = null
        if( paramMap.get('id') )
          thiz.id = paramMap.get('id')
          thiz.update()
        }

      })      

  }
  update(){
    if( this.id != null){
      this.firebaseService.getDocument( TournamentCollection.collectionName, this.id).then( data =>{
        this.tournament = data as TournamentObj
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
        this.getPerformances()
      })
    }
  }

  onSubmit(){
    if( !this.id ){
      let id = uuidv4();
      let d:Date = this.form.controls.eventDate.value!
      let t:Timestamp = new Timestamp(d.getSeconds(), 0)

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
        active: true,
        creatorUid: this.authService.getUserUid()!,
        tags: tags,
        program: [],
        medals: [],
        categories: [],
        evaluations: [],
        jurors: []
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
    if( this.id && label ){
        
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
        this.firebaseService.updateDocument(TournamentCollection.collectionName, this.id, obj).then(data=>{
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
    this.firebaseService.deleteDocument( this.collection , this.id! ).then( ()=>{
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

  getPerformances():Promise<void>{
    return this.firebaseService.getDocuments( TournamentCollection.collectionName + "/" + this.id + "/" + PerformanceCollection.collectionName ).then( set =>{
        this.programLinks.length = 0
        this.performanceLinks.length = 0
        set.map( doc =>{
          let performanceObj = doc.data() as PerformanceObj
          
          let performanceLink:PerformanceReference = {
            id:doc.id,
            performance:performanceObj
          }
          let isInProgram = false

          let idx = this.tournament!.program.findIndex( e => e==performanceLink.id)
          if( idx >= 0){
                //it is in the program
                isInProgram = true
                this.programLinks[idx] = performanceLink
          }          
          if( isInProgram == false ){
            //add to program
            this.performanceLinks.push( performanceLink )
          }
        })
        //now recalculate the percentage for the Performance
        this.tournament!.program.map( performanceId =>{
          this.firebaseService.getDocuments([TournamentCollection.collectionName, this.id
            ,PerformanceCollection.collectionName, performanceId
            ,EvaluationGradeCollection.collectionName].join("/") ).then( set =>{
              let total = 0
              let gradesCnt = 0
              set.map( doc =>{
                let evaluationGrade:EvaluationGradeObj = doc.data() as EvaluationGradeObj
                if( evaluationGrade.isCompleted ){
                  total += evaluationGrade.grade
                  gradesCnt += 1
                }
              })
              if( gradesCnt > 0){
                let idx = this.programLinks.findIndex( e => e.id==performanceId )
                this.programLinks[idx].performance.grade = Number((total/gradesCnt).toFixed(2))
              }
          })
        })
      },
      reason =>{
        alert("ERROR updating program:" + reason)
      })
  }

  onAccept( id:string ){
    this.firebaseService.unionArrayElementDoc( this.collection + "/" + this.id, "program", id).then( ()=>{
      console.log("update programa")
      this.update()
    },
    reason =>{
      alert("Error updating programa:" + reason)
    })
  }
  onReject( id:string ){
    this.firebaseService.removeArrayElementDoc( this.collection + "/" + this.id, "program", id).then( ()=>{
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
        this.firebaseService.updateDocument( this.collection, this.id, obj).then( ()=>{
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
        this.firebaseService.updateDocument( this.collection, this.id, obj).then( ()=>{
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
    this.firebaseService.updateDocument( [TournamentCollection.collectionName, this.id
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
}

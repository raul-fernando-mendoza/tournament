import { AfterViewInit, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Aspect, Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-aspect-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule],
  templateUrl: './aspect-list.component.html',
  styleUrl: './aspect-list.component.css',

})
export class AspectListComponent implements AfterViewInit{
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj
  @Input() evaluationId!:string 
  @Input() evaluation!:Evaluation

  isAdmin = false

  constructor( private firebase:FirebaseService, 
    private auth:AuthService,
    private router:Router
  ){

  }
  ngAfterViewInit(): void {
    if( this.auth.getUserUid()!= null && this.tournament?.creatorUid != null ){
      this.isAdmin = (this.auth.getUserUid() == this.tournament?.creatorUid) 
    }
  }

  update(){
  }

  onAspect(id:string){
    this.router.navigate(['/',TournamentCollection.collectionName,this.tournamentId,'evaluation',this.evaluationId,'aspect',id])
  }


}

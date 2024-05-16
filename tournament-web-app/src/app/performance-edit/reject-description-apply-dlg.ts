import { Component , Inject} from "@angular/core";
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
export interface DescriptionDlgData {
    description: string | null
}
/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'reject-description-apply-dlg',
    templateUrl: 'reject-description-apply-dlg.html',
    standalone: true,
    imports: [MatButtonModule
      ,FormsModule 
      ,MatDialogModule
      ,MatFormFieldModule
      ,MatInputModule
      ,ReactiveFormsModule 
    ]    
  })
  export class RejectDescriptionApplyDialog { 
    FG = this.fb.group({
      description:['',[Validators.required]],
    })
  
    constructor(
      public dialogRef: MatDialogRef<RejectDescriptionApplyDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DescriptionDlgData,
      private fb:FormBuilder) {

        this.FG.controls.description.setValue("")
      }
      closeDialog() {
        let str = this.FG.controls.description.value
        this.data.description = str
        this.dialogRef.close(str);
      }
  }
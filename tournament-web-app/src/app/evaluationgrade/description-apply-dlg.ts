import { Component , Inject} from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { QuillModule } from "ngx-quill";
export interface DescriptionDlgData {
    description: string
}
/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'description-apply-dlg',
    templateUrl: 'description-apply-dlg.html',
    standalone: true,
    imports: [MatButtonModule
      ,MatDialogModule
      ,QuillModule      
    ]    
  })
  export class DescriptionApplyDialog { 
    constructor(
      public dialogRef: MatDialogRef<DescriptionApplyDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DescriptionDlgData) {}
  }
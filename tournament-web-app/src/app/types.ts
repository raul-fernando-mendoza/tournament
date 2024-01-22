import { Timestamp, WhereFilterOp } from "firebase/firestore/lite"


export interface Tournament{
    label?:string
    eventDate?:Timestamp
    eventTime?:string
    active?:boolean
    tags?:Array<string>
    creatorUid?:string
    imageUrl?:string|null
    program?:Array<string>
    medals?:Array<{
        label:string
        minGrade:number
    }>

}
export class TournamentObj implements Tournament{
    label: string = ""
    eventDate: Timestamp = new Timestamp((new Date()).getSeconds(), 0) 
    eventTime: string = "00:00"
    active: boolean = false
    tags?: string[] 
    creatorUid: string = ""
    imageUrl: string | null = null
    program:Array<string> = []
    medals:Array<{
        label:string
        minGrade:number
    }> = []
}
export class TournamentCollection{
    static readonly collectionName:string = 'tournament';
}

export interface Category{
    label?:string
}
export class CategoryObj{
    label:string = ""
}
export class CategoryCollection{
    static readonly collectionName:string = "category"
}

export interface Evaluation{
    label?:string
    aspect?:Array<string>
}
export class EvaluationObj{
    label:string = ""
    aspect:Array<string> = []
}
export class EvaluationCollection{
    static readonly collectionName:string = "evaluation"
}

export interface Aspect{
    label?:string
    description?:string | null
}
export class AspectObj implements Aspect{
    label:string = ""
    description: string | null =  null
}
export class AspectCollection{
    static readonly collectionName:string = "aspect"
}

export interface Evaluator{
    label?:string
    email?:string
}
export class EvaluatorObj implements Evaluator{
    label:string = ""
    email:string = "" 
}
export class EvaluatorCollection{
    static readonly collectionName:string = "evaluator"
}

export interface Performance{
    label?:string
    email?:string
    categoryId?:string
    owner?:string
    isAccepted?:boolean
    isCanceled?:boolean
    grade?:number,
    overwrittenGrade?:number|null
    isReleased?:boolean
}
export class PerformanceObj implements Performance{
    label!:string 
    categoryId!:string
    owner!:string 
    isAccepted:boolean = false
    grade:number=10
    overwrittenGrade:number|null=null
    isReleased:boolean = false
}
export class PerformanceCollection{
    static readonly collectionName:string = "performance"
}

export interface Filter{
    field:string
    operator:'==' 
    value:string | null
  }

export class AspectGrade {
    label!:string
    description:string|null = null
    grade:number = 1
    overwriteGrade:number | null = null   
}

export interface EvaluationGrade{
    evaluationId?:string
    evaluatorId?:string
    isCompleted?:boolean
    grade?:number
    overwriteGrade?:number | null
    aspectGrades:Array<AspectGrade>
}
export class EvaluationGradeObj implements EvaluationGrade{
    evaluationId!:string
    evaluatorId!:string 
    isCompleted:boolean = false
    grade:number = 10
    overwriteGrade:number | null = null
    aspectGrades:Array<AspectGrade> = []
}
export class EvaluationGradeCollection{
    static readonly collectionName:string = "evaluationgrade"
}


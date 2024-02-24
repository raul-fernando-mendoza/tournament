import { Timestamp, WhereFilterOp } from "firebase/firestore/lite"

export interface Medal{
    id:string
    label:string 
    description:string
    minGrade:number    
}

export interface Category{
    id:string
    label:string
    description:string
}

export interface Aspect{
    id:string
    label:string
    description:string | null
}

export interface Evaluation{
    id:string
    label:string
    description:string    
    aspects:Array<Aspect>
}

export class Juror{
    id!:string
    label!:string
    email?:string
}


interface Dictionary<T>{
    [key:string]:T;
}

export interface Tournament{
    label?:string
    eventDate?:Timestamp
    eventTime?:string
    active?:boolean
    tags?:Array<string>
    creatorUid?:string
    imageUrl?:string|null
    imagePath?:string|null
    program?:Array<string>
    categories?:Array<Category>
    medals?:Array<Medal>
    evaluations?:Array<Evaluation>
    jurors?:Dictionary<Juror>
}
export class TournamentObj implements Tournament{
    label: string = ""
    eventDate: Timestamp = new Timestamp((new Date()).getSeconds(), 0) 
    eventTime: string = "00:00"
    active: boolean = false
    tags?: string[] 
    creatorUid: string = ""
    imagePath:string | null = null
    imageUrl: string | null = null
    program:Array<string> = []
    categories:Array<Category> = []
    medals:Array<Medal> = []
    evaluations:Array<Evaluation> = []
    jurors:Dictionary<Juror> = {}
}
export class TournamentCollection{
    static readonly collectionName:string = 'tournament';
}

export interface Performance{
    label?:string
    email?:string
    categoryId?:string
    fullname?:string
    isAccepted?:boolean
    isCanceled?:boolean
    grade?:number,
    overwrittenGrade?:number|null
    isReleased?:boolean
}
export class PerformanceObj implements Performance{
    label!:string 
    categoryId!:string
    fullname!:string 
    email!:string
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
    jurorId?:string
    isCompleted?:boolean
    grade?:number
    overwriteGrade?:number | null
    aspectGrades:Array<AspectGrade>
}
export class EvaluationGradeObj implements EvaluationGrade{
    evaluationId!:string
    jurorId!:string 
    isCompleted:boolean = false
    grade:number = 10
    overwriteGrade:number | null = null
    aspectGrades:Array<AspectGrade> = []
}
export class EvaluationGradeCollection{
    static readonly collectionName:string = "evaluationgrade"
}


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

export interface Juror{
    label?:string
    email?:string
}
export class JurorObj{
    label!:string
    email!:string    
}
export class JurorCollection{
    static readonly collectionName:string = 'juror';
}


export interface Dictionary<T>{
    [key:string]:T;
}

export interface Tournament{
    label?:string
    eventDate?:number
    eventTime?:string
    place?:string
    active?:boolean
    tags?:Array<string>
    creatorUid?:string
    imageUrl?:string|null
    imagePath?:string|null
    program?:Array<string>
    isProgramReleased?:boolean
    categories?:Array<Category>
    medals?:Array<Medal>
    evaluations?:Array<Evaluation>
}
export class TournamentObj implements Tournament{
    label!:string
    eventDate!: number 
    eventTime!: string 
    place?:string
    active: boolean = false
    tags?: string[] 
    creatorUid!: string 
    imagePath:string | null = null
    imageUrl: string | null = null
    program:Array<string> = []
    isProgramReleased:boolean = false
    categories:Array<Category> = []
    medals:Array<Medal> = []
    evaluations:Array<Evaluation> = []
}
export class TournamentCollection{
    static readonly collectionName:string = 'tournament';
}

export interface Performance{
    label?:string
    email?:string
    categoryId?:string
    fullname?:string
    isCanceled?:boolean
    grade?:number,
    overwrittenGrade?:number|null
    isReleased?:boolean
    academy?:string
    coreographer?:string
    isDeleted?:boolean
    isRejected?:boolean
    rejectedReason?:string
    city?:string
}
export class PerformanceObj implements Performance{
    label!:string 
    categoryId!:string
    fullname!:string 
    email!:string
    isCanceled:boolean= false
    grade:number=10
    overwrittenGrade:number|null=null
    isReleased:boolean = false
    academy!:string
    coreographer!:string 
    isDeleted!:boolean
    isRejected!:boolean
    rejectedReason:string = ""
    city:string = ""     
}
export class PerformanceCollection{
    static readonly collectionName:string = "performance"
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

export class InscriptionRequest{
    email!:string
    description:string | null = null
}

export class InscriptionRequestCollection{
    static readonly collectionName:string = "inscription"
}

export interface PerformanceReference{
    id:string
    performance:PerformanceObj
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {

  constructor() { }

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

  getDayId(d:Date):number {
    var 
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return parseInt( [year, month, day].join('') );
  }

  getMonthId(d:Date):number {
    var 
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;

  
    return parseInt( [year, month].join('') );
  }  

  getYearId(d:Date):number {
    return d.getFullYear()
  }  

  getDate(d:number):Date{
    let str = d.toString()
    let year = parseInt( str.substring(0,4) )
    let month = parseInt( str.substring(4,2) )
    let day = parseInt( str.substring(6,2) )
    let newDate = new Date( year, month, day)
    return newDate
  }
    
}

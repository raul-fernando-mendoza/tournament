import { Injectable } from '@angular/core';
import { environment } from './../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  constructor(private http: HttpClient) { }

  public validateCaptchaToken(recaptchaToken:string): Observable<Object> {

    var url = environment.recaptcha.url
    var secret = environment.recaptcha.secretKey
    
    var body = "secret=" + secret + "&response=" + recaptchaToken

    var myparams = {
      url : environment.recaptcha.url,
      secret : environment.recaptcha.secretKey
    }
    

    var myheaders = new HttpHeaders({
      Accept: "application/json",
      "Referrer Policy":"strict-origin-when-cross-origin",
      'Content-Type': "application/x-www-form-urlencoded"}
    );

    console.log(url + "?" + body)
     return this.http.get(url, {params : myparams, headers: myheaders})
  }  

}

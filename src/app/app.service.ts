import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  authenticated = false ;

  principal: object;
  
  constructor(private router: Router, private http: HttpClient) {}

  checkAuth(callback)
  {
    this.http.get("/user", {
      headers: new HttpHeaders()
        .set("X-Requested-With", "XMLHttpRequest")
    }).subscribe(principal => {
      if (principal && principal['name'])
      {
        this.principal = principal;
        this.authenticated = true;
      } else {
        this.principal = null;
        this.authenticated = false;
      }
      callback && callback();
    });
  }


  login(username: string, password: string): void
  {
    let params: HttpParams = new HttpParams()
      .set("username", username)
      .set("password", password);
    this.http.post("/login", params,
      {headers: new HttpHeaders()
          .set("Content-Type", "application/x-www-form-urlencoded")
          .set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"),
      observe: "body", responseType: "text"}).subscribe(resp => {
        this.checkAuth(()=>{
          if (this.authenticated)
          {
            this.router.navigateByUrl("/installations");
          }
        });
      });
  }

  logout()
  {
    this.http.post("/logout", {},
      {headers: new HttpHeaders()
          .set("Content-Type", "application/x-www-form-urlencoded")
          .set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"),
      observe: "body", responseType: "text"}).subscribe(resp => {
          this.authenticated = false;
          this.principal = null;
          this.router.navigateByUrl("/");
        });
  }


  isAdmin(): boolean
  {
    if (this.principal && this.principal['authorities'][0]['authority'] === "ROLE_ADMIN")
    {
      return true;
    } else {
      return false;
    }
  }

}

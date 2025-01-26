import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private app: AppService, private router: Router)
  {}

  ngOnInit()
  {
    this.app.checkAuth(undefined);
  }

  authenticated()
  {
    return this.app.authenticated;
  }

  logout()
  {
    this.app.logout();
  }

  isAdmin(): boolean
  {
    return this.app.isAdmin();
  }

}

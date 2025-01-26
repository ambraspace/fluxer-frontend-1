import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  constructor(private app: AppService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
  }

  login()
  {
    this.app.login(this.username, this.password);
  }

}

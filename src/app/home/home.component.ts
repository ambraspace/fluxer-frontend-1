import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private app: AppService,
    private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'background', 'url(assets/bg.jpg) no-repeat center fixed');
    this.renderer.setStyle(document.body, 'background-size', 'cover');
  }

  ngOnDestroy(): void {
    this.renderer.removeStyle(document.body, 'background');
    this.renderer.removeStyle(document.body, 'background-size');
  }

}

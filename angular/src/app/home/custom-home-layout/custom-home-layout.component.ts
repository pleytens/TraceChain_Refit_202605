import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@abp/ng.core';
import { environment } from '../../../environments/env.uat';


@Component({
  selector: 'app-home-custom-layout',
  templateUrl: './custom-home-layout.component.html',
  styleUrls: ['./custom-home-layout.scss']
})

export class CustomHomeLayoutComponent {
  constructor( private authService: AuthService) {
  }
  @Input() isLoggedIn: boolean = false;
  login() {
    this.authService.navigateToLogin();
  }
}

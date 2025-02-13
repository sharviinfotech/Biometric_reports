import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet,CommonModule,NgxSpinnerModule],
})
export class AppComponent implements OnInit {
  constructor(private spinner: NgxSpinnerService) {}
  ngOnInit() {
    this.spinner.show(undefined, {
      type: 'square-jelly-box',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      fullScreen: true
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  
}

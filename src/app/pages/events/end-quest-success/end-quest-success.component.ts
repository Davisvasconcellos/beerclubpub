import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';

@Component({
  selector: 'app-end-quest-success',
  standalone: true,
  imports: [RouterModule, GridShapeComponent],
  templateUrl: './end-quest-success.component.html',
  styles: ``
})
export class EndQuestSuccessComponent {
  currentYear = new Date().getFullYear();
  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      try { this.router.navigateByUrl('/events/home-guest'); } catch {}
    }, 3000);
  }
}
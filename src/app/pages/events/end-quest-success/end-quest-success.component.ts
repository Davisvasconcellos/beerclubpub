import { Component } from '@angular/core';
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
}
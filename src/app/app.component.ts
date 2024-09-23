import { Component } from '@angular/core';
import { DragNDropModule } from 'src/directives/drag-n-drop';

@Component({
    standalone: true,
    imports: [DragNDropModule],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'angular-zoneless-drag-n-drop';
}

import { Injectable, signal } from '@angular/core';
import { DragNDropItemDirective } from '../../item';

@Injectable({
    providedIn: 'root',
})
export class DragNDropService {
    readonly dndItems = signal<readonly DragNDropItemDirective[]>([]);
    readonly dndElemContainer = signal<HTMLElement | null>(null);
    readonly coveragePercentage = signal(0);
    readonly coverageTime = signal(0);
}

import { Injectable, signal } from '@angular/core';
import { DragNDropItemDirective } from '../item';

@Injectable({
    providedIn: 'root',
})
export class DragNDropService {
    readonly dndItems = signal<readonly DragNDropItemDirective[] | null>(null);
    readonly dndElemContainer = signal<HTMLElement | null>(null);
}

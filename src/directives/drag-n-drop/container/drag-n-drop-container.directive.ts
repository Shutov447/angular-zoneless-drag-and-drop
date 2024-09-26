import {
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    OnInit,
} from '@angular/core';
import { DragNDropItemDirective } from '../item';
import { DragNDropService } from '../lib';

@Directive({
    selector: '[appDragNDropContainer]',
})
export class DragNDropContainerDirective implements OnInit {
    private readonly hostElem = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dndService = inject(DragNDropService);
    private readonly dndItems = contentChildren(DragNDropItemDirective);

    readonly coveragePercentage = input(0);
    readonly coverageTime = input(0);

    ngOnInit() {
        this.dndService.dndElemContainer.set(this.hostElem.nativeElement);
        this.dndService.dndItems.set(this.dndItems());
        this.dndService.coveragePercentage.set(this.coveragePercentage());
        this.dndService.coverageTime.set(this.coverageTime());
    }
}

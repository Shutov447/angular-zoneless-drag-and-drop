import {
    contentChildren,
    Directive,
    effect,
    ElementRef,
    inject,
    OnInit,
} from '@angular/core';
import { DragNDropItemDirective } from '../item';
import { DragNDropService } from '../service/drag-n-drop.service';

@Directive({
    selector: '[appDragNDropContainer]',
})
export class DragNDropContainerDirective implements OnInit {
    private readonly hostElem = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dndService = inject(DragNDropService);
    private readonly dndItems = contentChildren(DragNDropItemDirective);
    private readonly dndItemsEffect = effect(
        () => {
            this.dndService.dndItems.set(this.dndItems());
        },
        {
            allowSignalWrites: true,
        }
    );

    ngOnInit() {
        this.dndService.dndElemContainer.set(this.hostElem.nativeElement);
    }
}

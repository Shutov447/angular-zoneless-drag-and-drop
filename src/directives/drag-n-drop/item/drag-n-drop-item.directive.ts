import {
    computed,
    Directive,
    effect,
    ElementRef,
    HostListener,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { DragNDropService } from '../service/drag-n-drop.service';
import { isSufficientCovered } from '../lib';

@Directive({
    selector: '[appDragNDropItem]',
})
export class DragNDropItemDirective implements OnInit {
    private readonly eRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly elem = this.eRef.nativeElement;
    private readonly dndService = inject(DragNDropService);
    private readonly isStartDragEffect = effect(() => {
        this.elem.style.cursor = this.isStartDrag() ? 'grabbing' : 'grab';
    });
    private readonly dndSiblingItems = computed(() =>
        this.init()
            ? this.dndService
                  .dndItems()
                  ?.filter(
                      ({ absoluteInitialPosX, absoluteInitialPosY }) =>
                          !(
                              absoluteInitialPosX ===
                                  this.absoluteInitialPosX &&
                              absoluteInitialPosY === this.absoluteInitialPosY
                          )
                  )
            : []
    );
    private readonly dndElemContainerEffect = effect(
        () => {
            const dndContainerElem =
                this.dndService.dndElemContainer() as HTMLElement;

            dndContainerElem && this.transformInitialSetup(dndContainerElem);
        },
        { allowSignalWrites: true }
    );
    private readonly init = signal(false);
    private readonly isStartDrag = signal(false);
    private readonly absoluteInitialPosX = this.elem.getBoundingClientRect().x;
    private readonly absoluteInitialPosY = this.elem.getBoundingClientRect().y;

    private containerRelativeStartPos = {
        top: 0,
        left: 0,
    };
    private startDragY = 0;
    private startDragX = 0;

    ngOnInit() {
        this.init.set(true);
    }

    @HostListener('mousedown', ['$event']) private onMousedown(
        event: MouseEvent
    ) {
        this.setDragStartState(event.x, event.y);
    }

    //  TODO: с window:mouseup надо чета делать, так как это не правильно(хз)
    // надо чета делать с тем что 'window:mouseup' вызывается для всех вообще dndItem
    @HostListener('window:mouseup')
    @HostListener('mouseup')
    private onMouseup() {
        this.setStartPosition();
    }

    // TODO: сделать так, чтобы события не всплывали(тоже хз)
    @HostListener('mousemove', ['$event']) private onMousemove(
        event: MouseEvent
    ) {
        if (this.isStartDrag()) {
            const coveredSibling = this.getCoveredSibling();

            coveredSibling
                ? this.switchStartPosition(coveredSibling)
                : this.elemOffsetToPoint(event.x, event.y);
        }
    }

    private transformInitialSetup(dndContainerElem: HTMLElement) {
        const dndContainerDomRect = dndContainerElem.getBoundingClientRect();
        const oldDndContainerHeight = dndContainerDomRect.height;
        const oldDndContainerWidth = dndContainerDomRect.width;

        this.setContainerRelativeStartPos(dndContainerDomRect);
        this.setElementPositionToAbsolute();

        dndContainerElem.style.height = oldDndContainerHeight + 'px';
        dndContainerElem.style.width = oldDndContainerWidth + 'px';
    }

    private setElementPositionToAbsolute() {
        this.elem.style.top = this.containerRelativeStartPos.top + 'px';
        this.elem.style.left = this.containerRelativeStartPos.left + 'px';

        window.setTimeout(() => (this.elem.style.position = 'absolute'));
    }

    private setContainerRelativeStartPos(dndContainerDomRect: DOMRect) {
        const domRect = this.elem.getBoundingClientRect();
        const top =
            domRect.y -
            dndContainerDomRect.y -
            parseFloat(getComputedStyle(this.elem).marginTop);
        const left =
            domRect.x -
            dndContainerDomRect.x -
            parseFloat(getComputedStyle(this.elem).marginLeft);

        this.containerRelativeStartPos = {
            top,
            left,
        };
    }

    private switchStartPosition(dndItem: DragNDropItemDirective) {
        const newContainerRelativeStartPos = dndItem.containerRelativeStartPos;
        const newDndItemContainerRelativeStartPos =
            this.containerRelativeStartPos;

        this.containerRelativeStartPos = newContainerRelativeStartPos;
        this.setStartPosition(); // рабочее решение но с нюансом(оно сразу меняет позиции),
        // но походу это даже лучше, так как можно сделать так, что если чел секунду покрывал элемент,
        // то меням сразу, иначе вообще не меняем, а чел просто дальше идет выбирать

        dndItem.containerRelativeStartPos = newDndItemContainerRelativeStartPos;
        dndItem.setStartPosition();
    }

    private elemOffsetToPoint(x: number, y: number) {
        this.elem.style.top =
            y + this.containerRelativeStartPos.top - this.startDragY + 'px';
        this.elem.style.left =
            x + this.containerRelativeStartPos.left - this.startDragX + 'px';
    }

    private getCoveredSibling() {
        return this.dndSiblingItems()?.find((item) =>
            isSufficientCovered(this.elem, item.elem, 50)
        );
    }

    private setDragStartState(x: number, y: number) {
        this.startDragY = y;
        this.startDragX = x;
        this.elem.style.zIndex = '999';
        this.isStartDrag.set(true);
    }

    setStartPosition() {
        this.elem.style.top = this.containerRelativeStartPos.top + 'px';
        this.elem.style.left = this.containerRelativeStartPos.left + 'px';
        this.elem.style.zIndex = '0';
        this.isStartDrag.set(false);
    }
}

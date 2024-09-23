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
    private readonly dndContainer = this.dndService.dndElemContainer;
    private readonly isStartDragEffect = effect(() => {
        this.eRef.nativeElement.style.cursor = this.isStartDrag()
            ? 'grabbing'
            : 'grab';
    });
    private containerRelativeStartPos = {
        top: 0,
        left: 0,
    };
    private setInitialPos(initialPos: { top: number; left: number }) {
        this.eRef.nativeElement.style.top = initialPos.top + 'px';
        this.eRef.nativeElement.style.left = initialPos.left + 'px';

        window.setTimeout(
            () => (this.eRef.nativeElement.style.position = 'absolute')
        );
    }
    private readonly dndElemContainerEffect = effect(
        () => {
            const dndContainerElem =
                this.dndService.dndElemContainer() as HTMLElement;
            const dndContainerDomRect =
                dndContainerElem.getBoundingClientRect();

            if (dndContainerDomRect) {
                const oldDndContainerHeight =
                    this.dndContainer()?.getBoundingClientRect().height;
                const oldDndContainerWidth =
                    this.dndContainer()?.getBoundingClientRect().width;

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
                this.setInitialPos({
                    top,
                    left,
                });
                dndContainerElem.style.height = oldDndContainerHeight + 'px';
                dndContainerElem.style.width = oldDndContainerWidth + 'px';
            }
        },
        { allowSignalWrites: true }
    );
    private readonly dndSiblingItems = computed(() =>
        this.init()
            ? this.dndService
                  .dndItems()
                  ?.filter(
                      ({ absoluteInitialPos }) =>
                          !(
                              absoluteInitialPos.x ===
                                  this.absoluteInitialPos.x &&
                              absoluteInitialPos.y === this.absoluteInitialPos.y
                          )
                  )
            : []
    );
    private readonly init = signal(false);
    private readonly isStartDrag = signal(false);
    private readonly absoluteInitialPos = {
        x: this.elem.getBoundingClientRect().x,
        y: this.elem.getBoundingClientRect().y,
    };
    private startDragY = 0;
    private startDragX = 0;

    ngOnInit() {
        this.init.set(true);
    }

    @HostListener('mousedown', ['$event']) private onMousedown(
        event: MouseEvent
    ) {
        this.startDragY = event.y;
        this.startDragX = event.x;
        this.elem.style.zIndex = '999';
        this.isStartDrag.set(true);
    }

    //  TODO: с window:mouseup надо чета делать, так как это не правильно(хз)
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
            const sibling = this.dndSiblingItems()?.find((item) =>
                isSufficientCovered(
                    this.eRef.nativeElement,
                    item.eRef.nativeElement,
                    50
                )
            );

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            sibling
                ? this.switchStartPosition(sibling)
                : this.elemOffsetToPoint(event.x, event.y);
        }
    }

    setStartPosition() {
        this.eRef.nativeElement.style.top =
            this.containerRelativeStartPos.top + 'px';
        this.eRef.nativeElement.style.left =
            this.containerRelativeStartPos.left + 'px';
        this.eRef.nativeElement.style.zIndex = '0';
        this.isStartDrag.set(false);
    }

    switchStartPosition(dndItem: DragNDropItemDirective) {
        const oldContainerRelativeStartPos = this.containerRelativeStartPos;
        const oldDndItemContainerRelativeStartPos =
            dndItem.containerRelativeStartPos;

        this.containerRelativeStartPos = oldDndItemContainerRelativeStartPos;
        dndItem.containerRelativeStartPos = oldContainerRelativeStartPos;

        this.setStartPosition(); // рабочее решение но с нюансом(оно сразу меняет позиции),
        // но походу это даже лучше, так как можно сделать так, что если чел секунду покрывал элемент,
        // то меням сразу, иначе вообще не меняем, а чел просто дальше идет выбирать
        dndItem.setStartPosition();
    }

    elemOffsetToPoint(x: number, y: number) {
        this.eRef.nativeElement.style.top =
            y + this.containerRelativeStartPos.top - this.startDragY + 'px';
        this.eRef.nativeElement.style.left =
            x + this.containerRelativeStartPos.left - this.startDragX + 'px';
    }
}

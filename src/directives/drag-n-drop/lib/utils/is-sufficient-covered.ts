export const isSufficientCovered = (
    draggedItem: HTMLElement,
    targetItem: HTMLElement,
    coveragePercentage: number,
): boolean => {
    const draggedRect = draggedItem.getBoundingClientRect();
    const targetRect = targetItem.getBoundingClientRect();
    const draggedArea = draggedRect.width * draggedRect.height;
    const intersection = getIntersection(draggedRect, targetRect);

    if (!intersection) return false;

    const intersectionArea = intersection.width * intersection.height;

    return (intersectionArea / draggedArea) * 100 >= coveragePercentage;
};

export const getIntersection = (
    rect1: DOMRect,
    rect2: DOMRect,
): DOMRect | null => {
    const left = Math.max(rect1.left, rect2.left);
    const right = Math.min(rect1.right, rect2.right);
    const top = Math.max(rect1.top, rect2.top);
    const bottom = Math.min(rect1.bottom, rect2.bottom);

    return right <= left || bottom <= top
        ? null
        : new DOMRect(left, top, right - left, bottom - top);
};

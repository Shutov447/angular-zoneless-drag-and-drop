import { Transition } from '../types';

export const convertTransitionsToString = (
    transitions: Transition[],
): string => {
    return transitions.reduce((acc, transition, i) => {
        const transitionStr = transition.reduce(
            (acc, transitionItem, i) =>
                acc + transitionItem.toString() + (i === 1 ? 'ms ' : ' '),
            '',
        ) as string;

        return acc + transitionStr + (i < transitions.length - 1 ? ',' : '');
    }, '');
};

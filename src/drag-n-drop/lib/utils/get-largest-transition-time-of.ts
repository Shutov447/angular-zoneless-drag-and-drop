import { Transition } from '../types';

export const getLargestTransitionTimeOf = (transitions: Transition[]) => {
    const times = transitions.map((transition) => transition[1]);

    return Math.max(...times);
};

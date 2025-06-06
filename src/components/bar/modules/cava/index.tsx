import { Variable, bind } from 'astal';
import { Astal } from 'astal/gtk3';
import { Module } from '../../shared/Module';
import { inputHandler } from '../../utils/helpers';
import options from 'src/options';
import { initSettingsTracker, initVisibilityTracker } from './helpers';
import AstalCava from 'gi://AstalCava?version=0.1';
import { BarBoxChild } from 'src/lib/types/bar.types';

const {
    icon,
    showIcon: label,
    showActiveOnly,
    barCharacters,
    spaceCharacter,
    leftClick,
    rightClick,
    middleClick,
    scrollUp,
    scrollDown,
} = options.bar.customModules.cava;

const isVis = Variable(!showActiveOnly.get());

export const Cava = (): BarBoxChild => {
    let labelBinding: Variable<string> = Variable('');

    const visTracker = initVisibilityTracker(isVis);
    const settingsTracker = initSettingsTracker();
    const cavaService = AstalCava.get_default();

    if (cavaService) {
        labelBinding = Variable.derive(
            [bind(cavaService, 'values'), bind(spaceCharacter), bind(barCharacters)],
            (values, spacing, blockCharacters) => {
                const valueMap = values
                    .map((v: number) => {
                        const index = Math.floor(v * blockCharacters.length);
                        return blockCharacters[Math.min(index, blockCharacters.length - 1)];
                    })
                    .join(spacing);

                return valueMap;
            },
        );
    }

    return Module({
        isVis: bind(isVis),
        label: labelBinding(),
        showIconBinding: bind(label),
        textIcon: bind(icon),
        boxClass: 'cava',
        props: {
            setup: (self: Astal.Button) => {
                inputHandler(self, {
                    onPrimaryClick: {
                        cmd: leftClick,
                    },
                    onSecondaryClick: {
                        cmd: rightClick,
                    },
                    onMiddleClick: {
                        cmd: middleClick,
                    },
                    onScrollUp: {
                        cmd: scrollUp,
                    },
                    onScrollDown: {
                        cmd: scrollDown,
                    },
                });
            },
            onDestroy: () => {
                labelBinding.drop();
                visTracker.drop();
                settingsTracker?.drop();
            },
        },
    });
};

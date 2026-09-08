import type { Tip } from './interfaces';

export const TIPS: Tip[] = [
    {
        segments: [
            { text: 'Are you a ' },
            { text: 'kmoe', bold: true },
            { text: ' fan? Check out ' },
            { text: 'kmoedle', href: 'https://kmoedle.pages.dev', bold: true },
            { text: ' by ' },
            { text: 'anjos', href: 'https://github.com/caioanjs' },
            { text: '!' },
        ],
    },
    // {
    //     segments: [
    //         {text: "Are you a "},
    //         {text: "Jane Remover", bold: true},
    //         {text: " fan? Check out "},
    //         {text: "removedle", href: "https://removedle.org/", bold: true},
    //         {text: " by "},
    //         {text: "mewdini", href: "https://github.com/mewdini/removedle"},
    //         {text: "!"}
    //     ],
    // },
    {
        segments: [
            { text: 'You can ' },
            { text: 'click', bold: true },
            { text: ' on the song titles above to find streaming links for each song.' },
        ],
    },
    {
        segments: [
            { text: 'You can ' },
            { text: 'change themes', bold: true },
            { text: ' and ' },
            { text: "adjust the audio's volume ", bold: true },
            { text: 'in the Settings above.' },
        ],
    },
    {
        segments: [
            { text: 'The date of the first challenge, ' },
            { text: 'April 21', bold: true },
            { text: ", is underscores's birthday!" },
        ],
    },
    {
        segments: [
            { text: 'You can listen to ' },
            { text: 'all the songs', bold: true },
            { text: ' in underscordle with this Soundcloud ' },
            { text: 'playlist', href: 'https://soundcloud.com/angelolz1/sets/underscordle' },
            { text: '.' },
        ],
    },
];

export function chooseTip() {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
}

import { createTone, createPalette, type InputModel } from './colorPaletteSystem';

// Исходные данные
const input = {
  red: {
    main: 'red',
    dark: 'darkred',
    light: 'lightred',
    extra: 'extrared',
  },
  green: {
    main: 'green',
    dark: 'darkgreen',
    light: 'lightgreen',
    extra: 'extragreen',
  },
  blue: {
    main: 'blue',
    dark: 'darkblue',
    light: 'lightblue',
    extra: 'extrablue',
  },
  yellow: {
    main: 'yellow',
    dark: 'darkyellow',
    light: 'lightyellow',
    extra: 'extrayellow',
  },
} satisfies InputModel;

const baseColors = {
  background: (data) => ({ background: data.main }),
  color: (data) => ({ color: data.main }),
};

const brightness = createTone(
  (data) => ({
    foreground: data.main,
    customProp: '#f0f0f0'
  }),
  {
    name: 'brightness',
    subtone: {
      low: (data) => ({ white: data.light }),
      medium: (data) => ({ shadow: data.main }),
      high: (data) => ({
        someProp: 'transparent',
        anotherProp: '#fff',
        thirdCustomProp: data.main,
      }),
      ultra: (data) => ({ intensive: data.extra }),
    },
  }
);

const depths = createTone(
  (data) => ({
    background: data.light,
    foreground: data.main,
    color: data.extra,
  }),
  {
    name: 'depth',
    subtone: {
      '8-bit': (data) => ({ borderColor: data.main }),
      '16-bit': (data) => ({ borderColor: data.main, anotherColor: data.light }),
      '24-bit': (data) => ({ extraColor: data.extra }),
    },
  }
);

const colors = createPalette(input, {
  base: baseColors,
  tones: {
    brightness,
    depth: depths
  },
});

// Примеры использования палитры
const redColor = colors.red;
const blueWithBrightness = colors.blue_brightness;
const greenWithLowBrightness = colors.green_low_brightness;
const yellowWith16BitDepth = colors['yellow_16-bit_depth'];

export default colors;

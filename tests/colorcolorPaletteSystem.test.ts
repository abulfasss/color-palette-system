import { createTone, createPalette, type InputModel } from '../src/colorPaletteSystem';

describe('Color Palette System', () => {
  const testInput = {
    red: {
      main: 'red',
      dark: 'darkred',
      light: 'lightred',
      extra: 'extrared',
    },
    blue: {
      main: 'blue',
      dark: 'darkblue',
      light: 'lightblue',
      extra: 'extrablue',
    },
  } as const;

  describe('createTone', () => {
    it('should create a simple tone without subtones', () => {
      const simpleTone = createTone((data) => ({
        background: data.main,
        border: data.dark,
      }));

      const result = simpleTone(testInput.red);
      expect(result).toEqual({
        background: 'red',
        border: 'darkred',
      });
    });

    it('should create a tone with subtones', () => {
      const toneWithSubtones = createTone(
        (data) => ({
          primary: data.main,
        }),
        {
          name: 'testTone',
          subtone: {
            light: (data) => ({ color: data.light }),
            dark: (data) => ({ color: data.dark }),
          },
        }
      );

      const result = toneWithSubtones(testInput.blue);
      expect(result).toEqual({
        primary: 'blue',
      });

      expect(toneWithSubtones._toneName).toBe('testTone');
      expect(toneWithSubtones._subtoneKeys).toEqual(['light', 'dark']);

      const lightSubtone = toneWithSubtones._subtones?.light;
      expect(lightSubtone && lightSubtone(testInput.blue)).toEqual({
        color: 'lightblue',
      });
    });
  });

  describe('createPalette', () => {
    it('should create a palette with base colors', () => {
      const baseTones = {
        background: (data) => ({ bg: data.main }),
      };

      const palette = createPalette(testInput, {
        base: baseTones,
      });

      expect(palette.red).toEqual({
        ...testInput.red,
        bg: 'red',
      });

      expect(palette.blue).toEqual({
        ...testInput.blue,
        bg: 'blue',
      });
    });

    it('should create a palette with tones and subtones', () => {
      const brightness = createTone(
        (data) => ({
          foreground: data.main,
        }),
        {
          name: 'brightness',
          subtone: {
            low: (data) => ({ light: data.light }),
            high: (data) => ({ dark: data.dark }),
          },
        }
      );

      const depth = createTone(
        (data) => ({
          color: data.main,
          background: data.light,
        }),
        {
          name: 'depth',
        }
      );

      const palette = createPalette(testInput, {
        tones: {
          brightness,
          depth,
        },
      });

      expect(palette.red_brightness).toEqual({
        foreground: 'red',
      });

      expect(palette.blue_depth).toEqual({
        color: 'blue',
        background: 'lightblue',
      });

      expect(palette.red_low_brightness).toEqual({
        light: 'lightred',
      });

      expect(palette.blue_high_brightness).toEqual({
        dark: 'darkblue',
      });
    });

    it('should create a palette with combined base tones and extended tones', () => {
      const baseTones = {
        text: (data) => ({ textColor: data.main }),
      };

      const theme = createTone(
        (data) => ({
          base: data.main,
          accent: data.dark,
        }),
        {
          name: 'theme',
          subtone: {
            light: (data) => ({ background: data.light }),
            dark: (data) => ({ background: data.dark }),
          },
        }
      );

      const palette = createPalette(testInput, {
        base: baseTones,
        tones: {
          theme,
        },
      });

      expect(palette.red.textColor).toBe('red');
      expect(palette.blue.textColor).toBe('blue');

      expect(palette.red_theme).toEqual({
        base: 'red',
        accent: 'darkred',
      });

      expect(palette.blue_light_theme).toEqual({
        background: 'lightblue',
      });
    });
  });

  it('should provide correct types for all palette combinations', () => {
    const brightness = createTone(
      (data) => ({
        primary: data.main,
        secondary: data.dark,
      }),
      {
        name: 'brightness',
        subtone: {
          low: (data) => ({ variant: data.light }),
        },
      }
    );

    const palette = createPalette(testInput, {
      tones: { brightness },
    });

    expect(palette.red.main).toBeDefined();
    expect(palette.red_brightness.primary).toBeDefined();
    expect(palette.red_brightness.secondary).toBeDefined();
    expect(palette.red_low_brightness.variant).toBeDefined();
  });
});

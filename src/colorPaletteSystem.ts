/**
 * Типы для базовых цветов
 */
type ColorsUnion = 'red' | 'green' | 'blue' | 'yellow';

type ColorData = {
  main: string;
  dark: string;
  light: string;
  extra: string;
};

type InputModel = Record<ColorsUnion, ColorData>;

/**
 * Типы для тонов
 */
type ToneCallback<T> = (data: ColorData) => T;

type SubtoneConfig<SubtoneKeys extends string, SubtoneValues> = {
  [K in SubtoneKeys]: ToneCallback<SubtoneValues>;
};

type ToneOptions<ToneValue, SubtoneKeys extends string = string, SubtoneValues = any> = {
  name: string;
  subtone?: SubtoneConfig<SubtoneKeys, SubtoneValues>;
};

type ToneResult<ToneValue, SubtoneKeys extends string = never, SubtoneValues = never> = {
  (data: ColorData): ToneValue;
  _toneName: string;
  _toneResult: ToneValue;
  _subtones: SubtoneConfig<SubtoneKeys, SubtoneValues> | undefined;
  _subtoneKeys: SubtoneKeys[];
};

/**
 * 
 * @param callback Функция преобразования цветовых данных
 * @param options Опциональный объект с настройками тона
 */
function createTone<ToneValue, SubtoneKeys extends string = never, SubtoneValues = never>(
  callback: ToneCallback<ToneValue>,
  options?: ToneOptions<ToneValue, SubtoneKeys, SubtoneValues>
): ToneResult<ToneValue, SubtoneKeys, SubtoneValues> {
  const toneName = options?.name || 'unnamed';
  const subtones = options?.subtone;
  
  const toneFunction = (data: ColorData): ToneValue => {
    return callback(data);
  };
  
  (toneFunction as any)._toneName = toneName;
  (toneFunction as any)._toneResult = {} as ToneValue;
  (toneFunction as any)._subtones = subtones;
  (toneFunction as any)._subtoneKeys = subtones ? Object.keys(subtones) : [];
  
  return toneFunction as ToneResult<ToneValue, SubtoneKeys, SubtoneValues>;
}

/**
 * Типы для палитры
 */
type BaseToneCallback = (data: ColorData) => Record<string, string>;

type BaseToneConfig = {
  [key: string]: BaseToneCallback;
};

type TonesConfig = {
  [key: string]: ToneResult<any, any, any>;
};

type PaletteOptions = {
  base?: BaseToneConfig;
  tones?: TonesConfig;
};

type ExtractToneResultType<T> = T extends ToneResult<infer R, any, any> ? R : never;
type ExtractSubtoneResultType<T, K extends string> = 
  T extends ToneResult<any, infer Keys, infer Values> 
    ? K extends Keys 
      ? T['_subtones'] extends SubtoneConfig<Keys, Values> 
        ? ReturnType<T['_subtones'][K]> 
        : never
      : never
    : never;

type BaseColorKey<C extends ColorsUnion> = C;
type ToneColorKey<C extends ColorsUnion, T extends string> = `${C}_${T}`;
type SubtoneColorKey<C extends ColorsUnion, S extends string, T extends string> = `${C}_${S}_${T}`;

type PaletteResult<
  C extends ColorsUnion,
  BaseT extends BaseToneConfig,
  T extends TonesConfig
> = {
  [K in C]: ColorData & {
    [BK in keyof BaseT]: ReturnType<BaseT[BK]> extends infer R ? R[keyof R] : never;
  };
} & {
  [K in C as ToneColorKey<K, keyof T & string>]: ExtractToneResultType<T[keyof T & string]>;
} & {
  [K in C as {
    [Tone in keyof T & string]: {
      [Subtone in T[Tone]['_subtoneKeys'][number] & string]: SubtoneColorKey<K, Subtone, Tone>;
    }[T[Tone]['_subtoneKeys'][number] & string];
  }[keyof T & string]]: {
    [Tone in keyof T & string]: {
      [Subtone in T[Tone]['_subtoneKeys'][number] & string]: 
        ExtractSubtoneResultType<T[Tone], Subtone>;
    }[T[Tone]['_subtoneKeys'][number] & string];
  }[keyof T & string];
};

/**
 * 
 * @param input Исходный объект с цветовыми данными
 * @param options Объект конфигурации с базовым тоном
 */
function createPalette<
  C extends ColorsUnion,
  BaseT extends BaseToneConfig = {},
  T extends TonesConfig = {}
>(
  input: Record<C, ColorData>,
  options: PaletteOptions = {}
): PaletteResult<C, BaseT, T> {
  const { base = {}, tones = {} } = options;
  const result: Record<string, any> = {};

  Object.keys(input).forEach((colorKey) => {
    const color = input[colorKey as C];
    result[colorKey] = { ...color };

    Object.keys(base).forEach((baseKey) => {
      const baseCallback = base[baseKey];
      const baseResult = baseCallback(color);
      
      Object.entries(baseResult).forEach(([propKey, propValue]) => {
        result[colorKey][propKey] = propValue;
      });
    });

    Object.entries(tones).forEach(([toneName, toneCallback]) => {
      const toneKey = `${colorKey}_${toneName}`;
      result[toneKey] = toneCallback(color);

      const subtones = (toneCallback as any)._subtones;
      if (subtones) {
        Object.entries(subtones).forEach(([subtoneKey, subtoneCallback]) => {
          const subtoneResult = (subtoneCallback as ToneCallback<any>)(color);
          const subtoneFullKey = `${colorKey}_${subtoneKey}_${toneName}`;
          result[subtoneFullKey] = subtoneResult;
        });
      }
    });
  });

  return result as PaletteResult<C, BaseT, T>;
}

export {
  createTone,
  createPalette,
  type ColorsUnion,
  type ColorData,
  type InputModel,
  type ToneCallback,
  type ToneOptions,
  type ToneResult,
  type PaletteOptions,
  type PaletteResult
};

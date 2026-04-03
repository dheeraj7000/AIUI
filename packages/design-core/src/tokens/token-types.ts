/**
 * Token categories matching the StyleToken tokenType from @aiui/types.
 */
export enum TokenCategory {
  Color = 'color',
  Radius = 'radius',
  Font = 'font',
  Spacing = 'spacing',
  Shadow = 'shadow',
  Elevation = 'elevation',
}

/**
 * CSS named colors (subset of well-known values).
 */
const CSS_NAMED_COLORS = new Set([
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'transparent',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
  'currentcolor',
  'inherit',
]);

// Hex color: #RGB or #RRGGBB (with optional alpha variants #RGBA, #RRGGBBAA)
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

// Functional color notations: rgb(), rgba(), hsl(), hsla(), oklch()
const FUNCTIONAL_COLOR_REGEX = /^(rgb|rgba|hsl|hsla|oklch)\s*\(.*\)$/i;

// CSS length values: number with unit (px, rem, em, %)
const CSS_LENGTH_REGEX = /^-?\d+(\.\d+)?(px|rem|em|%)$/;

// Spacing: CSS length (px, rem, em) — no percent
const CSS_SPACING_REGEX = /^-?\d+(\.\d+)?(px|rem|em)$/;

// Elevation: numeric value or a z-index integer
const ELEVATION_REGEX = /^-?\d+(\.\d+)?$/;

/**
 * Validation rules keyed by token category.
 */
export interface TokenValidationRule {
  validate: (value: string) => boolean;
  description: string;
}

export const TOKEN_VALIDATION_RULES: Record<TokenCategory, TokenValidationRule> = {
  [TokenCategory.Color]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (HEX_COLOR_REGEX.test(trimmed)) return true;
      if (FUNCTIONAL_COLOR_REGEX.test(trimmed)) return true;
      if (CSS_NAMED_COLORS.has(trimmed.toLowerCase())) return true;
      return false;
    },
    description: 'Must be a hex color (#RGB, #RRGGBB), rgb(), hsl(), oklch(), or a CSS named color',
  },
  [TokenCategory.Radius]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed === '0') return true;
      return CSS_LENGTH_REGEX.test(trimmed);
    },
    description: 'Must be a CSS length value (px, rem, em, %)',
  },
  [TokenCategory.Font]: {
    validate: (value: string): boolean => {
      return value.trim().length > 0;
    },
    description: 'Must be a non-empty font family name',
  },
  [TokenCategory.Spacing]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed === '0') return true;
      return CSS_SPACING_REGEX.test(trimmed);
    },
    description: 'Must be a CSS length value (px, rem, em)',
  },
  [TokenCategory.Shadow]: {
    validate: (value: string): boolean => {
      // Shadow values are complex CSS box-shadow strings; validate non-empty
      return value.trim().length > 0;
    },
    description: 'Must be a valid CSS box-shadow string',
  },
  [TokenCategory.Elevation]: {
    validate: (value: string): boolean => {
      return ELEVATION_REGEX.test(value.trim());
    },
    description: 'Must be a numeric value (integer or decimal)',
  },
};

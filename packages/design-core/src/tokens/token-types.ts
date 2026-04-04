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
  FontSize = 'font-size',
  FontWeight = 'font-weight',
  LineHeight = 'line-height',
  LetterSpacing = 'letter-spacing',
  Breakpoint = 'breakpoint',
  ZIndex = 'z-index',
  Opacity = 'opacity',
  BorderWidth = 'border-width',
  Animation = 'animation',
  Transition = 'transition',
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

// Font size: CSS length (px, rem, em) or keywords
const FONT_SIZE_KEYWORDS = new Set([
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
  'xxx-large',
  'smaller',
  'larger',
]);

// Font weight: 100-900 numeric or keywords
const FONT_WEIGHT_REGEX = /^[1-9]00$/;
const FONT_WEIGHT_KEYWORDS = new Set(['normal', 'bold', 'lighter', 'bolder']);

// Line height: unitless number, CSS length, or keyword
const UNITLESS_NUMBER_REGEX = /^\d+(\.\d+)?$/;

// Opacity: 0-1 number or 0%-100% percentage
const OPACITY_REGEX = /^(0(\.\d+)?|1(\.0+)?)$/;
const OPACITY_PERCENT_REGEX = /^(\d{1,2}(\.\d+)?|100(\.0+)?)%$/;

// Border width keywords
const BORDER_WIDTH_KEYWORDS = new Set(['thin', 'medium', 'thick']);

// CSS positive length (no negative values)
const CSS_POSITIVE_LENGTH_REGEX = /^\d+(\.\d+)?(px|rem|em)$/;

// CSS duration: number with ms or s unit
const CSS_DURATION_REGEX = /^\d+(\.\d+)?(ms|s)$/;

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
  [TokenCategory.FontSize]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed === '0') return true;
      if (FONT_SIZE_KEYWORDS.has(trimmed.toLowerCase())) return true;
      return CSS_SPACING_REGEX.test(trimmed);
    },
    description:
      'Must be a CSS length (px, rem, em) or a size keyword (small, medium, large, etc.)',
  },
  [TokenCategory.FontWeight]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (FONT_WEIGHT_REGEX.test(trimmed)) return true;
      if (FONT_WEIGHT_KEYWORDS.has(trimmed.toLowerCase())) return true;
      return false;
    },
    description: 'Must be a numeric weight (100-900) or keyword (normal, bold, lighter, bolder)',
  },
  [TokenCategory.LineHeight]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed.toLowerCase() === 'normal') return true;
      if (UNITLESS_NUMBER_REGEX.test(trimmed)) return true;
      if (CSS_SPACING_REGEX.test(trimmed)) return true;
      return false;
    },
    description: 'Must be a unitless number, CSS length (px, rem, em), or "normal"',
  },
  [TokenCategory.LetterSpacing]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed.toLowerCase() === 'normal') return true;
      if (trimmed === '0') return true;
      return CSS_SPACING_REGEX.test(trimmed);
    },
    description: 'Must be a CSS length (px, rem, em) or "normal"',
  },
  [TokenCategory.Breakpoint]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      return CSS_POSITIVE_LENGTH_REGEX.test(trimmed);
    },
    description: 'Must be a positive CSS length (px, rem, em)',
  },
  [TokenCategory.ZIndex]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed.toLowerCase() === 'auto') return true;
      return /^-?\d+$/.test(trimmed);
    },
    description: 'Must be an integer or "auto"',
  },
  [TokenCategory.Opacity]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (OPACITY_REGEX.test(trimmed)) return true;
      if (OPACITY_PERCENT_REGEX.test(trimmed)) return true;
      return false;
    },
    description: 'Must be a number between 0-1 or a percentage (0%-100%)',
  },
  [TokenCategory.BorderWidth]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed === '0') return true;
      if (BORDER_WIDTH_KEYWORDS.has(trimmed.toLowerCase())) return true;
      return CSS_POSITIVE_LENGTH_REGEX.test(trimmed);
    },
    description: 'Must be a non-negative CSS length (px, rem, em) or keyword (thin, medium, thick)',
  },
  [TokenCategory.Animation]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return false;
      if (CSS_DURATION_REGEX.test(trimmed)) return true;
      // Allow full CSS animation shorthand
      return true;
    },
    description: 'Must be a CSS duration (e.g., 150ms, 0.3s) or animation shorthand',
  },
  [TokenCategory.Transition]: {
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return false;
      if (CSS_DURATION_REGEX.test(trimmed)) return true;
      // Allow full CSS transition shorthand
      return true;
    },
    description: 'Must be a CSS duration (e.g., 150ms, 0.3s) or transition shorthand',
  },
};

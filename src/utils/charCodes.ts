/**
 * Character code constants for path segment parsing.
 * Using character codes instead of string comparisons is significantly faster
 * in hot loops.
 */

/** ASCII code for '.' */
export const CHAR_DOT          = 46
/** ASCII code for '/' */
export const CHAR_SLASH        = 47
/** ASCII code for ':' */
export const CHAR_COLON        = 58
/** ASCII code for '*' */
export const CHAR_ASTERISK     = 42
/** ASCII code for '[' */
export const CHAR_OPEN_BRACKET  = 91
/** ASCII code for ']' */
export const CHAR_CLOSE_BRACKET = 93

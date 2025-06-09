export const EMPTY_OBJ: { readonly [key: string]: any } = {}
export const NOOP = (): void => {}

export const checkAttr = (el: Element, name: string): string | null => {
  const val = el.getAttribute(name)
  if (val != null) el.removeAttribute(name)
  return val
}

export const listen = (
  el: Element,
  event: string,
  handler: any,
  options?: any
) => {
  el.addEventListener(event, handler, options)
}

const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
    const cache: Record<string, string> = Object.create(null);
    return ((str: string) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    }) as T;
};

export const isArray: typeof Array.isArray = Array.isArray;

export const isString = (val: unknown): val is string =>
    typeof val === 'string';

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export const isSymbol = (val: unknown): val is symbol =>
    typeof val === 'symbol';

const hyphenateRE = /\B([A-Z])/g;
export const hyphenate: (str: string) => string = cacheStringFunction(
    (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase(),
);

const camelizeRE = /-(\w)/g;
export const camelize: (str: string) => string = cacheStringFunction(
  (str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
  },
);

const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText: string): NormalizedStyle {
  const ret: NormalizedStyle = {}
  cssText
    .replace(styleCommentRE, '')
    .split(listDelimiterRE)
    .forEach(item => {
      if (item) {
        const tmp = item.split(propertyDelimiterRE)
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim())
      }
    })
  return ret
}

export type NormalizedStyle = Record<string, string | number>;

export function normalizeStyle(value: unknown) : NormalizedStyle | string | undefined {
  if (isArray(value)) {
    const res: NormalizedStyle = {}
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      const normalized = isString(item)
        ? parseStringStyle(item)
        : (normalizeStyle(item) as NormalizedStyle)
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key]
        }
      }
    }
    return res
  } else if (isString(value) || isObject(value)) {
    return value
  }
}

export function normalizeClass(value: unknown): string {
    let res = '';
    if (isString(value)) {
        res = value
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i])
            if (normalized) {
                res += normalized + ' '
            }
        }
    } else if (isObject(value)) {
        for (const name in value) {
            if (value[name]) {
                res += name + ' '
            }
        }
    }

    return res.trim()
}

export const extend: typeof Object.assign = Object.assign

export const objectToString: typeof Object.prototype.toString =
  Object.prototype.toString

export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === '[object Date]'

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'

function looseCompareArrays(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  let equal = true
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i])
  }
  return equal
}

export function looseEqual(a: any, b: any): boolean {
  if (a === b) return true
  let aValidType = isDate(a)
  let bValidType = isDate(b)
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false
  }
  aValidType = isSymbol(a)
  bValidType = isSymbol(b)
  if (aValidType || bValidType) {
    return a === b
  }
  aValidType = isArray(a)
  bValidType = isArray(b)
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false
  }
  aValidType = isObject(a)
  bValidType = isObject(b)
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false
    }
    const aKeysCount = Object.keys(a).length
    const bKeysCount = Object.keys(b).length
    if (aKeysCount !== bKeysCount) {
      return false
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key)
      const bHasKey = b.hasOwnProperty(key)
      if (
        (aHasKey && !bHasKey) ||
        (!aHasKey && bHasKey) ||
        !looseEqual(a[key], b[key])
      ) {
        return false
      }
    }
  }
  return String(a) === String(b)
}

export function looseIndexOf(arr: any[], val: any): number {
  return arr.findIndex(item => looseEqual(item, val))
}

export const toNumber = (val: any): any => {
  const n = isString(val) ? Number(val) : NaN
  return isNaN(n) ? val : n
}

export const remove = <T>(arr: T[], el: T): void => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}

export const toRawType = (value: unknown): string => {
  return toTypeString(value).slice(8, -1)
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key)

export function makeMap(str: string): (key: string) => boolean {
  const map = Object.create(null)
  for (const key of str.split(',')) map[key] = 1
  return val => val in map
}

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const isIntegerKey = (key: unknown): boolean =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key

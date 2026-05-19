export const cx = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter((c): c is string => !!c).join(' ');

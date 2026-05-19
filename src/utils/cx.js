// Tiny classNames helper: keeps only truthy strings.
//   cx('a', cond && 'b', other && 'c') -> "a b" / "a c" / "a b c"
export const cx = (...classes) => classes.filter(Boolean).join(' ');

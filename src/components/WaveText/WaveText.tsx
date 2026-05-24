'use client';

import type { ElementType, MouseEvent, CSSProperties } from 'react';
import { cx } from '../../utils/cx';
import './WaveText.css';

const NBSP = ' ';

type Props = {
  text: string;
  className?: string;
  as?: ElementType;
  'aria-hidden'?: boolean | 'true' | 'false';
  'data-index'?: string;
};

const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
  const wrapper = e.currentTarget;
  if (wrapper.classList.contains('is-animating')) return;
  const chars = wrapper.querySelectorAll('.wave-char');
  const lastChar = chars[chars.length - 1];
  if (!lastChar) return;
  wrapper.classList.add('is-animating');
  const onAnimationEnd = () => {
    if (wrapper.isConnected) wrapper.classList.remove('is-animating');
  };
  lastChar.addEventListener('animationend', onAnimationEnd, { once: true });
};

const WaveText = ({
  text,
  className = '',
  as: Tag = 'span',
  'aria-hidden': ariaHidden,
  'data-index': dataIndex,
}: Props) => (
  <Tag
    className={cx('identity-wrapper', className)}
    onMouseEnter={handleMouseEnter}
    aria-hidden={ariaHidden}
    data-index={dataIndex}
  >
    {text.split('').map((char, i) => (
      <span key={i} className={char === ' ' ? 'wave-char wave-char-space' : 'wave-char'} style={{ '--i': i } as CSSProperties}>
        {char === ' ' ? NBSP : char}
      </span>
    ))}
  </Tag>
);

export default WaveText;

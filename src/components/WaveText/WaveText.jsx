import { cx } from '../../utils/cx';

const NBSP = ' ';

const handleMouseEnter = (e) => {
  const wrapper = e.currentTarget;
  if (wrapper.classList.contains('is-animating')) return;
  const chars = wrapper.querySelectorAll('.wave-char');
  const lastChar = chars[chars.length - 1];
  if (!lastChar) return;
  wrapper.classList.add('is-animating');
  const onAnimationEnd = () => {
    wrapper.classList.remove('is-animating');
    lastChar.removeEventListener('animationend', onAnimationEnd);
  };
  lastChar.addEventListener('animationend', onAnimationEnd);
};

const WaveText = ({ text, className = '', as: Tag = 'span' }) => (
  <Tag className={cx('identity-wrapper', className)} onMouseEnter={handleMouseEnter}>
    {text.split('').map((char, i) => (
      <span key={i} className="wave-char" style={{ '--i': i }}>
        {char === ' ' ? NBSP : char}
      </span>
    ))}
  </Tag>
);

export default WaveText;

import './TitleLine.css';

type TitleLineProps = {
  text: string;
  outline?: boolean;
};

const TitleLine = ({ text, outline = false }: TitleLineProps) => (
  <span className={`title-line ${outline ? 'outline' : ''}`}>{text}</span>
);

export default TitleLine;

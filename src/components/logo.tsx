interface LogoProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function Logo({ size = 400, style, ...props }: LogoProps) {
  return (
    <img
      src="/logo-dark-full.png"
      alt="Logo"
      style={{
        width: size,
        height: 'auto',
        display: 'block',
        ...style,
      }}
      {...props}
    />
  );
}

import React from 'react';
import { Icon } from '@iconify/react';

export default function IconifyIcon({
  icon,
  className = '',
  style,
  color,
  ...rest
}) {
  if (!icon) return null;

  const mergedStyle = {
    ...(style || {}),
    ...(color ? { color } : null),
  };

  return <Icon icon={icon} className={className} style={mergedStyle} {...rest} />;
}


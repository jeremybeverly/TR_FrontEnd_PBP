export const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') return null;

  const clean = value.replace(/\\/g, '/').trim();   
  if (!clean) return null;

  if (/^https?:\/\//i.test(clean)) return clean;     
  if (clean.startsWith('/uploads/')) return clean;   
  if (clean.startsWith('uploads/'))  return `/${clean}`;
  return `/uploads/${clean}`;                       
};

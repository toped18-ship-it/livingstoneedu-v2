import * as Icons from 'lucide-react';

interface SubjectIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function SubjectIcon({ name, className = '', size = 20 }: SubjectIconProps) {
  // Safe lookup for Lucide Icon components
  // In case the icon doesn't exist, fallback to "BookOpen"
  const IconComponent = (Icons as any)[name] || Icons.BookOpen;
  
  return <IconComponent className={className} size={size} />;
}

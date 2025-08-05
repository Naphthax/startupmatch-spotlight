// src/components/library/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // Für Buttons oder andere Aktionen
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b pb-4 mb-6">
      <div className="grid gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
/**
 * Placeholder components for removed dependencies
 * These were removed to reduce bundle size
 * If you need these features, install the required dependencies and replace these stubs
 */

import React from 'react';

// Stub for UnderlineShape (removed dependency: custom component)
export const UnderlineShape = (props: any) => null;

// Stub for PageHeader (removed: custom component)
export const PageHeader = ({ title }: { title?: string }) => (
  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{title}</div>
);

// Stub for CardTitle (removed: custom component)
export const CardTitle = ({ children, title, description, actions, withBorder, ...rest }: any) => (
  <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }} {...rest}>
    {title || children}
    {description && <div style={{ fontSize: '0.875rem', fontWeight: 400, color: '#666', marginTop: '0.25rem' }}>{description}</div>}
    {actions && <div style={{ marginTop: '0.5rem' }}>{actions}</div>}
  </div>
);

// Stub for AddButton (removed: custom component)
export const AddButton = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => (
  <button onClick={onClick} style={{ padding: '0.5rem 1rem' }}>
    {children || 'Add'}
  </button>
);

// Stub for ExportButton (removed: custom component)
export const ExportButton = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} style={{ padding: '0.5rem 1rem' }}>Export</button>
);

// Stub for LinkChip (removed: custom component)
export const LinkChip = ({ children }: { children: React.ReactNode }) => (
  <span style={{ padding: '0.25rem 0.5rem', background: '#eee', borderRadius: '4px' }}>{children}</span>
);

// Stub for ColorSchemeToggler (removed: custom component)
export const ColorSchemeToggler = () => null;

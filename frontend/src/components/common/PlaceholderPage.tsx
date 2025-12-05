/**
 * Placeholder Page Component
 * Used as a stub for pages not yet implemented
 */

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        {icon && <div className="text-6xl mb-4">{icon}</div>}
        <h1 className="text-2xl font-bold text-base-content mb-2">{title}</h1>
        {description && (
          <p className="text-base-content/60">{description}</p>
        )}
        <div className="mt-4">
          <span className="loading loading-dots loading-lg text-primary"></span>
        </div>
        <p className="text-sm text-base-content/40 mt-4">
          Страница в разработке...
        </p>
      </div>
    </div>
  );
}

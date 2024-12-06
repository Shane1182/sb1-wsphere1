import React from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className="tabs" data-active={activeTab}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={`inline-flex p-1 bg-gray-100 rounded-lg mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps & { activeTab?: string; setActiveTab?: (value: string) => void }) {
  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
        ${value === (arguments[0] as any).activeTab
          ? 'bg-white text-blue-600 shadow'
          : 'text-gray-600 hover:text-gray-900'
        }`}
      onClick={() => (arguments[0] as any).setActiveTab?.(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps & { activeTab?: string }) {
  if (value !== (arguments[0] as any).activeTab) return null;
  return <div className="mt-4">{children}</div>;
}
import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className, 
  ...props 
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || '')
  
  const handleTabChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue)
    } else {
      setActiveTab(newValue)
    }
  }
  
  const currentValue = value !== undefined ? value : activeTab
  
  return (
    <div className={cn('', className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab: currentValue,
            onTabChange: handleTabChange
          })
        }
        return child
      })}
    </div>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onTabChange?: (value: string) => void
}

const TabsList: React.FC<TabsListProps> = ({ 
  className, 
  children, 
  activeTab, 
  onTabChange, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1',
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            onTabChange
          })
        }
        return child
      })}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  activeTab?: string
  onTabChange?: (value: string) => void
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  activeTab, 
  onTabChange, 
  className, 
  children, 
  ...props 
}) => {
  const isActive = activeTab === value
  
  return (
    <button
      onClick={() => onTabChange?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeTab?: string
}

const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  activeTab, 
  className, 
  children, 
  ...props 
}) => {
  if (activeTab !== value) return null
  
  return (
    <div className={cn('mt-2', className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

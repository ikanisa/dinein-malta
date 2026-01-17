import React from 'react';
import { clsx } from 'clsx';

// Table Context for shared styling
const TableContext = React.createContext<{ variant: 'default' | 'glass' }>({ variant: 'default' });

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    /** Visual variant */
    variant?: 'default' | 'glass';
    /** Full width */
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({
    variant = 'default',
    fullWidth = true,
    className,
    children,
    ...props
}) => {
    return (
        <TableContext.Provider value={{ variant }}>
            <div className={clsx(
                'overflow-x-auto rounded-xl',
                variant === 'glass' && 'bg-glass backdrop-blur-lg border border-glassBorder shadow-glass',
                fullWidth && 'w-full'
            )}>
                <table
                    className={clsx(
                        'min-w-full text-sm',
                        fullWidth && 'w-full',
                        className
                    )}
                    {...props}
                >
                    {children}
                </table>
            </div>
        </TableContext.Provider>
    );
};

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
    className,
    children,
    ...props
}) => {
    const { variant } = React.useContext(TableContext);

    return (
        <thead
            className={clsx(
                'text-left text-muted text-xs uppercase tracking-wider',
                variant === 'default' && 'bg-surface-highlight',
                variant === 'glass' && 'bg-surface-highlight/50',
                className
            )}
            {...props}
        >
            {children}
        </thead>
    );
};

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({
    className,
    children,
    ...props
}) => {
    return (
        <tbody
            className={clsx('divide-y divide-border', className)}
            {...props}
        >
            {children}
        </tbody>
    );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    /** Highlight row on hover */
    hoverable?: boolean;
    /** Selected state */
    selected?: boolean;
    children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({
    hoverable = true,
    selected = false,
    className,
    children,
    ...props
}) => {
    return (
        <tr
            className={clsx(
                'transition-colors duration-fast',
                hoverable && 'hover:bg-surface-highlight',
                selected && 'bg-primary-500/10',
                className
            )}
            {...props}
        >
            {children}
        </tr>
    );
};

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    /** Cell type */
    as?: 'td' | 'th';
    children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({
    as: Component = 'td',
    className,
    children,
    ...props
}) => {
    return (
        <Component
            className={clsx(
                'px-4 py-3 text-foreground',
                Component === 'th' && 'font-semibold',
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
};

// Convenience export
export const TableHead = TableCell;

export default Table;

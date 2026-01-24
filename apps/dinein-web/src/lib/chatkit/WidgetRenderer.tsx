import { Button } from '@/components/ui/Button'; // Assuming existing UI lib
// We will create wrappers for standard UI components to match ChatKit props if needed
// Or simply map them if they are close enough

interface WidgetProps {
    type: string;
    props: Record<string, unknown>;
}

export function WidgetRenderer({ type, props }: WidgetProps) {
    switch (type) {
        case 'Button':
            return <ChatKitButton {...props} />;
        case 'Title':
            return <h3 className="text-lg font-bold">{(props.value as string)}</h3>;
        case 'Text':
            return <p className="text-sm text-slate-700">{(props.value as string)}</p>;
        case 'Card':
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">{(props.children as any[])?.map((child: any, i: number) => (
                <WidgetRenderer key={i} type={child.type} props={child.props} />
            ))}</div>;
        default:
            return <div className="text-xs text-red-500">Unknown widget: {type}</div>;
    }
}

// Wrapper for Button to handle actions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Wrapper for Button to handle actions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChatKitButton({ label, onClickAction }: any) {
    const handleClick = () => {
        if (onClickAction) {
            console.log("Dispatching Action:", onClickAction);
            // In a real implementation, we would call sendAction from context
        }
    };

    return (
        <Button onClick={handleClick} className="w-full">
            {label}
        </Button>
    );
}

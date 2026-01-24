import { CheckCircle, Loader } from 'lucide-react';

export type StepStatus = 'completed' | 'active' | 'pending';

interface TimelineStepProps {
    label: string;
    time: string;
    status: StepStatus;
    isLast?: boolean;
}

export function TimelineStep({ label, time, status, isLast = false }: TimelineStepProps) {
    return (
        <div className="flex gap-4">
            {/* Icon + Line */}
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'completed' ? 'bg-emerald-500' :
                        status === 'active' ? 'bg-emerald-500 animate-pulse' :
                            'bg-slate-200'
                    }`}>
                    {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                    ) : status === 'active' ? (
                        <Loader className="w-5 h-5 text-white animate-spin" />
                    ) : (
                        <div className="w-3 h-3 bg-slate-400 rounded-full" />
                    )}
                </div>
                {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-8 ${status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`} />
                )}
            </div>

            {/* Content */}
            <div className="pb-6">
                <p className={`font-semibold ${status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                    {label}
                </p>
                <p className={`text-sm ${status === 'pending' ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                    {time}
                </p>
            </div>
        </div>
    );
}

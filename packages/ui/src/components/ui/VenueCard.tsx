import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface VenueCardProps {
    id: string;
    name: string;
    slug: string;
    country: 'RW' | 'MT';
    className?: string;
    featured?: boolean;
    image?: string;
}

export function VenueCard({ name, slug, country, className, featured, image }: VenueCardProps) {
    return (
        <Link
            to={`/v/${slug}`}
            className={cn(
                "group flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition-all hover:bg-muted/50 active:scale-[0.98]",
                featured && "border-primary/50 bg-primary/5 hover:bg-primary/10",
                className
            )}
        >
            <div>
                <div className="flex justify-between items-start">
                    <h2 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                        {name}
                    </h2>
                    {/* Placeholder for image if we want to use it later */}
                    {image && <span className="sr-only">Image available: {image}</span>}
                    {featured && (
                        <Badge variant="brand" className="ml-2 shrink-0">
                            Featured
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                        "inline-block w-2.5 h-2.5 rounded-full",
                        country === 'RW' ? 'bg-yellow-500 shadow-yellow-500/50 shadow-sm' : 'bg-blue-500 shadow-blue-500/50 shadow-sm'
                    )} />
                    <p className="text-sm text-muted-foreground font-medium">
                        {country === 'RW' ? 'Rwanda • MoMo' : 'Malta • Revolut'}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    Explore Menu
                </span>
            </div>
        </Link>
    );
}

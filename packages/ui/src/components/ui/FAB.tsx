import { motion } from 'framer-motion';
import { Scan } from 'lucide-react';
// import { useHaptic } from '@/hooks/useHaptic';

export function FAB({ onClick }: { onClick: () => void }) {
    // const { trigger } = useHaptic();

    return (
        <motion.button
            onClick={() => {
                // trigger('medium');
                onClick();
            }}
            className="fixed bottom-24 right-4 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50 flex items-center justify-center focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
        >
            <Scan size={28} className="text-white" />
        </motion.button>
    );
}

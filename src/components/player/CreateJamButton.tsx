import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateJamModal } from '@/components/jam/CreateJamModal';

interface CreateJamButtonProps {
  className?: string;
}

export function CreateJamButton({ className }: CreateJamButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "relative px-6 py-3 rounded-xl font-bold text-lg uppercase tracking-wider",
          "button-jam-silver-neon",
          "text-zinc-900",
          "transition-all duration-300",
          "flex items-center gap-2",
          className
        )}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        aria-label="Criar sessão JAM colaborativa"
      >
        <Users className="w-5 h-5" />
        <span>Criar JAM</span>
        
        {/* Pulse ring animation */}
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-zinc-300/50"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ 
            opacity: [0.5, 0, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      <CreateJamModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}

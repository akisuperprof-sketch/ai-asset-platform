import { motion } from 'framer-motion';

export function NinjaEmptyState({ message = "まだ見つからない…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="relative mb-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/brand/ninja-char-2.png" alt="Not found" className="w-32 h-32 opacity-30 grayscale object-contain" />
        </motion.div>
        
        {/* Smoke trail hiding the ninja */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">隠れ身の術</h3>
      <p className="text-secondary text-sm max-w-sm">
        {message}
        <br />
        別のキーワードで検索するか、今後の追加をお待ちください。
      </p>
    </div>
  );
}

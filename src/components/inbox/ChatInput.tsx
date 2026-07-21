import { Smile, Paperclip, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatInputProps {
 inputText: string;
 setInputText: (text: string) => void;
 onSendMessage: () => void;
 onSuggestReply: () => void;
 aiLoading: boolean;
 isEmojiPickerOpen: boolean;
 setIsEmojiPickerOpen: (open: boolean) => void;
}

export const ChatInput = ({
 inputText,
 setInputText,
 onSendMessage,
 onSuggestReply,
 aiLoading,
 isEmojiPickerOpen,
 setIsEmojiPickerOpen
}: ChatInputProps) => {
 return (
 <footer className="w-full bg-white dark:bg-[#0a0a0f] border-t border-slate-100 dark:border-white/5 py-3 px-4 relative z-30">
 <AnimatePresence>
 {isEmojiPickerOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute bottom-full mb-3 left-4 p-3 bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/10 rounded-none z-50 grid grid-cols-8 gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar"
 >
 {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'].map(emoji => (
 <button
 key={emoji}
 onClick={() => setInputText(inputText + emoji)}
 className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-white/5 rounded-none "
 >
 {emoji}
 </button>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 <div className="flex items-center gap-2 w-full">
 <div className="flex items-center gap-1 flex-shrink-0">
 <button
 onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
 className={`p-2.5 rounded-none ${isEmojiPickerOpen ? "bg-black dark:bg-white text-white dark:text-black" : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"}`}
 >
 <Smile size={20} />
 </button>
 </div>

 <div className="flex-1 bg-slate-100 dark:bg-[#1a1a24] rounded-none px-5 py-1.5 flex items-center min-w-0 border border-transparent focus-within:border-slate-200 dark:focus-within:border-white/10 ">
 <textarea
 rows={1}
 placeholder="Type a message..."
 value={inputText}
 onChange={(e) => setInputText(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 onSendMessage();
 }
 }}
 className="w-full bg-transparent border-none text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-500 outline-none resize-none py-2.5 max-h-[120px]"
 />
 <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white ">
 <Paperclip size={18} />
 </button>
 </div>

 <button
 onClick={onSendMessage}
 disabled={!inputText.trim()}
 className={`p-3.5 rounded-none flex-shrink-0 ${ !inputText.trim() ? "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed " : "bg-black dark:bg-white text-white dark:text-black hover:scale-105 dark:" }`}
 >
 <Send size={18} strokeWidth={3} />
 </button>
 </div>
 </footer>
 );
};

import {X} from 'lucide-react';
import {DialogContent as BaseDialogContent,DialogClose} from '@/components/ui/dialog';

export function DialogContent({children,className}:{children:React.ReactNode;className?:string}) {return <BaseDialogContent className={className} showCloseButton={false}>{children}<DialogClose className="icon-button modal-close" aria-label="Cerrar"><X size={20}/></DialogClose></BaseDialogContent>;}

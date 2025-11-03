"use client"

// 为避免额外的 Radix 依赖，这里直接复用已经存在的 dialog 组件。
// API 维持 AlertDialog 的命名，方便现有调用保持不变。

export {
  Dialog as AlertDialog,
  DialogTrigger as AlertDialogTrigger,
  DialogPortal as AlertDialogPortal,
  DialogOverlay as AlertDialogOverlay,
  DialogContent as AlertDialogContent,
  DialogHeader as AlertDialogHeader,
  DialogFooter as AlertDialogFooter,
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription,
  DialogClose as AlertDialogAction,
  DialogClose as AlertDialogCancel,
} from "@/components/ui/dialog"

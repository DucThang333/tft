import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { ensureSkillDescriptionHtml } from './skillDescriptionHtml'

export interface SkillDescriptionEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
}

export function SkillDescriptionEditor({ value, onChange, disabled = false }: SkillDescriptionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#6BB3E0] underline underline-offset-2 hover:text-[#9ECFFF]',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: ensureSkillDescriptionHtml(value),
    editable: !disabled,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] focus:outline-none text-sm leading-relaxed text-on-surface ' +
          '[&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [editor, disabled])

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL liên kết', prev?.trim() ? prev : 'https://')
    if (url === null) return
    const trimmed = url.trim()
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
  }

  if (!editor) {
    return (
      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest min-h-[120px] animate-pulse" />
    )
  }

  return (
    <div
      className={`rounded-lg border border-outline-variant/30 bg-surface-container-lowest overflow-hidden ${
        disabled ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div className="flex flex-wrap gap-1 border-b border-outline-variant/20 bg-surface-container-low/50 px-2 py-1.5">
        <ToolbarBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Đậm"
        >
          B
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Nghiêng"
        >
          <span className="italic">I</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('link')}
          onClick={setLink}
          title="Liên kết (chọn chữ rồi bấm)"
        >
          🔗
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Danh sách"
        >
          •
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} className="px-2 py-1" />
      <p className="px-2 pb-1.5 text-[10px] text-on-surface-variant/80 leading-snug">
        Placeholder: <code className="text-on-surface-variant">{'{{tham_so}}'}</code>, sát thương kết hợp{' '}
        <code className="text-on-surface-variant">{'{{sum:ad:ap}}'}</code> hoặc main là tham số 1/2:{' '}
        <code className="text-on-surface-variant">{'{{sum:ad:ap:1}}'}</code> /{' '}
        <code className="text-on-surface-variant">{'{{sum:ad:ap:2}}'}</code>, chi tiết{' '}
        <code className="text-on-surface-variant">{'{{sum_breakdown:ad:ap}}'}</code>. Màu số theo meta scales-with (
        <code className="text-on-surface-variant">textColor</code>).
      </p>
    </div>
  )
}

function ToolbarBtn({
  children,
  active,
  onClick,
  title,
}: {
  children: ReactNode
  active: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`min-w-[2rem] h-8 rounded px-2 text-xs font-bold transition-colors ${
        active
          ? 'bg-primary/25 text-primary border border-primary/40'
          : 'bg-surface-container-high/80 text-on-surface-variant border border-transparent hover:border-outline-variant/30'
      }`}
    >
      {children}
    </button>
  )
}

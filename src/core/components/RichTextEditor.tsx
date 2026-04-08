import type { ControllerRenderProps, FieldPath, FieldValues, PathValue, UseFormReturn } from "react-hook-form";
import { createEditor, Locale, NotectlEditor, type Theme } from "@notectl/core";
import { createFullPreset } from "@notectl/core/presets";
import { useEffect, useRef } from "react";

const shadcnTheme: Theme = {
  name: "shadcn",
  primitives: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    mutedForeground: "var(--muted-foreground)",
    border: "var(--border)",
    borderFocus: "var(--ring)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    primaryMuted: "color-mix(in srgb, var(--primary) 15%, transparent)",
    surfaceRaised: "var(--secondary)",
    surfaceOverlay: "var(--secondary)",
    hoverBackground: "color-mix(in srgb, var(--muted-foreground) 20%, transparent)",
    activeBackground: "color-mix(in srgb, var(--muted-foreground) 70%, transparent)",
    danger: "var(--destructive)",
    dangerMuted: "color-mix(in srgb, var(--destructive) 15%, transparent)",
    success: "var(--success)",
    shadow: "var(--shadow)",
    focusRing: "transparent",
  },
  toolbar: {
    background: "var(--secondary)",
    borderColor: "var(--border)",
  },
};

interface IProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  field: ControllerRenderProps<TFieldValues, TName>;
  form: UseFormReturn<TFieldValues>;
  invalid?: boolean;
  locale: string;
}

export function RichTextEditor<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  field,
  form,
  invalid,
  locale,
}: IProps<TFieldValues, TName>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<NotectlEditor>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.style.outline = invalid ? "1px solid var(--destructive)" : "";
    editorRef.current.style.borderRadius = invalid ? "var(--radius)" : "";
  }, [invalid]);

  useEffect(() => {
    const preset = createFullPreset();
    let mounted = true;

    createEditor({
      autofocus: false,
      locale: Locale[locale.toUpperCase() as keyof typeof Locale],
      placeholder: "",
      theme: shadcnTheme,
      toolbar: preset.toolbar,
    }).then((editor) => {
      if (mounted && containerRef.current) {
        containerRef.current.appendChild(editor);
        editorRef.current = editor;

        editor.on("stateChange", () => {
          editor.getContentHTML().then((html: string) => {
            form.setValue(field.name, html as PathValue<TFieldValues, TName>, {
              shouldDirty: true,
              shouldValidate: true,
            });
            editor.style.outline = "";
            editor.style.borderRadius = "";
          });
        });
      }
    });

    return () => {
      mounted = false;
      editorRef.current?.destroy();
    };
  }, [field.name, form, locale]);

  return <div {...field} aria-invalid={invalid} ref={containerRef}></div>;
}

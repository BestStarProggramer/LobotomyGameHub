import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Editor = forwardRef(
  (
    {
      readOnly,
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder = "Введите текст...",
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref?.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.ownerDocument.createElement("div");
      container.appendChild(editorContainer);

      const Font = Quill.import("formats/font");
      Font.whitelist = ["bahnschrift", "sans-serif"];
      Quill.register(Font, true);

      const toolbarOptions = [
        [{ size: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }, { align: [] }],
        [{ header: 1 }, { header: 2 }, "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "video"],
        ["clean"],
      ];

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function () {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.click();

                input.onchange = () => {
                  const file = input.files[0];
                  if (file) {
                    // эту часть заменить на загрузку на сервер
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const range = quill.getSelection();
                      quill.insertEmbed(range.index, "image", e.target.result);
                      quill.setSelection(range.index + 1);
                    };
                    reader.readAsDataURL(file);
                  }
                };
              },
            },
          },
        },
        placeholder,
      });

      const editorElem = editorContainer.querySelector(".ql-editor");
      if (editorElem) {
        editorElem.style.color = "white";
        editorElem.style.fontFamily = "'Bahnschrift', sans-serif";
      }

      ref.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      editorContainer.style.height = "400px";
      editorContainer.style.overflowY = "auto";

      return () => {
        ref.current = null;
        container.innerHTML = "";
      };
    }, [ref, placeholder]);

    return <div ref={containerRef}></div>;
  }
);

Editor.displayName = "Editor";

export default Editor;

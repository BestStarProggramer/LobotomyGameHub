import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { makeRequest } from "../../axios";

const Editor = forwardRef(
  (
    {
      readOnly,
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder = "Введите текст...",
      publicationId = null,
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const quillInstance = useRef(null);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref?.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    const imageHandler = () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const formData = new FormData();
          formData.append("file", file);

          if (publicationId) {
            formData.append("publicationId", publicationId);
          }

          try {
            const res = await makeRequest.post(
              "/publications/upload-image",
              formData
            );

            const url = res.data.url;
            const quill = quillInstance.current;

            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", url);
            quill.setSelection(range.index + 1);
          } catch (err) {
            console.error("Image upload failed", err);
            alert("Ошибка при загрузке изображения");
          }
        }
      };
    };

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
              image: imageHandler,
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
      quillInstance.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(quill.clipboard.convert(defaultValueRef.current));
      } else if (typeof defaultValueRef.current === "string") {
        quill.clipboard.dangerouslyPasteHTML(defaultValueRef.current);
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
        quillInstance.current = null;
        container.innerHTML = "";
      };
    }, [placeholder, publicationId]);

    return <div ref={containerRef}></div>;
  }
);

Editor.displayName = "Editor";

export default Editor;

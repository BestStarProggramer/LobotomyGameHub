import { createContext, useState } from "react";
import ConfirmationModal from "../components/confirmationmodal/ConfirmationModal";

export const ModalContext = createContext();

export const ModalContextProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openModal = (title, message, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal.isOpen && (
        <ConfirmationModal
          title={modal.title}
          message={modal.message}
          onConfirm={handleConfirm}
          onCancel={closeModal}
        />
      )}
    </ModalContext.Provider>
  );
};

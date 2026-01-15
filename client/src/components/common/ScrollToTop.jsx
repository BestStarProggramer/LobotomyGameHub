import React, { useState, useEffect } from "react";
import { Fab, Zoom } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Zoom in={show}>
      <div
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 1000,
        }}
      >
        <Fab
          size="medium"
          aria-label="scroll back to top"
          sx={{
            backgroundColor: "#7b2cbf",

            color: "#ffffff",

            "&:hover": {
              backgroundColor: "#9d4edd",
              transform: "translateY(-3px)",
            },
            transition: "all 0.3s ease-in-out",
            boxShadow: "0 4px 15px rgba(123, 44, 191, 0.4)",
          }}
        >
          <KeyboardArrowUpIcon fontSize="large" />
        </Fab>
      </div>
    </Zoom>
  );
};

export default ScrollToTop;

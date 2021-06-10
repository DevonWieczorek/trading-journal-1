import React from "react";
import "./style.scss";

const Input = ({ label, handler, placeholder, type = "text", ...otherProps }) => {
  return (
    <>
      {label ? (
        <label htmlFor="label" className="label">
          {label}
        </label>
      ) : null}
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        onChange={handler}
        {...otherProps}
      />
    </>
  );
};

export default Input;

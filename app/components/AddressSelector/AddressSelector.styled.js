"use client";

import styled from "styled-components";
import media from "../../lib/media";

const AddressSelectorStyles = styled.section`
  padding: 30px;
  border: 1px solid #000;
  margin-bottom: 30px;

  ${media.minDevicePixelRatio2`
    border-width: 0.5px;
  `}

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .field {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;

    ${media.tabletPortraitAndBelow`
      grid-template-columns: 1fr;
    `}
  }

  label {
    margin-bottom: 5px;
    font-weight: 500;
  }

  input,
  select {
    padding: 10px;
    border: 1px solid #000;
    background: #fff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  input:focus,
  select:focus {
    outline: 2px solid #000;
  }

  .custom-fields {
    margin-top: 20px;
  }
`;

export default AddressSelectorStyles;

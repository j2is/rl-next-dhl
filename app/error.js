"use client";

import { useEffect } from "react";
import styled from "styled-components";

const ErrorStyles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  p {
    margin-bottom: 20px;
  }

  button {
    padding: 12px 24px;
    background: #000;
    color: #fff;
    border: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    cursor: pointer;
  }

  button:hover {
    background: #333;
  }
`;

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);

    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }, [error]);

  return (
    <ErrorStyles>
      <h1>Something went wrong</h1>
      <p>An error occurred while processing your request.</p>
      <button onClick={() => reset()}>Try again</button>
    </ErrorStyles>
  );
}

"use client";

import Link from "next/link";
import styled from "styled-components";
import media from "./lib/media";

const NotFoundStyles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;

  h1 {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 20px;

    ${media.tabletPortraitAndBelow`
      font-size: 36px;
    `}
  }

  p {
    font-size: 14px;
    margin-bottom: 30px;
  }

  a {
    padding: 12px 24px;
    border: 1px solid #000;
    text-decoration: none;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}

    ${media.hoverOnly`
      &:hover {
        background: #000;
        color: #fff;
      }
    `}
  }
`;

export default function NotFound() {
  return (
    <NotFoundStyles>
      <h1>404</h1>
      <p>Page not found</p>
      <Link href="/">Return to Homepage</Link>
    </NotFoundStyles>
  );
}

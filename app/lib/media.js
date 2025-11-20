import { css } from "styled-components";

// Media breakpoints
const desktopXL = 2080;
const desktop = 1280;
const tabletLandscape = 1024;
const tablet = 990;
const mobileLandscape = 520;
const mobile = 320;

// Don't change these
const downSizes = {
  smallDesktopAndBelow: desktop,
  tabletLandscapeAndBelow: tabletLandscape,
  tabletPortraitAndBelow: tablet,
  mobileOnly: mobileLandscape,
  mobilePortraitAndBelow: mobile
};

const upSizes = {
  xlDesktopAndUp: desktopXL + 1,
  desktopAndUp: desktop + 1,
  tabletLandscapeAndUp: tabletLandscape + 1,
  tabletPortraitAndUp: tablet + 1
};

// Iterate through the sizes and create a media template
const media = {};
Object.entries(downSizes).forEach(([key]) => {
  media[key] = (...args) => css`
    @media (max-width: ${downSizes[key]}px) {
      ${css(...args)};
    }
  `;
});

Object.entries(upSizes).forEach(([key]) => {
  media[key] = (...args) => css`
    @media (min-width: ${upSizes[key]}px) {
      ${css(...args)};
    }
  `;
});

media.minDevicePixelRatio2 = (...args) => css`
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    ${css(...args)};
  }
`;

media.hoverOnly = (...args) => css`
  @media (hover: hover) {
    ${css(...args)};
  }
`;

media.hoverNone = (...args) => css`
  @media (hover: none) {
    ${css(...args)};
  }
`;

export default media;

import "./globals.css";
import StyledComponentsRegistry from "./lib/registry";
import SentryInit from "./components/SentryInit/SentryInit";
import { Toaster } from "sonner";

export const metadata = {
  title: "DHL Landed Cost Calculator | Ratsey & Lapthorn",
  description: "Calculate landed costs for international shipments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <SentryInit />
          {children}
          <Toaster position="top-right" theme="light" />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
